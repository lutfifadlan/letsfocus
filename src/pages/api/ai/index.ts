import { NextApiRequest, NextApiResponse } from 'next';
import { User, UserPlan } from '@/lib/models';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { todolistsInput, modelType } = req.body;

  const prompt = `Create a to-do list based on the following input: ${todolistsInput}. Provide an array of tasks with titles only.
  Don't include numbers of tasks or any other additional characters or text please. Don't include bullet points or any other formatting.`;

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.email) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const user = await User.findOne({ email: session.user.email, isDeleted: false })

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const userPlan = await UserPlan.findOne({ userId: user._id, isDeleted: false })

  if (!userPlan) {
    return res.status(404).json({ message: 'User plan not found' });
  }

  if (userPlan.credit <= 0 && modelType !== 'openrouter') {
    return res.status(400).json({ message: 'Insufficient credits' });
  }

  let apiUrl = '';
  let headers = {};
  let model = '';

  if (modelType === 'openai') {
    apiUrl = 'https://api.openai.com/v1/chat/completions';
    headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    };
    model = 'gpt-4o';
  } else if (modelType === 'openrouter') {
    apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    };
    model = 'meta-llama/llama-3.2-3b-instruct:free';
  } else {
    return res.status(400).json({ message: 'Invalid API type' });
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 1000,
    }),
  });

  const data = await response.json();
  // Extract task titles from the response
  const tasks = data.choices[0].message.content.split('\n').map((task: string) => task.trim()).filter((task: string) => task);

  res.status(200).json({ tasks });
}
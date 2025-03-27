import { NextApiRequest, NextApiResponse } from 'next';
import { AI, User, UserPlan } from '@/lib/models';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { todolistsInput } = req.body;

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

  const userPlan = await UserPlan.findOne({ userId: user._id })

  if (!userPlan) {
    return res.status(404).json({ message: 'User plan not found' });
  }

  const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
  };
  const model = 'meta-llama/llama-3.2-3b-instruct:free';

  let response;
  try {
    response = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 1000,
      }),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate to-do list', error: (error as Error).message });
  }

  const data = await response.json();
  const tasks = data.choices[0].message.content.split('\n').map((task: string) => task.trim()).filter((task: string) => task);

  const ai = new AI({
    userId: user._id,
    input: todolistsInput,
    output: tasks,
    modelType: 'llama-3.2-3b-instruct',
    inputTokens: data.usage.prompt_tokens,
    outputTokens: data.usage.completion_tokens,
  });

  await ai.save();

  res.status(200).json({ tasks });
}
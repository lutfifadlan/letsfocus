import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '@/lib/models';
import { connectDB } from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const { token } = req.query;

  await connectDB();

  const user = await User.findById(token);

  if (!user) {
    return res.status(400).json({ message: 'Invalid token' });
  }

  user.isVerified = true;
  await user.save();

  // Redirect to /signin with a success message
  res.redirect(302, '/signin?verified=true');
}
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { User } from '@/lib/models';
import { connectDB } from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.email) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      const user = await User.findOne({ email: session.user.email, isDeleted: false });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(user);
    } else if (req.method === 'PUT') {
      const { isFirstLogin } = req.body;
      const user = await User.findOne({ email: session.user.email, isDeleted: false });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.isFirstLogin = isFirstLogin;
      await user.save();

      res.status(200).json(user);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

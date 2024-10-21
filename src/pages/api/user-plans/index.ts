import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { UserPlan, User } from '@/lib/models';
import { connectDB } from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.email) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    await connectDB();

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    switch (req.method) {
      case 'GET':
        const userPlan = await UserPlan.findOne({ userId: user._id })
          .sort({ createdAt: -1 });

        if (!userPlan) {
          return res.status(404).json({ message: 'Plan details not found' });
        }

        res.status(200).json(userPlan);
        break;
      case 'POST':
        const newPlan = new UserPlan({
          userId: user._id,
        });

        await newPlan.save();

        res.status(201).json(newPlan);
        break;
      case 'PUT':
        const { plan } = req.body;

        const existingPlan = await UserPlan.findOne({ userId: user._id })
          .sort({ createdAt: -1 });

        if (!existingPlan) {
          return res.status(404).json({ message: 'Plan not found' });
        }

        existingPlan.plan = plan;
        await existingPlan.save();

        res.status(200).json(existingPlan);
        break;
      default:
        res.status(405).json({ message: 'Method not allowed' });
        break;
    }
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

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

    // Find the user by email
    const user = await User.findOne({ email: session.user.email, isDeleted: false });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    switch (req.method) {
      case 'GET':
        // Handle GET request: Fetch user's plan
        const userPlan = await UserPlan.findOne({ userId: user._id, isDeleted: false })
          .sort({ createdAt: -1 }); // Get the most recent plan

        if (!userPlan) {
          return res.status(404).json({ message: 'Plan details not found' });
        }

        res.status(200).json(userPlan);
        break;

      case 'POST':
        // Handle POST request: Create a new plan
        const { credit } = req.body;

        if (credit == null) {
          return res.status(400).json({ message: 'Missing required fields' });
        }

        const newPlan = new UserPlan({
          nextAuthUserId: user._id,
        });

        await newPlan.save();

        res.status(201).json(newPlan);
        break;

      case 'PUT':
        // Handle PUT request: Update existing plan's credit
        const { credit: updatedCredit } = req.body;

        if (updatedCredit == null) {
          return res.status(400).json({ message: 'Credit is required' });
        }

        // Find the user's most recent plan
        const existingPlan = await UserPlan.findOne({ nextAuthUserId: user._id, isDeleted: false })
          .sort({ createdAt: -1 }); // Get the most recent plan

        if (!existingPlan) {
          return res.status(404).json({ message: 'Plan not found' });
        }

        // Update the credit
        existingPlan.credit = updatedCredit;
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

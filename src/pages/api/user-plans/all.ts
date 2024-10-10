import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/mongodb';
import { UserPlan } from '@/lib/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    const userPlansCount = await UserPlan.countDocuments({ isDeleted: false, plan: { $ne: 'FREE' } });

    res.status(200).json({ count: userPlansCount });
  } catch (error) {
    console.error('Error fetching user plans count:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

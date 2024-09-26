import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/mongodb';
import { Habit } from '@/lib/models';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await connectDB();

  switch (req.method) {
    case 'GET':
      const habits = await Habit.find({ userId: session.user.id });
      res.status(200).json(habits);
      break;
    case 'POST':
      const habit = new Habit({ ...req.body, userId: session.user.id });
      await habit.save();
      res.status(201).json(habit);
      break;
    default:
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
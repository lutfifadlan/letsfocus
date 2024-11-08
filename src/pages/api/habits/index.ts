import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Habit } from '@/lib/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await connectDB();

  switch (req.method) {
    case 'GET':
      try {
        const habits = await Habit.find({ userId: session.user.id });
        res.status(200).json(habits);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch habits' });
      }
      break;

    case 'POST':
      try {
        const habit = await Habit.create({
          title: req.body.title,
          userId: session.user.id,
          completionDates: [],
        });
        res.status(201).json(habit);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        res.status(500).json({ error: 'Failed to create habit' });
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
} 
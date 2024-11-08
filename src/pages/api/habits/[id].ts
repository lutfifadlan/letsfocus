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

  const { id } = req.query;
  await connectDB();

  switch (req.method) {
    case 'PUT':
      try {
        const habit = await Habit.findOneAndUpdate(
          { _id: id, userId: session.user.id },
          { completionDates: req.body.completionDates },
          { new: true }
        );
        if (!habit) {
          return res.status(404).json({ error: 'Habit not found' });
        }
        res.status(200).json(habit);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        res.status(500).json({ error: 'Failed to update habit' });
      }
      break;

    case 'DELETE':
      try {
        const habit = await Habit.findOneAndDelete({
          _id: id,
          userId: session.user.id,
        });
        if (!habit) {
          return res.status(404).json({ error: 'Habit not found' });
        }
        res.status(200).json({ message: 'Habit deleted successfully' });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete habit' });
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
} 
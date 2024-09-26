import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/mongodb';
import { Task, User } from '@/lib/models';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await connectDB();

  const user = await User.findOne({ nextAuthUserId: session.user.id });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const tasks = await Task.find({
          userId: user._id,
          isDeleted: false,
        });

        res.status(200).json(tasks);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'POST':
      try {
        const task = new Task({
          ...req.body,
          userId: user._id,
          isDeleted: false,
        });
        await task.save();
        res.status(201).json(task);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

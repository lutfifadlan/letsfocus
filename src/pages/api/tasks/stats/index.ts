import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/mongodb';
import { Task, User } from '@/lib/models';
import { isSameDay } from 'date-fns';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.email) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email, isDeleted: false });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  try {
    
    const today = new Date();

    const tasks = await Task.find({ userId: user._id, isDeleted: false }, 'status completedAt dueDate');

    let completedToday = 0;
    let dueToday = 0;
    let overdue = 0;

    const taskPromises = tasks.map(async (task) => {
      if (task.status === 'COMPLETED' && task.completedAt && isSameDay(new Date(task.completedAt), today)) {
        completedToday++;
      }
      if (task.dueDate && isSameDay(new Date(task.dueDate), today) && task.status !== 'COMPLETED' && task.status !== 'IGNORED') {
        dueToday++;
      }
      if (task.dueDate && new Date(task.dueDate) < today && !isSameDay(new Date(task.dueDate), today) && task.status !== 'COMPLETED' && task.status !== 'IGNORED') {
        overdue++;
      }
    });

    await Promise.all(taskPromises);

    res.status(200).json({ completedToday, dueToday, overdue });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal Server Error' });
  }
}

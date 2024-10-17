import { NextApiRequest, NextApiResponse } from 'next';
import { Task, User } from '@/lib/models';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { taskIds, tags, dueDate, priority, group, status, isDeleted, isCurrentlyFocused, tasks } = req.body;
  let completedAt = null;
  let ignoredAt = null;
  let deletedAt = null;

  if (req.method === 'PUT') {
    if (status === 'COMPLETED') {
      completedAt = new Date();
    } else if (status === 'IGNORED') {
      ignoredAt = new Date();
    } else if (status === 'DELETED') {
      deletedAt = new Date();
    }

    try {
      await Task.updateMany({ _id: { $in: taskIds }, userId: user._id }, {
        tags,
        dueDate,
        priority,
        group,
        status,
        completedAt,
        ignoredAt,
        deletedAt,
        isDeleted,
        isCurrentlyFocused,
      });
      const updatedTasks = await Task.find({ _id: { $in: taskIds }, userId: user._id });
      res.status(200).json({ message: 'Tags updated successfully', updatedTasks });
    } catch (error) {
    console.error(error);
      res.status(500).json({ error: 'Error updating tags' });
    }
  } else if (req.method === 'POST') {
    try {
      const addedTasks = tasks.map((task: typeof Task) => ({
        ...task,
        userId: user._id,
      }));
      const newTasks = await Task.create(addedTasks);
      res.status(200).json({ message: 'Tasks added successfully', tasks: newTasks });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error adding tasks' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

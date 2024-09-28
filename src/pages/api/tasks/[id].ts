import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/mongodb';
import { Task, User } from '@/lib/models';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { method } = req;
  const { id: taskId } = req.query;

  const user = await User.findOne({ nextAuthUserId: session.user.id });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  switch (method) {
    case 'GET':
      try {
        const task = await Task.findOne({ _id: new ObjectId(taskId as string) });
        if (!task) {
          return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json(task);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'PUT':
      try {
        const { title, status, isDeleted, description, tags, group, dueDate } = req.body;

        const updateFields: Partial<{ title: string; status: string; isDeleted: boolean; description: string; tags: string[]; group: string; dueDate: Date; completedAt: Date; deletedAt: Date }> = {};
        if (title !== undefined) updateFields.title = title;
        if (status !== undefined) updateFields.status = status;
        if (isDeleted !== undefined) updateFields.isDeleted = isDeleted;
        if (description !== undefined) updateFields.description = description;
        if (tags !== undefined) updateFields.tags = tags;
        if (group !== undefined) updateFields.group = group;
        if (dueDate !== undefined) updateFields.dueDate = dueDate;

        if (status === 'COMPLETED') {
          updateFields.completedAt = new Date();
        }

        if (isDeleted) {
          updateFields.deletedAt = new Date();
        }

        const result = await Task.updateOne(
          { _id: new ObjectId(taskId as string), userId: user._id },
          { $set: updateFields }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json({ message: 'Task updated successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'DELETE':
      try {
        const result = await Task.updateOne(
          { _id: new ObjectId(taskId as string), userId: user._id },
          { $set: { isDeleted: true, deletedAt: new Date() } }
        );
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json({ message: 'Task marked as deleted successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}

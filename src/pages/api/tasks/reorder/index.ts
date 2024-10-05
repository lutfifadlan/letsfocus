import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/mongodb';
import { Task } from '@/lib/models';
import { ObjectId } from 'mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.email) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { taskId, prevTaskId, nextTaskId } = req.body;

  try {
    await connectDB();

    const task = await Task.findOne({ _id: new ObjectId(taskId as string) });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    let newOrder;
    if (prevTaskId && nextTaskId) {
      const prevTask = await Task.findOne({ _id: new ObjectId(prevTaskId as string) });
      const nextTask = await Task.findOne({ _id: new ObjectId(nextTaskId as string) });
      newOrder = (prevTask.order + nextTask.order) / 2;
    } else if (prevTaskId) {
      const prevTask = await Task.findOne({ _id: new ObjectId(prevTaskId as string) });
      newOrder = prevTask.order + 1;
    } else if (nextTaskId) {
      const nextTask = await Task.findOne({ _id: new ObjectId(nextTaskId as string) });
      newOrder = nextTask.order - 1;
    } else {
      return res.status(400).json({ message: 'Invalid request' });
    }

    await Task.updateOne(
      { _id: new ObjectId(taskId as string) },
      { $set: { order: newOrder } }
    );

    res.status(200).json({ message: 'Task order updated successfully' });
  } catch (error) {
    console.error('Failed to update task order:', error);
    res.status(500).json({ message: 'Failed to update task order' });
  }
}
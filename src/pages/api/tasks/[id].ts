import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/mongodb';
import { Task } from '@/lib/models'
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { taskId } = req.query;

  await connectDB();

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
        const { completed } = req.body;
        const result = await Task.updateOne(
          { _id: new ObjectId(taskId as string) },
          { $set: { completed } }
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
        const result = await Task.deleteOne({ _id: new ObjectId(taskId as string) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json({ message: 'Task deleted successfully' });
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
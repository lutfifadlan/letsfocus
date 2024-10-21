import { NextApiRequest, NextApiResponse } from 'next';
import { Comment, User, UserPlan } from '@/lib/models';
import { connectDB } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  await connectDB();

  if (!session || !session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const userPlan = await UserPlan.findOne({ userId: user._id });

  if (!userPlan) {
    return res.status(404).json({ message: 'User plan not found' });
  }

  if (userPlan.plan && !userPlan.plan.toLowerCase().includes('pro')) {
    return res.status(403).json({ message: 'Upgrade to Pro to Add Comments' });
  }

  switch (req.method) {
    case 'GET':
      const { taskId } = req.query;
      const comments = await Comment.find({ userId: user._id, taskId });
      res.status(200).json(comments);
      break;
    case 'POST':
      const { taskId: postTaskId, content } = req.body;
      const newComment = new Comment({ taskId: postTaskId, userId: user._id, content });
      await newComment.save();
      res.status(201).json(newComment);
      break;
    case 'DELETE':
      const { taskId: deleteTaskId } = req.query;
      await Comment.deleteMany({ taskId: deleteTaskId, userId: user._id });
      res.status(200).json({ message: 'Comments deleted' });
      break;
  }
}

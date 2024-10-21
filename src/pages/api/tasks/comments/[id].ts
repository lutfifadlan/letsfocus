import { NextApiRequest, NextApiResponse } from 'next';
import { Comment, User, UserPlan } from '@/lib/models';
import { connectDB } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  await connectDB();

  if (!session || !session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const user = await User.findOne({ email: session.user.email, isDeleted: false });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const userPlan = await UserPlan.findOne({ userId: user._id, isDeleted: false });

  if (!userPlan) {
    return res.status(404).json({ message: 'User plan not found' });
  }

  if (userPlan.plan && !userPlan.plan.toLowerCase().includes('pro')) {
    return res.status(403).json({ message: 'User plan is not pro' });
  }

  switch (req.method) {
    case 'GET':
      const comment = await Comment.findById(req.query.id);

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      res.status(200).json(comment);
      break;

    case 'PUT':
      const { content, taskId } = req.body;
      const updatedComment = await Comment.findOneAndUpdate({ _id: req.query.id, userId: user._id, taskId }, { content }, { new: true });
      res.status(200).json(updatedComment);
      break;

    case 'DELETE':
      const { taskId: deleteTaskId } = req.body;
      console.log("req.query.id", req.query);
      await Comment.findOneAndDelete({ _id: new ObjectId(req.query.id as string), userId: user._id, taskId: deleteTaskId });
      res.status(200).json({ message: 'Comment deleted' });
      break;
  }
}

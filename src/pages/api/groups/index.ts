import { NextApiRequest, NextApiResponse } from 'next';
import { Group, User } from '@/lib/models';
import { connectDB } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const user = await User.findOne({ email: session.user.email, isDeleted: false });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  await connectDB();

  switch (req.method) {
    case 'GET':
      const groups = await Group.find({ userId: user._id, isDeleted: false });

      if (!groups) {
        return res.status(404).json({ message: 'Groups not found' });
      }

      res.status(200).json(groups);
      break;
    case 'POST':
      const { name } = req.body;
      const newGroup = new Group({ name, userId: user._id });
      await newGroup.save();
      res.status(201).json(newGroup);
      break;
    case 'PUT':
      const { groupId: putGroupId, newName } = req.body;
      const updatedGroup = await Group.findOneAndUpdate({ _id: putGroupId, userId: user._id, isDeleted: false }, { name: newName }, { new: true });
      res.status(200).json(updatedGroup);
      break;
    case 'DELETE':
      const { groupId: deleteGroupId } = req.body;
      const deletedGroup = await Group.findOneAndUpdate({ _id: deleteGroupId, userId: user._id, isDeleted: false }, { isDeleted: true }, { new: true });
      res.status(200).json(deletedGroup);
      break;
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}


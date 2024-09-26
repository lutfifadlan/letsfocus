import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/mongodb';
import { FocusTime } from '@/lib/models';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await connectDB();

  switch (req.method) {
    case 'GET':
      const focusTime = await FocusTime.findOne({ userId: session.user.id });
      res.status(200).json(focusTime ? focusTime.duration : 0);
      break;
    case 'POST':
      const focus = new FocusTime({ ...req.body, userId: session.user.id });
      await focus.save();
      res.status(201).json(focus);
      break;
    default:
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
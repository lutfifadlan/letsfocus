import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  console.log('req.body:', req.body);

  res.status(200).json({ message: 'Success' });
}
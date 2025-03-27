import { NextApiRequest, NextApiResponse } from 'next';
import { PLANS } from '@/constants';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { User } from '@/lib/models';
import { connectDB } from '@/lib/mongodb';

const xenditApiKey = process.env.NODE_ENV === 'production' ? process.env.XENDIT_API_KEY : process.env.XENDIT_TEST_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(503).json({ 
    error: "Service Unavailable",
    message: "Payments are currently disabled. All features are available for free during this period."
  });
}
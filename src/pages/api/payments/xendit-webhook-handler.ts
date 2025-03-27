import { NextApiRequest, NextApiResponse } from 'next';
import { PLANS } from '@/constants';
import { Payment, UserPlan } from '@/lib/models';

const XENDIT_CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(503).json({ 
    error: "Service Unavailable",
    message: "Payments are currently disabled. All features are available for free during this period."
  });
}
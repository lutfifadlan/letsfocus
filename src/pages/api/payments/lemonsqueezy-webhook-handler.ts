import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/mongodb';
import { User, UserPlan, Payment } from '@/lib/models';
import { buffer } from 'micro';
import crypto from 'crypto';
import { LemonSqueezyCheckoutPayload } from '@/types';
import { PLANS } from '@/constants';

const lemonsqueezyWebhookSecret = process.env.NODE_ENV === 'production' ? process.env.LEMON_SQUEEZY_WEBHOOK_SECRET : process.env.LEMON_SQUEEZY_TEST_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(503).json({ 
    error: "Service Unavailable",
    message: "Payments are currently disabled. All features are available for free during this period."
  });
}

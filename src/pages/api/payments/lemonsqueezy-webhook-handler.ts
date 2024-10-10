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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const rawBody = (await buffer(req)).toString('utf-8');
  const hmac = crypto.createHmac('sha256', lemonsqueezyWebhookSecret as string);
  const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
  const signature = Buffer.from(req.headers['x-signature'] as string, 'utf8');

  if (!crypto.timingSafeEqual(digest, signature)) {
    return res.status(400).json({
      message: 'Invalid signature.',
    });
  }

  try {
    await connectDB();

    // Parse the rawBody as JSON
    const payload: LemonSqueezyCheckoutPayload = JSON.parse(rawBody);

    const { data, meta } = payload;
    const { id, attributes } = data;
    const { total, updated_at, currency, status } = attributes;
    const { custom_data } = meta;

    if (!custom_data || !custom_data.user_id) {
      return res.status(400).json({ message: 'Missing custom data in the webhook payload' });
    }

    const { user_id } = custom_data;

    // Validate required fields
    if (!id || !user_id || !status || !total || !currency) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findOne({ nextAuthUserId: user_id, isDeleted: false });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const paidAmount = total / 100;
    const paymentStatus = status === 'paid' ? 'PAID' : 'PENDING';

    const payment = new Payment({
      userId: user._id,
      externalId: id,
      amount: paidAmount,
      status: paymentStatus,
      paidAt: updated_at,
      paymentMethod: 'Cards',
      currency: currency,
      paymentGateway: 'LEMON_SQUEEZY',
    });
    await payment.save();

    if (status === 'paid') {
      const userPlan = await UserPlan.findOne({ userId: user._id, isDeleted: false });

      if (userPlan) {
        if (paidAmount === PLANS['PRO-MONTHLY'].discountedPrice) {
          userPlan.plan = 'PRO-MONTHLY';
        } else if (paidAmount === PLANS['PRO-YEARLY'].discountedPrice) {
          userPlan.plan = 'PRO-YEARLY';
        }

        const currentDate = new Date();
        const subscriptionEndDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 1);

        userPlan.subscriptionStartDate = new Date().toISOString();
        userPlan.subscriptionEndDate = subscriptionEndDate.toISOString();

        await userPlan.save();
      } else {
        return res.status(404).json({ message: 'User plan not found' });
      }

      res.status(200).json({ message: 'Payment processed successfully', status: payment.status });
    } else {
      res.status(200).json({ message: 'Payment is pending', status: payment.status });
    }
  } catch (error) {
    console.error('Error processing Lemon Squeezy webhook:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

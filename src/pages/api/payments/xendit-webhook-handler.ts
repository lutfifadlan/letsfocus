import { NextApiRequest, NextApiResponse } from 'next';
import { PLANS } from '@/constants';
import { Payment, UserPlan } from '@/lib/models';

const XENDIT_CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const callbackToken = req.headers['x-callback-token'] as string;

    if (callbackToken !== XENDIT_CALLBACK_TOKEN) {
      console.error('Invalid callback token');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { external_id, status, amount, paid_amount, paid_at, payment_method, currency } = req.body;

    if (status !== 'PAID') {
      return res.status(200).json({ message: 'Payment not completed' });
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, userId, planType] = external_id.split('_');

      if (!userId || !planType || !(planType in PLANS)) {
        throw new Error('Invalid external_id format');
      }

      const plan = PLANS[planType as keyof typeof PLANS];
      const currentDate = new Date();
      const subscriptionEndDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));

      await UserPlan.findOneAndUpdate({
        where: {
          userId: userId,
        },
        data: {
          plan: plan.name,
          maxTasksPerMonth: plan.maxTasksPerMonth,
          updatedAt: new Date().toISOString(),
          subscriptionStartDate: new Date().toISOString(),
          subscriptionEndDate: subscriptionEndDate.toISOString(),
        }
      });

      const payment = new Payment({
        userId: userId,
        externalId: external_id,
        amount: amount,
        paidAmount: paid_amount,
        paidAt: paid_at,
        paymentMethod: payment_method,
        currency: currency,
        paymentGateway: 'XENDIT',
      });

      await payment.save();

      const redirectUrl = `/payment-success?status=${status}`;
      res.redirect(307, redirectUrl);
    } catch (error) {
      console.error('Error updating user plan:', error);
      res.status(500).json({ error: 'Failed to update user plan' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
import { NextApiRequest, NextApiResponse } from 'next';
import { PLANS } from '@/constants';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { User } from '@/lib/models';
import { connectDB } from '@/lib/mongodb';

const xenditApiKey = process.env.NODE_ENV === 'production' ? process.env.XENDIT_API_KEY : process.env.XENDIT_TEST_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email });

  console.log('user', user);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (req.method === 'POST') {
    const { amount, description, email, userId, planType } = req.body;

    if (typeof planType !== 'string' || !(planType in PLANS)) {
      return res.status(400).json({ error: "Invalid plan type" });
    }

    const plan = PLANS[planType as keyof typeof PLANS];

    try {
      const response = await fetch('https://api.xendit.co/v2/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(xenditApiKey + ':').toString('base64')}`,
        },
        body: JSON.stringify({
          external_id: `${uuidv4()}_${userId}_${planType}`,
          amount: amount,
          payer_email: email,
          description: description,
          currency: 'IDR',
          invoice_duration: 172800,
          success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?planType=${planType}`,
          failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-failure`,
          reminder_time: 1,
          items: [{
            name: plan.name,
            quantity: 1,
            price: amount,
            category: 'Subscription'
          }]
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create invoice');
      }

      res.status(200).json({ invoice_url: result.invoice_url });
    } catch (error) {
      console.error('Error creating invoice:', error);
      res.status(500).json({ error: 'Failed to create invoice' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
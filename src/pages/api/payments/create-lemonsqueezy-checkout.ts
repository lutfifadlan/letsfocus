import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { User } from '@/lib/models';
import { v4 as uuidv4 } from 'uuid';

const LEMONSQUEEZY_DEV_STORE_ID = "127510";
const LEMONSQUEEZY_STORE_ID = "127510";
const PRO_MONTHLY_DEV_PRODUCT_ID = "366801";
const PRO_YEARLY_DEV_PRODUCT_ID = "366806";
const PRO_LIFETIME_DEV_PRODUCT_ID = "373595";
const PRO_MONTHLY_PRODUCT_ID = "366809";
const PRO_YEARLY_PRODUCT_ID = "373593";
const PRO_LIFETIME_PRODUCT_ID = "373594";
const PRO_MONTHLY_DEV_VARIANT_ID = "546108";
const PRO_YEARLY_DEV_VARIANT_ID = "546113";
const PRO_LIFETIME_DEV_VARIANT_ID = "558921";
const PRO_MONTHLY_VARIANT_ID = "546116";
const PRO_YEARLY_VARIANT_ID = "558919";
const PRO_LIFETIME_VARIANT_ID = "558920";

const lemonSqueezyProducts: { [key: string]: { productId: string; variantId: string } } = {
  'PRO-MONTHLY': {
    productId: process.env.NODE_ENV === 'production' ? PRO_MONTHLY_PRODUCT_ID : PRO_MONTHLY_DEV_PRODUCT_ID,
    variantId: process.env.NODE_ENV === 'production' ? PRO_MONTHLY_VARIANT_ID : PRO_MONTHLY_DEV_VARIANT_ID
  },
  'PRO-YEARLY': {
    productId: process.env.NODE_ENV === 'production' ? PRO_YEARLY_PRODUCT_ID : PRO_YEARLY_DEV_PRODUCT_ID,
    variantId: process.env.NODE_ENV === 'production' ? PRO_YEARLY_VARIANT_ID : PRO_YEARLY_DEV_VARIANT_ID
  },
  'PRO-LIFETIME': {
    productId: process.env.NODE_ENV === 'production' ? PRO_LIFETIME_PRODUCT_ID : PRO_LIFETIME_DEV_PRODUCT_ID,
    variantId: process.env.NODE_ENV === 'production' ? PRO_LIFETIME_VARIANT_ID : PRO_LIFETIME_DEV_VARIANT_ID
  },
};
const lemonSqueezyStoreId = process.env.NODE_ENV === 'production' ? LEMONSQUEEZY_STORE_ID : LEMONSQUEEZY_DEV_STORE_ID;
const lemonsqueezyApiKey = process.env.NODE_ENV === 'production' ? process.env.LEMON_SQUEEZY_API_KEY : process.env.LEMON_SQUEEZY_TEST_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (req.method === 'POST') {
    const { planType, userId } = req.body;

    if (!lemonSqueezyProducts[planType]) {
      return res.status(400).json({ error: "Invalid plan type" });
    }

    const { variantId } = lemonSqueezyProducts[planType];

    const payload = {
      data: {
        type: 'checkouts',
        attributes: {
          product_options: {
            receipt_button_text: 'Return to Your Account',
            redirect_url: 'https://letsfocus.today/payment-success',
            receipt_link_url: 'https://letsfocus.today/todolists',
            enabled_variants: [variantId],
          },
          checkout_data: {
            custom: {
              user_id: userId,
              plan_type: planType,
              external_id: `${uuidv4()}_${userId}_${planType}`
            },
          },
          expires_at: new Date(Date.now() + 3600000).toISOString(), // Set expiry to 1 hour from now
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: lemonSqueezyStoreId,
            },
          },
          variant: {
            data: {
              type: "variants",
              id: variantId,
            },
          },
        },
      },
    };

    try {
      const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
          'Authorization': `Bearer ${lemonsqueezyApiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Lemon Squeezy error response:', JSON.stringify(data, null, 2));
        return res.status(response.status).json({ error: 'Failed to create checkout session', details: data });
      }

      // Respond with the checkout URL provided by Lemon Squeezy
      res.status(200).json({ checkoutUrl: data.data.attributes.url });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return res.status(500).json({ error: 'Server error', details: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

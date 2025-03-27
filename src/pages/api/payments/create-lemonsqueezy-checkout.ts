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
  return res.status(503).json({ 
    error: "Service Unavailable",
    message: "Payments are currently disabled. All features are available for free during this period."
  });
}

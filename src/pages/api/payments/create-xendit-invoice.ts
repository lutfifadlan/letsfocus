import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(503).json({ 
    error: "Service Unavailable",
    message: "Payments are currently disabled. All features are available for free during this period."
  });
}
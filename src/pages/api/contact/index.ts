import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/mongodb';
import { ContactMessage } from '@/lib/models';
import { notifySupportOnContactMessage } from '@/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  switch (req.method) {
    case 'POST':
      try {
        const { email, message } = req.body;

        if (!message) {
          return res.status(400).json({ error: "Missing required field: message" });
        }
        const newMessage = new ContactMessage({
          email,
          message,
        });
        await newMessage.save();
        
        await notifySupportOnContactMessage(email, message);

        res.status(201).json(newMessage);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        res.status(500).json({ error: 'Failed to create message' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
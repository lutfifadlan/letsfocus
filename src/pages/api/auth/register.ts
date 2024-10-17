import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { User, UserPlan } from '@/lib/models'
import { connectDB } from '@/lib/mongodb'
import { sendVerificationEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { name, email, password, consent } = req.body;

  await connectDB();

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    nextAuthUserId: uuidv4(),
    name,
    email,
    password: hashedPassword,
    consent,
    isVerified: false,
    isFirstLogin: true
  });

  const createdUser = await newUser.save();

  const newPlan = new UserPlan({
    userId: createdUser._id,
  });

  await newPlan.save();

  await sendVerificationEmail(newUser);

  res.status(201).json({ message: 'User registered. Please check your email to verify your account.' });
}

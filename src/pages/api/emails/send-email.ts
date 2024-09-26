import type { NextApiRequest, NextApiResponse } from 'next'
import Plunk from '@plunk/node'

const plunk = new Plunk('PLUNK_API_KEY')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    try {
      await plunk.emails.send({
        to: 'mochamadlutfifadlan@gmail.com',
        subject: 'New User Interested in SyncPulse',
        body: `The user with email ${email} wants to try the product.`,
      })

      return res.status(200).json({ message: 'Email sent successfully' })
    } catch (error) {
      console.error('Error sending email:', error)
      return res.status(500).json({ message: 'Error sending email' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
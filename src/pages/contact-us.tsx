"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/router';
import Layout from '@/components/layout';
import { useSession } from 'next-auth/react';

interface ContactUsProps {
  prefillEmail?: string;
}

const ContactUs: React.FC<ContactUsProps> = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { email: prefillEmailParam } = router.query;
  const [email, setEmail] = useState(prefillEmailParam || session?.user?.email || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, message }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      toast({
        title: "Message Sent",
        description: "Thank you for your message. We will review it and get back to you",
      });

      setEmail('');
      setMessage('');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto p-4 sm:p-8 dark:text-white min-h-screen max-w-6xl">
        <Card className="mt-4">
          <CardHeader className="bg-primary text-primary-foreground p-6 sm:p-8 rounded-t-lg">
            <CardTitle className="text-3xl sm:text-4xl font-bold">Contact Us</CardTitle>
            <p className="text-base mt-3">We&apos;re here to help. Reach out to us with any questions or concerns.</p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none p-6 sm:p-8">
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
              <section className="flex flex-col h-full">
                <h2 className="text-2xl sm:text-3xl font-bold mb-5">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-5 flex-grow flex flex-col">
                  <div>
                    <label htmlFor="email" className="block mb-3">Email</label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Your email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="p-3 border rounded-md"
                    />
                  </div>
                  <div className="flex-grow flex flex-col">
                    <label htmlFor="message" className="block mb-3">Message</label>
                    <Textarea
                      id="message"
                      placeholder="Your message"
                      required
                      className="flex-grow p-3 border rounded-md"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full py-3 rounded-md hover:bg-primary-dark" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </section>

              <section className="flex flex-col h-full">
                <h2 className="text-2xl sm:text-3xl font-bold mb-5">Contact Information</h2>
                <div className="space-y-5 sm:space-y-7 flex-grow">
                  <div className="flex items-center space-x-3">
                    <Mail className="text-primary flex-shrink-0" />
                    <span className="flex-shrink-0">Email: </span>
                    <a href="mailto:support@letsfocus.today" className="text-primary hover:underline break-all">
                      support@letsfocus.today
                    </a>
                  </div>
                </div>
              </section>
            </div>

            <Separator className="my-8" />

            <section>
              <h2 className="text-2xl sm:text-3xl font-bold mb-5">Additional Information</h2>
              <p>
                For more details about how we handle your data, please refer to our{' '}
                <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ContactUs;
import React from 'react';
import Layout from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Mail } from 'lucide-react';

const TermsOfService: React.FC = () => {
  const terms = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing or using Let's Focus, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not use our service."
    },
    {
      title: "2. Description of Service",
      content: "Let's Focus is a modern, simple, and powerful to-do list application designed for individuals who want to thrive in getting things done with ease."
    },
    {
      title: "3. User Responsibilities",
      content: "You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account."
    },
    {
      title: "4. Content",
      content: "You retain all rights to the content you post on Let's Focus. By posting content, you grant us a license to use, modify, and display that content in connection with the service."
    },
    {
      title: "5. Prohibited Uses",
      content: "You may not use Let's Focus for any illegal or unauthorized purpose."
    },
    {
      title: "6. Termination",
      content: "We may terminate or suspend your account at any time, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms."
    },
    {
      title: "7. Changes to Terms",
      content: "We reserve the right to modify or replace these Terms at any time. It is your responsibility to check the Terms periodically for changes."
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent>
            {terms.map((term, index) => (
              <div key={index} className="mb-6">
                <h2 className="text-xl font-semibold mb-2">{term.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">{term.content}</p>
              </div>
            ))}
            <div className="mt-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Contact Us</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                <Link href="mailto:support@letsfocus.today">
                  support@letsfocus.today
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TermsOfService;
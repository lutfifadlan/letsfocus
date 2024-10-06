import React from 'react';
import Layout from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';

const PrivacyPolicy: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert">
            <p className="text-sm text-gray-500 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when you:
            </p>
            <ul className="list-disc pl-5 mb-4">
              <li>Create an account</li>
              <li>Update your profile</li>
              <li>Use our services</li>
              <li>Communicate with us</li>
            </ul>
            <p>
              This may include your name, email address, task data, and any other information you choose to provide.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-5 mb-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your transactions</li>
              <li>Send you technical notices and support messages</li>
              <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">3. Information Sharing and Disclosure</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, as long as those parties agree to keep this information confidential.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">4. Data Security</h2>
            <p>
              We take the security of your personal information seriously and have implemented various measures to protect it. Your data is securely stored in the cloud and safeguarded with restricted access.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">5. Your Rights and Choices</h2>
            <p>
              You have the right to:
            </p>
            <ul className="list-disc pl-5 mb-4">
              <li>Access the personal information we hold about you</li>
              <li>Correct inaccuracies in your personal information</li>
              <li>Delete your personal information</li>
              <li>Object to the processing of your personal information</li>
              <li>Request the restriction of processing of your personal information</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us using the information provided in the &quot;Contact Us&quot; section.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">6. Changes to Our Privacy Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the &quot;Last updated&quot; date at the top of this policy. You are advised to review this privacy policy periodically for any changes.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">7. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our treatment of your personal data, please contact us at:{' '}
              <Link href="mailto:support@letsfocus.today" className="text-primary hover:underline">
                support@letsfocus.today
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
import React from 'react';
import Layout from '@/components/layout';
import CustomBackground from '@/components/backgrounds/custom';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';

const PricingPage = () => {
  const router = useRouter();

  return (
    <Layout>
      <CustomBackground type="animated-grid" />
      <div className="flex-grow container mx-auto py-2 px-4 pb-3 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold mb-6">Payments Currently Disabled</h1>
          <p className="text-xl mb-8">
            We&apos;re currently not accepting any payments. All features are available for free during this period.
          </p>
          <Button 
            onClick={() => router.push('/todolists')}
            className="text-lg py-6 px-8"
          >
            Continue to App
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default PricingPage;
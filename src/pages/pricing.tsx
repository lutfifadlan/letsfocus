import React, { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import ShineBorder from '@/components/ui/shine-border';
import { useRouter } from 'next/router';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { useSession } from 'next-auth/react';
import Layout from '@/components/layout';
import confetti from 'canvas-confetti';

interface PricingTierProps {
  title: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  discountedMonthlyPrice?: number;
  discountedYearlyPrice?: number;
  description: string;
  features: string[];
  isYearly: boolean;
  paymentMethod: 'xendit' | 'lemonsqueezy';
}

const PricingTier: React.FC<PricingTierProps> = ({
  title,
  monthlyPrice,
  yearlyPrice,
  discountedMonthlyPrice,
  discountedYearlyPrice,
  description,
  features,
  isYearly,
  paymentMethod,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { status, data: sessionData } = useSession();

  const handleClick = async () => {
    setIsLoading(true);
    let isAuthenticated, userId, email;

    try {
      if (status === 'authenticated') {
        isAuthenticated = true;
        userId = sessionData.user.id;
        email = sessionData.user.email;
      }

      if (!isAuthenticated) {
        localStorage.setItem('redirectAfterLogin', JSON.stringify({ plan: title }));
        router.push('/signin');
      } else {
        if (title === "Free") {
          confetti(); // Trigger confetti for free plan
          router.push('/todolists');
        } else if (title === "Pro") {
          await handlePayment(isYearly ? 'PRO-YEARLY' : 'PRO-MONTHLY', userId as string, email as string);
          confetti(); // Trigger confetti after successful payment
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };  

  // Payment integration with Xendit or Lemonsqueezy
  const handlePayment = (planType: 'PRO-MONTHLY' | 'PRO-YEARLY', userId: string, email: string) => {
    if (paymentMethod === 'xendit') {
      // Xendit payment flow
      handleXenditPayment(planType, userId, email);
    } else {
      // Lemonsqueezy payment flow
      handleLemonsqueezyPayment(planType, userId, email);
    }
  };

  const handleXenditPayment = async (planType: string, userId: string, email: string) => {
    const priceMapping: { [key: string]: number } = {
      'PRO-MONTHLY': 30000, // IDR (Rp)
      'PRO-YEARLY': 240000, // IDR (Rp)
    };
  
    const descriptionMapping: { [key: string]: string } = {
      'PRO-MONTHLY': "Pro monthly plan",
      'PRO-YEARLY': "Pro yearly plan",
    };
  
    const amount = priceMapping[planType];
    const description = descriptionMapping[planType];
  
    try {
      const response = await fetch('/api/payments/create-xendit-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount,
          description,
          email,
          planType
        }),
      });
  
      const data = await response.json();
  
      if (data.invoice_url) {
        window.open(data.invoice_url, '_blank'); // Open the Xendit payment page in a new tab
      } else {
        toast({
          variant: "destructive",
          title: "Payment Error",
          description: "Failed to create invoice. Please try again.",
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: "There was a problem processing your payment. Please try again.",
      });
    }
  };  

  const handleLemonsqueezyPayment = async (planType: string, userId: string, email: string) => {
    try {
      const response = await fetch('/api/payments/create-lemonsqueezy-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType, userId, email }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to create checkout URL');
      }
  
      const { checkoutUrl } = await response.json();
      window.open(checkoutUrl, '_blank'); // Open the Xendit payment page in a new tab
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Checkout Error",
        description: "Failed to create checkout. Please try again.",
      });
    }
  };

  const getPriceDisplay = (isXendit: boolean) => {
    if (title === "Free") {
      return 'Free';
    }
    if (yearlyPrice !== undefined) {
      return (
        <>
          <span className="line-through text-gray-500">{isXendit ? `Rp ${yearlyPrice.toLocaleString()}` : `$${yearlyPrice}`}</span><br/>
          <span className="text-4xl font-bold">{isXendit ? `Rp ${discountedYearlyPrice?.toLocaleString()}` : `$${discountedYearlyPrice}`}</span>
          <span className="text-xl font-normal">/year</span>
        </>
      );
    }
    if (monthlyPrice !== undefined) {
      return (
        <>
          <span className="line-through text-gray-500">{isXendit ? `Rp ${monthlyPrice.toLocaleString()}` : `$${monthlyPrice}`}</span><br/>
          <span className="text-4xl font-bold">{isXendit ? `Rp ${discountedMonthlyPrice?.toLocaleString()}` : `$${discountedMonthlyPrice}`}</span>
          <span className="text-xl font-normal">/month</span>
        </>
      );
    }
    return 'Free';
  };

  const renderCardContent = (isXendit: boolean) => (
    <div className="flex flex-col h-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-6 text-center">
          <p className="text-4xl font-bold mb-2">{getPriceDisplay(isXendit)}</p>
          {title !== "Free" && yearlyPrice !== undefined && monthlyPrice !== undefined && (
            <p className="text-sm text-muted-foreground">
              or <span className="line-through">{isXendit ? `Rp ${monthlyPrice}` : `$${monthlyPrice}`}</span>{' '}
              {isXendit ? `Rp ${discountedMonthlyPrice}` : `$${discountedMonthlyPrice}`}/month
            </p>
          )}
        </div>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button
          className="relative w-full text-lg py-6 cursor-pointer"
          onClick={handleClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            title === "Free" ? 'Start Free' : 'Start Your Plan'
          )}
        </Button>
      </CardFooter>
    </div>
  );

  const commonClassName = "w-full max-w-[350px] h-[500px] transition-all duration-300 hover:shadow-lg";
  const isXendit = paymentMethod === 'xendit';

  if (title === "Pro") {
    return (
      <ShineBorder className={`relative flex flex-col p-0 ${commonClassName}`} borderRadius={12} borderWidth={2} color={["#3b82f6", "#10b981"]}>
        {renderCardContent(isXendit)}
      </ShineBorder>
    );
  } else {
    return (
      <Card className={`${commonClassName} border-primary shadow-md`}>
        {renderCardContent(isXendit)}
      </Card>
    );
  }
};

const PricingPage = () => {
  const [isYearly, setIsYearly] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'xendit' | 'lemonsqueezy'>('xendit');
  const isXendit = paymentMethod === 'xendit';
  // Detect if the user is in Indonesia
  useEffect(() => {
    fetch('https://ipapi.co/json/') // Replace with your preferred geolocation API
      .then(response => response.json())
      .then(data => {
        if (data.country_code === 'ID') {
          setPaymentMethod('xendit');
        } else {
          setPaymentMethod('lemonsqueezy');
        }
      })
      .catch(error => console.error('Geolocation error:', error));
  }, []);

  const pricingTiers = [
    {
      title: 'Free',
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: 'For individuals who are getting started',
      features: [
        'Basic tasks management',
        'Limited to 100 tasks / month',
        'Limited AI features'
      ],
    },
    {
      title: 'Pro',
      monthlyPrice: isXendit ? 47000 : 3,
      yearlyPrice: isXendit ? 370000 : 24,
      discountedMonthlyPrice: isXendit ? 30000 : 2,
      discountedYearlyPrice: isXendit ? 240000 : 16,
      description: 'For individuals who want to thrive',
      features: [
        'Advanced task management',
        'Unlimited tasks',
        'Detailed statistics and analytics',
        'Task history',
        'Advanced AI features'
      ],
    },
  ];

  const proTier = pricingTiers.find(tier => tier.title === 'Pro');
  const monthlyCostForYear = proTier!.discountedMonthlyPrice! * 12;
  const yearlySavings = monthlyCostForYear - proTier!.discountedYearlyPrice!;
  const savingsPercentage = Math.round((yearlySavings / monthlyCostForYear) * 100);

  return (
    <Layout>
        <div className="flex-grow container mx-auto py-2 px-4 pb-3">
          <h1 className="text-4xl font-extrabold text-center mb-4">Upgrade to Pro</h1>
          <div className="flex justify-center items-center mb-4">
            <span className={`mr-3 ${!isYearly ? 'font-semibold' : ''}`}>Monthly</span>
            <Switch 
              checked={isYearly} 
              onCheckedChange={setIsYearly} 
              className="scale-125"
            />
            <span className={`ml-3 ${isYearly ? 'font-semibold' : ''}`}>
              Yearly <span className="font-bold">(Save {savingsPercentage}%)</span>
            </span>
            {/* Add payment method dropdown next to the monthly/yearly switch */}
            <div className="flex items-center ml-6">
              <Label htmlFor="payment-method" className="mr-2">Payment Method:</Label>
              <Select 
                value={paymentMethod} 
                onValueChange={(value) => setPaymentMethod(value as 'xendit' | 'lemonsqueezy')}
              >
                <SelectTrigger className="w-[220px]" id="payment-method">
                  <SelectValue placeholder="Select Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xendit">
                    <div className="flex items-center cursor-pointer">
                      <Image src='/xendit.png' alt="Xendit" width={25} height={25} className="mr-2" />
                      Xendit (IDR)
                    </div>
                  </SelectItem>
                  <SelectItem value="lemonsqueezy">
                    <div className="flex items-center cursor-pointer">
                      <Image src='/lemonsqueezy.png' alt="LemonSqueezy" width={25} height={25} className="mr-2" />
                      LemonSqueezy (USD)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-center items-center gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <PricingTier 
                key={index} 
                {...tier} 
                monthlyPrice={isYearly ? undefined : tier.monthlyPrice}
                yearlyPrice={isYearly ? tier.yearlyPrice : undefined}
                discountedMonthlyPrice={isYearly ? undefined : tier.discountedMonthlyPrice}
                discountedYearlyPrice={isYearly ? tier.discountedYearlyPrice : undefined}
                isYearly={isYearly}
                paymentMethod={paymentMethod} // Pass the selected payment method
              />
            ))}
          </div>
        </div>
    </Layout>
  );
};

export default PricingPage;
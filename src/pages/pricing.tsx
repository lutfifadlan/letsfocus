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
import CustomBackground from '@/components/backgrounds/custom';

const MAX_DISCOUNT_SEATS = 50;
const DISCOUNT_PERCENTAGE = 0.35;
const PRICE_PRO_MONTHLY_XENDIT = 47000;
const PRICE_PRO_YEARLY_XENDIT = 370000;
const PRICE_PRO_LIFETIME_XENDIT = 780000;
const DISCOUNTED_PRICE_PRO_MONTHLY_XENDIT = Math.round(PRICE_PRO_MONTHLY_XENDIT * DISCOUNT_PERCENTAGE);
const DISCOUNTED_PRICE_PRO_YEARLY_XENDIT = Math.round(PRICE_PRO_YEARLY_XENDIT * DISCOUNT_PERCENTAGE);
const DISCOUNTED_PRICE_PRO_LIFETIME_XENDIT = Math.round(PRICE_PRO_LIFETIME_XENDIT * DISCOUNT_PERCENTAGE);

const PRICE_PRO_MONTHLY_LEMONSQUEEZY = 3;
const PRICE_PRO_YEARLY_LEMONSQUEEZY = 24;
const PRICE_PRO_LIFETIME_LEMONSQUEEZY = 50;
const DISCOUNTED_PRICE_PRO_MONTHLY_LEMONSQUEEZY = Math.round(PRICE_PRO_MONTHLY_LEMONSQUEEZY * DISCOUNT_PERCENTAGE);
const DISCOUNTED_PRICE_PRO_YEARLY_LEMONSQUEEZY = Math.round(PRICE_PRO_YEARLY_LEMONSQUEEZY * DISCOUNT_PERCENTAGE);
const DISCOUNTED_PRICE_PRO_LIFETIME_LEMONSQUEEZY = Math.round(PRICE_PRO_LIFETIME_LEMONSQUEEZY * DISCOUNT_PERCENTAGE);

interface PricingTierProps {
  title: string;
  price?: number;
  discountedPrice?: number;
  description: string;
  features: string[];
  isYearly: boolean;
  paymentMethod: string;
  discountEndDate: string;
  period?: string;
}

const PricingTier: React.FC<PricingTierProps> = ({
  title,
  price,
  discountedPrice,
  description,
  features,
  isYearly,
  paymentMethod,
  period,
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
          confetti();
          router.push('/todolists');
        } else {
          let planType;
          switch (title) {
            case 'Pro':
              planType = isYearly ? 'PRO-YEARLY' : 'PRO-MONTHLY';
              break;
            case 'Pro Lifetime':
              planType = 'PRO-LIFETIME';
              break;
          }
          await handlePayment(planType as string, userId as string, email as string);
          confetti();
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

  const handlePayment = (planType: string, userId: string, email: string) => {
    if (paymentMethod === 'xendit') {
      handleXenditPayment(planType, userId, email);
    } else if (paymentMethod === 'lemonsqueezy') {
      handleLemonsqueezyPayment(planType, userId, email);
    } else {
      handleGumroadPayment(planType);
    }
  };

  const handleXenditPayment = async (planType: string, userId: string, email: string) => {
    const priceMapping: { [key: string]: number } = {
      'PRO-MONTHLY': DISCOUNTED_PRICE_PRO_MONTHLY_XENDIT,
      'PRO-YEARLY': DISCOUNTED_PRICE_PRO_YEARLY_XENDIT,
      'PRO-LIFETIME': DISCOUNTED_PRICE_PRO_LIFETIME_XENDIT,
    };

    const descriptionMapping: { [key: string]: string } = {
      'PRO-MONTHLY': "Pro monthly plan",
      'PRO-YEARLY': "Pro yearly plan",
      'PRO-LIFETIME': "Pro lifetime plan",
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
        window.open(data.invoice_url, '_blank');
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
      window.open(checkoutUrl, '_blank');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Checkout Error",
        description: "Failed to create checkout. Please try again.",
      });
    }
  };

  const handleGumroadPayment = (planType: string) => {
    const gumroadLinks: { [key: string]: string } = {
      'PRO-MONTHLY': 'https://lutfifadlan.gumroad.com/l/letsfocus-monthly',
      'PRO-YEARLY': 'https://lutfifadlan.gumroad.com/l/letsfocus-yearly',
      'PRO-LIFETIME': 'https://lutfifadlan.gumroad.com/l/letsfocus-pro-lifetime',
    };
  
    const gumroadUrl = gumroadLinks[planType];
    if (gumroadUrl) {
      window.open(gumroadUrl, '_blank');
    } else {
      toast({
        variant: 'destructive',
        title: 'Payment Error',
        description: 'Failed to process the payment. Please try again.',
      });
    }
  };

  const getPriceDisplay = (isXendit: boolean) => {
    if (title === "Free") {
      return 'Free';
    }
    
    return (
      <>
        <span className="line-through text-gray-500">{isXendit ? `Rp ${price?.toLocaleString()}` : `$${price}`}</span><br/>
        <span className="text-4xl font-bold">{isXendit ? `Rp ${discountedPrice?.toLocaleString()}` : `$${discountedPrice}`}</span>
        <span className="text-xl font-normal">{period}</span>
      </>
    );
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

  const commonClassName = "w-full max-w-[350px] h-[580px] transition-all duration-300 hover:shadow-lg";
  const isXendit = paymentMethod === 'xendit';

  if (title === "Pro" || title === "Pro Lifetime") {
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
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [remainingDiscountSeats, setRemainingDiscountSeats] = useState(MAX_DISCOUNT_SEATS);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch('https://ipapi.co/json/'),
      fetch('/api/user-plans/all')
    ])
      .then(([ipResponse, userPlansResponse]) => Promise.all([ipResponse.json(), userPlansResponse.json()]))
      .then(([ipData, userPlansData]) => {
        if (ipData.country_code === 'ID') {
          setPaymentMethod('xendit');
        } else {
          setPaymentMethod('lemonsqueezy');
        }
        const userPlansCount = userPlansData.count;
        const remaining = Math.max(0, MAX_DISCOUNT_SEATS - userPlansCount);
        setRemainingDiscountSeats(remaining);
      })
      .catch(error => {
        console.error('Error:', error);
        setPaymentMethod('lemonsqueezy');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-grow container mx-auto py-2 px-4 pb-3 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  const isXendit = paymentMethod === 'xendit';

  const pricingTiers = [
    {
      title: 'Free',
      price: 0,
      discountedPrice: 0,
      description: 'For individuals who are getting started',
      features: [
        'Basic to-do lists',
        'Limited to 100 tasks / month',
        'Limited AI features',
        'Limited tasks history',
        '1 theme',
      ],
      period: '',
    },
    {
      title: 'Pro',
      price: isXendit ? (isYearly ? PRICE_PRO_YEARLY_XENDIT : PRICE_PRO_MONTHLY_XENDIT) : (isYearly ? PRICE_PRO_YEARLY_LEMONSQUEEZY : PRICE_PRO_MONTHLY_LEMONSQUEEZY),
      discountedPrice: isXendit ? (isYearly ? DISCOUNTED_PRICE_PRO_YEARLY_XENDIT : DISCOUNTED_PRICE_PRO_MONTHLY_XENDIT) : (isYearly ? DISCOUNTED_PRICE_PRO_YEARLY_LEMONSQUEEZY : DISCOUNTED_PRICE_PRO_MONTHLY_LEMONSQUEEZY),
      description: 'For individuals who want to thrive',
      features: [
        'Advanced to-do lists',
        'Unlimited tasks',
        'Detailed statistics and analytics',
        'Tasks history',
        'Advanced AI features',
        '10 themes',
        'Update to new features'
      ],
      period: isYearly ? '/year' : '/month',
    },
    {
      title: 'Pro Lifetime',
      price: isXendit ? PRICE_PRO_LIFETIME_XENDIT : PRICE_PRO_LIFETIME_LEMONSQUEEZY,
      discountedPrice: isXendit ? DISCOUNTED_PRICE_PRO_LIFETIME_XENDIT : DISCOUNTED_PRICE_PRO_LIFETIME_LEMONSQUEEZY,
      description: 'One-time payment for lifetime access',
      features: [
        'All Pro included',
        'Lifetime access',
        'No recurring payments'
      ],
      period: ' (one-time)',
    },
  ];

  const discountEndDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
  <Layout>
    <CustomBackground type="animated-grid" />
    <div className="flex-grow container mx-auto py-2 px-4 pb-3 relative z-10">
      <h1 className="text-4xl font-extrabold text-center mb-4">Upgrade to Pro</h1>
      <div className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 border-yellow-500 text-yellow-900 p-4 mb-4 rounded-lg shadow-md" role="alert">
        <p className="font-extrabold text-center text-lg">Limited-seats offer!</p>
        <p className="text-center text-sm">
          Only for the first <span className="font-bold">{MAX_DISCOUNT_SEATS}</span> users (<span className="font-bold">{remainingDiscountSeats}</span> left) who will get special price
        </p>
      </div>
      <div className="flex justify-center items-center mb-4">
        <span className={`mr-3 ${!isYearly ? 'font-semibold' : ''}`}>Monthly</span>
        <Switch 
          checked={isYearly} 
          onCheckedChange={setIsYearly} 
          className="scale-125"
        />
        <span className={`ml-3 ${isYearly ? 'font-semibold' : ''}`}>
          Yearly <span className="font-bold">(Save 33%)</span>
        </span>
        <div className="flex items-center ml-6">
          <Label htmlFor="payment-method" className="mr-2">Payment Method:</Label>
          <Select 
            value={paymentMethod} 
            onValueChange={(value) => setPaymentMethod(value as 'xendit' | 'lemonsqueezy')}
          >
            <SelectTrigger className="w-[220px] bg-white dark:bg-black" id="payment-method">
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
                  <Image src='/lemonsqueezy.png' alt="Lemonsqueezy" width={25} height={25} className="mr-2" />
                  Lemonsqueezy (USD)
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
            isYearly={isYearly}
            paymentMethod={paymentMethod}
            discountEndDate={discountEndDate}
          />
        ))}
      </div>
    </div>
  </Layout>
  );
};

export default PricingPage;
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import Image from 'next/image';
import { FaGoogle } from 'react-icons/fa';
import Link from 'next/link';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from 'lucide-react';

const Register: React.FC = () => {
  const { status } = useSession();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    consent: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const imageSrc = '/logo.svg'

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/todolists');
    }
  }, [status, router]);

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, password, consent } = formData;

    if (!consent) {
      toast({
        title: "Consent Required",
        description: "Please agree to the terms of service and privacy policy to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!validatePassword(password)) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, consent }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Registered successfully! Please check your email to verify your account.",
        });
        router.push('/signin');
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "An error occurred. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/todolists' }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
    });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <motion.div
        className="z-10 bg-background p-8 rounded-xl w-full max-w-md border border-gray-300 dark:border-gray-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center justify-center space-x-2 mb-6">
          <Link href="/" className="flex items-center space-x-2">
            <Image src={imageSrc} alt="logo" width={40} height={40} priority className="rounded-full border"/>
            <div className="text-3xl font-bold text-center">
              Let&apos;s Focus
            </div>
          </Link>
        </div>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                </button>
              </div>
            </div>
            <div className="flex space-x-2">
              <Checkbox
                id="consent"
                name="consent"
                checked={formData.consent}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, consent: checked as boolean }))}
              />
              <Label
                htmlFor="consent"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                <span className="font-semibold">Accept terms and conditions</span><br/>
                <div className="mt-2 text-xs">
                  You agree to our{' '}
                  <Link href="/terms-of-service" className="text-primary underline cursor-pointer">
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy-policy" className="text-primary underline cursor-pointer">
                    Privacy Policy
                  </Link>
                </div>
              </Label>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground font-bold py-2 px-4 transition duration-300 ease-in-out" 
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <div className="relative flex items-center">
              <Separator className="flex-1" />
              <p className="px-4 text-sm text-muted-foreground">Or continue with</p>
              <Separator className="flex-1" />
            </div>
            <Button
              onClick={handleGoogleSignIn}
              className="mt-2 w-full bg-secondary text-secondary-foreground border border-primary hover:bg-primary hover:text-primary-foreground font-bold py-2 px-4 transition duration-300 ease-in-out flex items-center justify-center"
            >
              <FaGoogle className="mr-2" /> Google
            </Button>
          </div>
        </CardContent>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/signin" className="text-primary hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
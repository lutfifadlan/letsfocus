import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { FaGoogle } from 'react-icons/fa';
import { Separator } from "@/components/ui/separator";
import Image from 'next/image';
import { useSession } from 'next-auth/react';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();
  const { callbackUrl, verified } = router.query;
  const imageSrc = '/logo.png';
  const { status } = useSession();

  useEffect(() => {
    if (verified) {
      toast({
        title: "Success",
        description: "Email verified successfully! You can now sign in.",
        duration: 3000
      });
    }
    if (status === 'authenticated') {
      router.push('/todolists');
    }
  }, [verified, toast, status, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Signed in successfully!",
        });
        if (callbackUrl && typeof callbackUrl === 'string') {
          router.push(callbackUrl);
        } else {
          router.push('/todolists');
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { 
        callbackUrl: callbackUrl && typeof callbackUrl === 'string' 
          ? callbackUrl 
          : '/todolists' 
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
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
            <Image src={imageSrc} alt="Logo" width={40} height={40} priority />
            <div className="text-3xl font-bold text-center">
              Let&apos;s Focus
            </div>
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-primary text-primary-foreground font-bold py-2 px-4 transition duration-300 ease-in-out"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
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
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary hover:underline font-semibold">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignIn;
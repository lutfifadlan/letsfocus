import { useSession } from "next-auth/react";
import { Check } from "lucide-react";
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import Image from "next/image";

const PaymentSuccess = () => {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please sign in to view your payment status.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-green-100 rounded-full p-3 inline-block mb-4"
          >
            <Check className="h-8 w-8 text-green-600" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Thank you for your purchase, {session.user.name}. You have been upgraded to Pro Plan.</p>
        </div>
        <div className="mt-8 text-center">
          <Button
            onClick={() => router.push('/todolists')}
            className="px-4 py-2 rounded"
          >
            <div className="flex items-center justify-center">
              <Image src="/logo.png" alt="Let's Focus" width={20} height={20} className="mr-2" />
              Let&apos;s Focus
            </div>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
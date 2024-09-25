import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Globe } from 'lucide-react';

const Footer: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="w-full pt-4 px-4 sm:px-6 relative z-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Logo and Description Section */}
        <div className="flex flex-col items-center md:items-start">
          <Link href="/" className='flex items-center justify-center gap-2'>
            <Image src="/logo.svg" alt="logo" width={35} height={35} priority />
            <h1 className="text-xl sm:text-2xl font-bold text-primary">Let&apos;s Focus</h1>
          </Link>
          <p className="mt-2 text-sm text-center md:text-left">
            Be Focused, Be Productive, Be Successful
          </p>
        </div>

        {/* Quick Links Section */}
        <div>
          <h4 className="font-semibold text-lg mb-4 text-primary text-center sm:text-left">Quick Links</h4>
          <ul className="space-y-2 text-center sm:text-left" aria-label="breadcrumb">
            <li><Link href="/">Landing Page</Link></li>
            <li><Link href="/dashboard">Dashboard</Link></li>
          </ul>
        </div>

        {/* Support Section */}
        <div>
          <h4 className="font-semibold text-lg mb-4 text-primary text-center sm:text-left">Support</h4>
          <ul className="space-y-2 text-center sm:text-left" aria-label="breadcrumb">
            <li><Link href="/contact-us">Contact Us</Link></li>
            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            <li><Link href="/terms-of-service">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Connect Section */}
        <div>
          <h4 className="font-semibold text-lg mb-4 text-primary text-center sm:text-left">Connect</h4>
          <div className="flex justify-center sm:justify-start">
            <Link 
              href="https://lutfifadlan.com"
              className="flex items-center text-primary"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="breadcrumb"
            >
              <Globe size={20} className="mr-2" />
              <span>Company</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Bottom Section */}
      <div className="mt-4 pt-2 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Let&apos;s Focus. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
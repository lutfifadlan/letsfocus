import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Backlink = {
  url: string;
  label: string;
};

type WindowWithBacklinks = Window & typeof globalThis & {
  onBacklinksLoaded?: (data: Backlink[]) => void;
  Backlinks?: Backlink[];
};

const Footer: React.FC = () => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const loadBacklinks = () => {
      const win = window as WindowWithBacklinks;
      
      win.onBacklinksLoaded = (data: Backlink[]) => {
        setBacklinks(data);
      };

      // Set a timeout to check for backlinks
      const timer = setTimeout(() => {
        // Fallback to global backlinks or use an empty array if not available
        setBacklinks((prevLinks) =>
          prevLinks.length ? prevLinks : win.Backlinks || []
        );
      }, 2000);

      return () => clearTimeout(timer);
    };

    loadBacklinks();
  }, []);

  if (!isMounted) return null;

  return (
    <div className="w-full pt-4 px-4 sm:px-6 relative z-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {/* Logo and Description Section */}
        <div className="flex flex-col items-center md:items-start">
          <Link href="/" className="flex items-center justify-center gap-2">
            <Image src="/logo.png" alt="logo" width={35} height={35} priority />
            <h1 className="text-xl sm:text-2xl font-bold text-primary">
              Let&apos;s Focus
            </h1>
          </Link>
          <p className="mt-2 text-sm text-center md:text-left">
            Be Focused, Be Productive, Be Successful
          </p>
        </div>

        {/* Quick Links Section */}
        <div>
          <h4 className="font-semibold text-lg mb-4 text-primary text-center sm:text-left">
            Quick Links
          </h4>
          <ul className="space-y-2 text-center sm:text-left" aria-label="breadcrumb">
            <li>
              <Link href="/">Landing Page</Link>
            </li>
            <li>
              <Link href="/pricing">Pricing</Link>
            </li>
            <li>
              <Link href="/todolists">To-Do Lists</Link>
            </li>
            <li>
              <Link href="/stats">Stats</Link>
            </li>
            <li>
              <Link href="/tasks">Tasks</Link>
            </li>
          </ul>
        </div>

        {/* Support Section */}
        <div>
          <h4 className="font-semibold text-lg mb-4 text-primary text-center sm:text-left">
            Support
          </h4>
          <ul className="space-y-2 text-center sm:text-left" aria-label="breadcrumb">
            <li>
              <Link href="/contact-us">Contact Us</Link>
            </li>
            <li>
              <Link href="/privacy-policy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms-of-service">Terms of Service</Link>
            </li>
          </ul>
        </div>

        {/* Connect Section */}
        <div>
          <h4 className="font-semibold text-lg mb-4 text-primary text-center sm:text-left">
            Connect
          </h4>
          <div className="flex justify-center sm:justify-start">
            <Link
              href="https://lutfifadlan.com"
              className="flex items-center text-primary"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="breadcrumb"
            >
              <p className="">Company</p>
            </Link>
          </div>
        </div>

        {/* Indie Friends Section */}
        {backlinks.length > 0 && (
          <div>
            <h4 className="font-semibold text-lg mb-4 text-primary text-center sm:text-left">
              Indie Friends
            </h4>
            <div className="flex flex-col gap-4">
              {backlinks.map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
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
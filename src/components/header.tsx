import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from 'next/image';
import { Menu, LogIn, LogOut, List, BarChart2 } from 'lucide-react'; // Importing new icon
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const Header: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const isLandingPage = router.pathname === '/';

  return (
    <header className="z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="breadcrumb">
        <div className="flex justify-between h-16 items-center flex-wrap">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-shrink-0 flex items-center space-x-2"
          >
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.svg" alt="logo" width={40} height={40} priority className="rounded-full border" />
              <div className="text-lg sm:text-2xl font-bold text-center">
                Let&apos;s Focus
              </div>
            </Link>
          </motion.div>

          <div className="hidden lg:flex items-center space-x-2">
            <Button
              onClick={() => router.push('/todolists')}
              variant="ghost"
              className="border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <List className="w-5 h-5" />
            </Button>
            {!isLandingPage && (
              <Button
                onClick={() => router.push('/charts')}
                variant="ghost"
                className="border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <BarChart2 className="w-5 h-5" />
              </Button>
            )}
            <ThemeToggle />
            {!isLandingPage && (
              <>
                {
                  session && (
                    <>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Avatar className="cursor-pointer rounded-full border" style={{ width: '30px', height: '30px' }}>
                            <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} style={{ width: '30px', height: '30px' }} />
                            <AvatarFallback style={{ width: '30px', height: '30px' }}>{session.user.name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2">
                          <p>{session.user.email}</p>
                        </PopoverContent>
                      </Popover>
                    </>
                  )
                }
                {
                  session ? (
                    <Button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      variant="ghost"
                      className="border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="w-5 h-5" />
                    </Button>
                ) : (
                  <Link href="/signin">
                    <Button variant="ghost" className="border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <LogIn className="w-5 h-5" />
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button variant="ghost" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu />
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Button
                onClick={() => router.push('/todolists')}
                variant="ghost"
                className="w-full mt-2 border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <List className="w-5 h-5" />
              </Button>
              {!isLandingPage && (
                <Button
                  onClick={() => router.push('/charts')}
                  variant="ghost"
                  className="w-full mt-2 border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <BarChart2 className="w-5 h-5" />
                </Button>
              )}
              <ThemeToggle />
              {!isLandingPage && (
                <>
                  {
                    session && (
                      <>
                        <div className="flex justify-center items-center space-x-2 px-3 py-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Avatar className="cursor-pointer rounded-full border" style={{ width: '30px', height: '30px' }} >
                                <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} style={{ width: '30px', height: '30px' }} />
                                <AvatarFallback style={{ width: '30px', height: '30px' }}>{session.user.name?.charAt(0) || 'U'}</AvatarFallback>
                              </Avatar>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2">
                              <p>{session.user.email}</p>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </>
                    )
                  }
                  {session ? (
                    <Button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      variant="ghost"
                      className="w-full mt-2 border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="w-5 h-5" />
                    </Button>
                  ) : (
                    <Link href="/signin" passHref>
                      <Button variant="ghost" className="w-full mt-2 border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <LogIn className="w-5 h-5" />
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;

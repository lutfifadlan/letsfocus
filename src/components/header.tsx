import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { Menu, LogIn, LogOut, ListChecks, Crown, CalendarCheck } from 'lucide-react'; // Add Calendar to imports
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

const Header: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem('sortOptions');
    localStorage.removeItem('sortDirection');
    localStorage.removeItem('manualOrderingEnabled');
    localStorage.removeItem('currentFilter');
    localStorage.removeItem('theme');

    signOut({ callbackUrl: '/' });
  };

  const isLandingPage = router.pathname === '/';

  useEffect(() => {
    setIsMounted(true);
    if (isLandingPage) {
      document.documentElement.classList.add('light'); // Force dark mode on landing page
    }
  }, [isLandingPage]);

  if (!isMounted) return null;

  return (
    <header className="z-50 py-4">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="breadcrumb">
        <div className="flex justify-between items-center flex-wrap">
          <div className="flex-shrink-0 flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="p-0 m-0">
                <Image src="/logo.png" alt="logo" width={40} height={40} priority className="borded-none shadow-none" />
              </Button>
              <div className="text-lg sm:text-2xl font-bold text-center">
                Let&apos;s Focus
              </div>
            </Link>
          </div>

          <div className="hidden lg:flex items-center space-x-2">
            <Button
              onClick={() => router.push('/pricing')}
              variant="ghost"
              className="border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Crown className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => router.push('/habits')}
              variant="ghost"
              className="border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <CalendarCheck className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => router.push('/todolists')}
              variant="ghost"
              className="border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ListChecks className="w-5 h-5" />
            </Button>
            {!isLandingPage && (
              <>
                {session && (
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
                )}
                {session ? (
                  <Button
                    onClick={handleSignOut}
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
          <div className="lg:hidden mt-4">
            <div className="space-y-2">
              <Button
                onClick={() => router.push('/pricing')}
                variant="ghost"
                className="w-full mt-2 border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Crown className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => router.push('/habits')}
                variant="ghost"
                className="w-full mt-2 border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <CalendarCheck className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => router.push('/todolists')}
                variant="ghost"
                className="w-full mt-2 border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ListChecks className="w-5 h-5" />
              </Button>
              {!isLandingPage && (
                <>
                  {session && (
                    <div className="flex justify-center items-center space-x-2 px-3 py-2">
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
                    </div>
                  )}
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
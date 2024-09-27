import React, { useState } from 'react';
import Footer from './footer';
import Header from './header';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { status } = useSession();
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);

  // Show header only on hover if not on the landing page
  const handleMouseEnter = () => setIsHeaderVisible(true);
  const handleMouseLeave = () => setIsHeaderVisible(false);

  if (status === 'loading') {
    return (
      <div className="py-16 flex justify-center items-center h-full">
        <div className="animate-spin h-8 w-8 border-4 border-t-transparent dark:border-t-black border-black dark:border-white rounded-full"></div>
      </div>
    );
  }

  if (status === 'unauthenticated' && router.pathname !== '/') {
    router.push('/signin');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div 
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}
        className={`transition-all duration-300 ease-in-out ${
          isHeaderVisible || router.pathname === '/' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Header />
      </div>
      <main className="flex-grow w-full mx-auto">
        {router.pathname === '/todolists' || router.pathname === '/charts' ? (
          <div className="flex min-h-screen overflow-y-auto">
            <div className="flex-grow p-4">
              {children}
            </div>
          </div>
        ) : (
          <>
            {children}
          </>
        )}
      </main>
      {router.pathname === '/' && <Footer />} {/* Show Footer only on landing page */}
    </div>
  );
};

export default Layout;
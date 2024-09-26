import React from 'react';
import Footer from './footer';
import Header from './header';
import { Button } from "@/components/ui/button"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { List, CheckCircle, Clock, FileText, Target, Settings, Home } from 'lucide-react'
import router, { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'

interface LayoutProps {
  children: React.ReactNode;
}

const Sidebar = () => (
  <div className="w-64 bg-white p-4 border-r border-gray-200">
    <nav className="h-full">
      <Button variant="ghost" className="w-full justify-start mb-2" onClick={() => router.push('/home')}>
        <Home className="mr-2 h-4 w-4" />
        Home
      </Button>
      <Button variant="ghost" className="w-full justify-start mb-2" onClick={() => router.push('/todolist')}>
        <List className="mr-2 h-4 w-4" />
        To-Do List
      </Button>
      {/* <Button variant="ghost" className="w-full justify-start mb-2">
        <CheckCircle className="mr-2 h-4 w-4" />
        Habits
      </Button>
      <Button variant="ghost" className="w-full justify-start mb-2">
        <Clock className="mr-2 h-4 w-4" />
        Time Tracking
      </Button>
      <Button variant="ghost" className="w-full justify-start mb-2">
        <FileText className="mr-2 h-4 w-4" />
        Notes
      </Button>
      <Button variant="ghost" className="w-full justify-start mb-2">
        <Target className="mr-2 h-4 w-4" />
        Goals
      </Button>
      <Button variant="ghost" className="w-full justify-start">
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </Button> */}
    </nav>
  </div>
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { status } = useSession();
  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'unauthenticated') {
    router.push('/signin');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow w-full mx-auto">
        {
          router.pathname === '/home' || router.pathname === '/todolist' ? (
            <div className="flex h-screen overflow-y-auto border-t border-b">
              <Sidebar />
              <div className="flex-grow p-4">
                {children}
              </div>
            </div>
          ) : (
            <>
            {children}
            </>
          )
        }
      </main>
      <Footer />
    </div>
  );
};  

export default Layout;
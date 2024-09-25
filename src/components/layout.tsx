import React from 'react';
import Footer from './footer';
import Header from './header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow w-full mx-auto">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
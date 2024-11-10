import React from 'react';
import Footer from './footer';
import Header from './header';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import Script from 'next/script';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarTrigger,
  SidebarHeader,
  SidebarRail
} from './ui/sidebar';
import { Button } from './ui/button';
import { 
  BarChart, 
  Calendar,
  CheckCircle,
  ListTodo,
  Heart,
  LogOut,
  Menu,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from "next-themes";
import Image from 'next/image';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { status } = useSession();
  const { setTheme, theme } = useTheme();
  const isFeaturePage = ['/todolists', '/stats', '/tasks', '/habits', '/habits-history'].includes(router.pathname);

  if (status === 'loading') {
    return (
      <div className="py-16 flex justify-center items-center h-full min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-t-transparent dark:border-t-black border-black dark:border-white rounded-full"></div>
      </div>
    );
  }

  if (status === 'unauthenticated' && isFeaturePage) {
    router.push('/signin');
    return null;
  }

  const navigationItems = [
    { href: '/todolists', label: 'Todo Lists', icon: ListTodo },
    { href: '/tasks', label: 'Tasks', icon: CheckCircle },
    { href: '/habits', label: 'Habits', icon: Heart },
    { href: '/habits-history', label: 'Habits History', icon: Calendar },
    { href: '/stats', label: 'Statistics', icon: BarChart },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {!isFeaturePage && <Header />}
      <main className="flex-grow w-full mx-auto">
        {isFeaturePage ? (
          <SidebarProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar className="z-40 bg-background border-r border-border">
                <SidebarHeader className="border-b border-border">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <div className="flex items-center justify-center space-x-3 px-4 py-2">
                        <Image src="/logo.png" alt="logo" width={30} height={30} />
                        <span className="font-semibold text-lg">Let's Focus</span>
                      </div>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                  <SidebarGroup>
                    <SidebarGroupContent>
                      <SidebarMenu className="px-2 py-2">
                        {navigationItems.map((item) => (
                          <SidebarMenuItem key={item.href} className="mb-1">
                            <SidebarMenuButton
                              asChild
                              isActive={router.pathname === item.href}
                            >
                              <Button 
                                variant="ghost" 
                                className="w-full justify-start h-10 px-4 text-foreground hover:bg-accent hover:text-accent-foreground"
                                onClick={() => router.push(item.href)}
                              >
                                <item.icon className="mr-3 h-4 w-4" />
                                <span>{item.label}</span>
                              </Button>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}

                        <SidebarMenuItem className="mb-1">
                          <SidebarMenuButton asChild>
                            <Button
                              variant="ghost"
                              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                              className="w-full justify-start h-10 px-4 text-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                              <Sun className="mr-3 h-4 w-4 dark:hidden" />
                              <Moon className="hidden mr-3 h-4 w-4 dark:block" />
                              <span>Switch theme</span>
                            </Button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem>
                          <SidebarMenuButton
                            asChild
                            onClick={() => signOut({ callbackUrl: '/signin' })}
                          >
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start h-10 px-4 text-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                              <LogOut className="mr-3 h-4 w-4" />
                              <span>Logout</span>
                            </Button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                </SidebarContent>
                <SidebarRail />
              </Sidebar>

              <div className="flex-1 flex flex-col">
                <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="flex items-center h-[3.9rem] px-6 border-b border-border">
                    <SidebarTrigger>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle sidebar</span>
                      </Button>
                    </SidebarTrigger>
                  </div>
                </div>
                <div className="flex-1 overflow-auto">
                  <div className="container mx-auto py-6 px-6">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </SidebarProvider>
        ) : (
          children
        )}
      </main>
      <Script src="https://autoback.link/autobacklink.js?ref=letsfocus.today" defer async />
      {!isFeaturePage && <Footer />}
    </div>
  );
};

export default Layout;

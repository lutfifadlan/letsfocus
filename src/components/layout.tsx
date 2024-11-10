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
  LogOut,
  Menu,
  CalendarCheck,
  ListChecks,
  Table,
  Crown
} from 'lucide-react';
import Image from 'next/image';
import ThemeSwitcher from './theme-switcher';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
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
    { href: '/todolists', label: 'Todo Lists', icon: ListChecks },
    { href: '/tasks', label: 'Tasks History', icon: Table },
    { href: '/habits', label: 'Habits', icon: CalendarCheck },
    { href: '/habits-history', label: 'Habits History', icon: Calendar },
    { href: '/stats', label: 'Task Stats', icon: BarChart },
    { href: '/pricing', label: 'Upgrade', icon: Crown },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {!isFeaturePage && <Header />}
      <main className="flex-1 w-full flex">
        {isFeaturePage ? (
          <SidebarProvider>
            <div className="flex h-screen w-full">
              <Sidebar className="z-40 bg-background border-r border-border">
                <SidebarHeader className="border-b border-border">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <Link href="/" className="flex items-center justify-center space-x-3 px-4 py-2">
                        <Image src="/logo.png" alt="logo" width={30} height={30} />
                        <span className="font-semibold text-lg dark:text-white">Let&apos;s Focus</span>
                      </Link>
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
                              className="w-full justify-start h-10 px-4 text-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                              <div className="flex items-center w-full">
                                <ThemeSwitcher />
                              </div>
                            </Button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem key='profile' className="mb-1">
                          <SidebarMenuButton asChild>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start h-10 px-4 text-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                              <Popover>
                                <PopoverTrigger asChild>
                                  <div className="flex items-center">
                                    <Avatar className="cursor-pointer rounded-full border h-5 w-5 mr-4">
                                      <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''}/>
                                      <AvatarFallback>{session?.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <span>Profile</span>
                                  </div>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-1">
                                  <p>{session?.user?.email}</p>
                                </PopoverContent>
                              </Popover>
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

              <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="sticky top-0 z-30">
                  <div className="flex items-center h-[3.9rem] px-3">
                    <SidebarTrigger>
                      <Button variant="ghost" size="sm">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle sidebar</span>
                      </Button>
                    </SidebarTrigger>
                  </div>
                </div>
                <div className="flex-1 p-6">
                  {children}
                </div>
              </div>
            </div>
          </SidebarProvider>
        ) : (
          <div className="flex-1">
            {children}
          </div>
        )}
      </main>
      <Script src="https://autoback.link/autobacklink.js?ref=letsfocus.today" defer async />
      {!isFeaturePage && <Footer />}
    </div>
  );
};

export default Layout;

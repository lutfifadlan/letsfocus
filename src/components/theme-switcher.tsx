import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { FaCoffee, FaSun, FaBusinessTime, FaTint, FaBuilding, FaTree, FaSnowflake } from 'react-icons/fa';
import { Gem, Leaf, Moon, Sun } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useSession } from 'next-auth/react';
import { useToast } from "@/hooks/use-toast";

const themes = [
  { name: "light", icon: <Sun className="w-5 h-5" /> },
  { name: "dark", icon: <Moon className="w-5 h-5" /> },
  { name: "emerald", icon: <Gem className="w-5 h-5" /> },
  { name: "retro", icon: <FaSun className="w-5 h-5" /> },
  { name: "business", icon: <FaBusinessTime className="w-5 h-5" /> },
  { name: "coffee", icon: <FaCoffee className="w-5 h-5" /> },
  { name: "autumn", icon: <Leaf className="w-5 h-5" /> },
  { name: "aqua", icon: <FaTint className="w-5 h-5" /> },
  { name: "corporate", icon: <FaBuilding className="w-5 h-5" /> },
  { name: "forest", icon: <FaTree className="w-5 h-5" /> },
  { name: "nord", icon: <FaSnowflake className="w-5 h-5" /> },
];

const ThemeSwitcher = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/user-plans');
          if (response.ok) {
            const data = await response.json();
            if (data && data.plan) {
              setIsPro(data.plan.toLocaleLowerCase().includes('pro'));
            }
          }
        } catch (error) {
          console.error('Error fetching user plan:', error);
        }
      }
    };

    fetchUserPlan();
  }, [session]);

  const handleThemeChange = (newTheme: string) => {
    if (isPro || newTheme === 'light') {
      setTheme(newTheme);
      toast({
        title: "Theme Changed",
        description: `Theme has been set to ${newTheme}.`,
      });
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="theme-switcher w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex justify-start items-center w-full">
            <div className="h-4 w-4 mr-5">
              {themes.find(t => t.name === resolvedTheme)?.icon}
            </div>
            <span>Switch Theme</span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className="w-[200px] bg-popover border border-border"
        >
          {themes.map(({ name, icon }) => (
            <DropdownMenuItem
              key={name}
              onSelect={() => handleThemeChange(name)}
              disabled={!isPro && name !== 'light'}
              className="text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <div className={`flex items-center space-x-2 w-full cursor-pointer ${!isPro && name !== 'light' ? 'opacity-50' : ''}`}>
                <span className="h-4 w-4 mr-2">{icon}</span>
                <span>{name.charAt(0).toUpperCase() + name.slice(1)}</span>
                {!isPro && name !== 'light' && <span className="text-xs text-muted-foreground ml-auto">(Pro)</span>}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ThemeSwitcher;

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
import { Button } from './ui/button';
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
  const { theme, setTheme } = useTheme();
  const [forceRender, setForceRender] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();  // Initialize toast

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

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && (isPro || savedTheme === 'light')) {
      setTheme(savedTheme);
    } else {
      setTheme('light');
    }
  }, [setTheme, forceRender, isPro]);

  useEffect(() => {
    if (theme) {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      setForceRender(prev => !prev);
    }
  }, [theme]);

  const handleThemeChange = (newTheme: string) => {
    if (isPro || newTheme === 'light') {
      setTheme(newTheme);
      toast({
        title: "Theme Changed",
        description: `Theme has been set to ${newTheme}.`,
      });
    }
  };

  return (
    <div className="theme-switcher">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            {themes.find(t => t.name === theme)?.icon}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {themes.map(({ name, icon }) => (
            <DropdownMenuItem
              key={name}
              onSelect={() => handleThemeChange(name)}
              disabled={!isPro && name !== 'light'}
            >
              <div className={`flex items-center space-x-2 cursor-pointer ${!isPro && name !== 'light' ? 'opacity-50' : ''}`}>
                {icon}
                <span>{name.charAt(0).toUpperCase() + name.slice(1)}</span>
                {!isPro && name !== 'light' && <span className="text-xs text-gray-500">(Pro)</span>}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ThemeSwitcher;

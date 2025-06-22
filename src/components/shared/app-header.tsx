"use client";

import Link from 'next/link';
import { Search, Bell, LogOut, SettingsIcon, UserCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BlabzioLogo } from '@/components/icons';
import { useSidebar } from '@/components/ui/sidebar'; // Assuming you use the shadcn sidebar
import { SidebarProvider } from '@/components/ui/sidebar';
import { notification } from '../notifications/notifications';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from "next/navigation";

import { useState } from 'react';
export function AppHeader() {
  const {user} = useAuth();
  // const { toggleSidebar } = useSidebar(); // If using shadcn sidebar for mobile
const notifications = notification(user?.uid);
 const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 " style={{zIndex:"1"}}>
      {/* Mobile nav toggle - if you add a collapsible sidebar using shadcn/ui Sidebar component */}
     
{/* 
       <Button variant="outline" size="icon" className="shrink-0 md:hidden" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </Button>
       */}
     
      {/* Desktop: Search Bar */}
      <div className="hidden flex-1 sm:flex">
        <form className="w-full"  onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
               value={query}
          onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Blabzio..."
              className="w-full appearance-none bg-muted pl-9 shadow-none md:w-2/3 lg:w-1/3 rounded-full"
            />
          </div>
        </form>
      </div>

      {/* Right side: Notifications & User Menu */}
      <div className="flex items-center gap-4 ml-auto">
         <Button variant="ghost" size="icon" className="relative rounded-full">
  <Link href="/notification" className="relative inline-block">
    <Bell className="h-5 w-5" />
    <span className="sr-only">Notifications</span>

    {notifications.length > 0 && (
      <span className="absolute top-0 right-0 block h-4 w-4 animate-ping rounded-full bg-red-500 opacity-75"></span>
    )}
    {notifications.length > 0 && (
      <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
        {notifications?.length > 9 ? "9+" : notifications.length}
      </span>
    )}
  </Link>
</Button>

        {/* User Dropdown Menu already in sidebar, this is for top header */}
        {/* This part is now handled by the sidebar for desktop, and MobileAppHeader for mobile */}
      </div>
    </header>
  );
}

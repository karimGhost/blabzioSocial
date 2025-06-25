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
import { collection, getDocs, orderBy, query, where, writeBatch } from "firebase/firestore";
import { dbe } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { useFCMPush } from '@/hooks/useFCMPush';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { useToast } from '@/hooks/use-toast';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
export function AppHeader() {
  const { isInstallable, promptInstall } = useInstallPrompt();


  const {user} = useAuth();
const {toast} = useToast();

  useFCMPush(user);


  // const { toggleSidebar } = useSidebar(); // If using shadcn sidebar for mobile  useFCMPush(user)
const notifications = notification(user?.uid);
 const [querys, setQuerys] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!querys.trim()) return;
    router.push(`/search?q=${encodeURIComponent(querys.trim())}`);
  };
const userId = user?.uid;

  const markAllAsRead = async () => {
  const q = query(
    collection(dbe, "notifications"),
    where("toUser", "==", userId),
    where("read", "==", false) // Only unread ones
  );

  const snapshot = await getDocs(q);

  const batch = writeBatch(dbe);
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { read: true });
  });

  await batch.commit();
  console.log("All notifications marked as read.");
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
     
   { isInstallable ? (
  <button onClick={promptInstall}>Install App</button>
) : null}

      {/* Desktop: Search Bar */}
      <div className="hidden flex-1 sm:flex">
        <form className="w-full"  onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
               value={querys}
          onChange={(e) => setQuerys(e.target.value)}
              placeholder="Search Blabzio..."
              className="w-full appearance-none bg-muted pl-9 shadow-none md:w-2/3 lg:w-1/3 rounded-full"
            />
          </div>
        </form>
      </div>

      {/* Right side: Notifications & User Menu */}
      <div className="flex items-center gap-4 ml-auto">
         <Button onClick={() => markAllAsRead()} variant="ghost" size="icon" className="relative rounded-full">
  <Link href="/notification" className="relative inline-block">
    <Bell className="h-5 w-5" />
    <span className="sr-only">Notifications</span>

    {/* {notifications.length > 0 && (
      <span className="absolute top-0 right-0 block h-4 w-4 animate-ping rounded-full bg-red-500 opacity-75"></span>
    )} */}
    {notifications.some((i) => i.read === false) && notifications.length > 0 && (
      <span  className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
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

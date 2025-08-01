"use client";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db , dbForums} from "@/lib/firebase";
import Link from "next/link";
import { onSnapshot } from "firebase/firestore";
import { useUnreadMessages } from "./useUnreadMessages";
import { usePathname } from "next/navigation";
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { getDoc } from "firebase/firestore";
import {
  Home,
  PlusSquare,
  Video,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Search,
  Bell,
  ShieldCheck,
  X,
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Group,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BlabzioLogo } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notification } from "../notifications/notifications";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { collection,doc, getDocs, orderBy, query, where, writeBatch } from "firebase/firestore";
import { dbe } from '@/lib/firebase';
import { CreatePostForm } from "../forms/create-post-form";
const navItems = [
  { href: "/feed", icon: Home, label: "Feed" },
    { href: "/forums", icon:Group  , label: "Forums" },

  { href: "/videos", icon: Video, label: "Videos" },
  { href: "/messages", icon: MessageSquare, label: "Messages" },
  { href: "/profile/me", icon: User, label: "Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
];



    // { href: "/News", icon: Video, label: "News" create },


export function AppSidebar() {
  const pathname = usePathname();

const {user} = useAuth()
const unreadCount = useUnreadMessages(user?.uid);
const notifications = notification(user?.uid);

useEffect(() =>{
console.log("unreadCount", unreadCount)

}, [])

  const [userData, setUserData] =useState<any>(null) ;
  const [Loading, setLoading] = useState(true);

useEffect(() => {
  if (!user) return;
  const docRef = doc(db, "users", user?.uid);

  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      setUserData({ uid: user?.uid, ...docSnap.data() });
      console.log("data", docSnap.data())
    }
    setLoading(false);
  });

  return () => unsubscribe();
}, [user]);


  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

            

  function clearUserCache(uid?: string) {
  if (uid) {
    localStorage.removeItem(`user-${uid}`);
    userCache.delete(uid);
  } else {
    // clear all
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('user-')) {
        localStorage.removeItem(key);
      }
    });
    userCache.clear();
  }
}

  const handleLogout = async () => {
    try {

      await signOut(auth);
      router.push("/"); // or home, wherever you want messages dark News video
      clearUserCache()
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };


const dropdownRef = useRef<HTMLDivElement | null>(null);
useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setShowForumDropdown(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

  const [showForumDropdown, setShowForumDropdown] = useState(false);
  const [joinedForums, setJoinedForums] = useState<string[]>([]);
  const [trendingForums, setTrendingForums] = useState<string[]>([]);

  useEffect(() => {
    const fetchForums = async () => {
      if (!user?.uid) return;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      setJoinedForums(userDoc.data()?.interests || []);

      const forumSnap = await getDocs(collection(db, "forums"));
      const trending = forumSnap.docs
        .map((d) => ({ name: d.id, posts: d.data().postCount || 0 }))
        .sort((a, b) => b.posts - a.posts)
        .slice(0, 5)
        .map((f) => f.name);
      setTrendingForums(trending);
    };

    fetchForums();
  }, [user]);


  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-card sm:flex  smflexx">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/feed" className="flex items-center gap-2 font-semibold">
          <BlabzioLogo className="h-8 w-8" />
        <span className="flex items-center font-headline text-xl">
  <b className="text-4xl font-dragon text-orange-400 m[] leading-none right-[-5px] bottom-[20px] top-[-10px]">B</b>
  <span style={{marginBottom:"-4px"}} className="bottom-[-20px]">labzio</span>
</span>
        </Link>
      </div>
   <nav className="flex-1 overflow-y-auto py-4 px-4 text-sm font-medium">
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.label} className="relative">
            {item.label !== "Forums" ? (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href ||
                    (item.href !== "/feed" && pathname.startsWith(item.href))
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                {item.href === "/messages" && unreadCount > 0 && (
                  <span className="ml-auto right-3 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            ) : (
              <>
                <button
                  onClick={() => setShowForumDropdown((prev) => !prev)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent hover:text-accent-foreground",
                    pathname.startsWith("/forums")
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-muted-foreground"
                  )}
                >
                  <Group className="h-5 w-5" />
                  Forums
                  <ChevronDown className="ml-auto h-4 w-4" />
                </button>
{showForumDropdown && (
  <div
    ref={dropdownRef}
    className="absolute z-50 mt-2 ml-2 w-64 p-3 bg-white dark:bg-zinc-900 border rounded-lg shadow-xl text-sm"
  >
    {joinedForums.length > 0 && (
      <div className="mb-3">
        <p className="text-muted-foreground font-semibold mb-2">Your Forums</p>
        {joinedForums.map((f, i) => (
          <Link
            key={i}
            href={`/forums/${f}`}
            className="flex items-center gap-2 px-2 py-1 hover:bg-accent rounded-md"
          >
            <span>{f?.emoji || "💬"}</span> #{f}
          </Link>
        ))}
      </div>
    )}

    {trendingForums.length > 0 && (
      <div className="mb-3">
        <p className="text-muted-foreground font-semibold mb-2">Trending</p>
        {trendingForums.map((f, i) => (
          <Link
            key={i}
 href={`/forums/${f.slug}`}
             className="flex items-center gap-2 px-2 py-1 hover:bg-accent rounded-md"
          >
            <span>{f.emoji || "🔥"}</span> #{f}
          </Link>
        ))}
      </div>
    )}

    <Link
      href="/forums"
      className="block text-center mt-2 text-blue-600 hover:underline text-xs"
    >
      View All Forums
    </Link>
  </div>
)}
              </>
            )}
          </li>
        ))}
      </ul>
    </nav>
      <div className="mt-auto border-t p-4">
         <Link href="/create-post">
            <Button className="w-full">
              <PlusSquare className="mr-2 h-5 w-5" /> Create Post
            </Button>
          </Link>
      </div>
      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 w-full justify-start p-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={userData?.avatarUrl} alt="@shadcn" data-ai-hint="profile avatar" />
                <AvatarFallback>  {(userData?.fullName ?? "").substring(0, 2) || "??"}
</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium leading-none">{userData?.fullName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  @{userData?.fullName}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile/me">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            {

           (!user || user.email !== "abdulkarimkassimsalim@gmail.com") ?
           ""
            :
 (
               <DropdownMenuItem asChild>
              <Link href="/admin/inbox">Admin</Link>
            </DropdownMenuItem>
            )
  
            

          }
            <DropdownMenuSeparator />


  <Card className="">
      <CardHeader>
        <div className="flex justify-between items-start w-full">
          <div>
            <CardTitle             onClick={() => setIsOpen(!isOpen)}
 className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Legal & Support
            </CardTitle>
            <CardDescription>
              Learn more about your rights and our policies.
            </CardDescription>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md hover:bg-muted"
          >
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </CardHeader>

      {!isOpen && (
         <CardContent className="space-y-2">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <p className="text-sm text-muted-foreground">Read our legal documents and policies:</p>
      <div className="flex flex-wrap gap-4">
        <Link href="/privacy" className="text-sm text-primary hover:underline">Privacy Policy</Link>
        <Link href="/terms" className="text-sm text-primary hover:underline">Terms of Service</Link>
        <Link href="/policy" className="text-sm text-primary hover:underline">Cookies Policy</Link>
        <Link href="/help" className="text-sm text-primary hover:underline">Support</Link>
      </div>
    </div>
  </CardContent>

      )}
    </Card>


<Card className="">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <HelpCircle className="h-6 w-6 text-primary" /> Help & Support
    </CardTitle>
    <CardDescription>Find FAQs, contact support, or report a problem.</CardDescription>
  </CardHeader>
  <CardContent>
    <Link href="/help" className="text-sm text-primary hover:underline">Go to Help Center</Link>
  </CardContent>
</Card>


            <DropdownMenuItem asChild>
                <button
      onClick={handleLogout}
      className="flex items-center text-sm text-red-600 hover:underline"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

export function MobileAppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const {user} = useAuth()
const notifications = notification(user?.uid);
 const [querys, setQuerys] = useState("");
const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!querys.trim()) return;
    router.push(`/search?q=${encodeURIComponent(querys.trim())}`);
  };

const unreadCount = useUnreadMessages(user?.uid);
  const { isInstallable, promptInstall } = useInstallPrompt();
 const [showInput, setShowInput] = useState(false);

  const [visible, setVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setVisible(false);
          setShowInput(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [userData, setUserData] = useState<any>(null);
  const [Loading, setLoading] = useState(true);




  const toggleInput = () =>{
    setShowInput(!showInput);
    setVisible((v) => !v)
  } 


useEffect(() => {
  if (!user) return;
  const docRef = doc(db, "users", user?.uid);

  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      setUserData({ uid: user?.uid, ...docSnap.data() });
      console.log("data", docSnap.data())
    }
    setLoading(false);
  });

  return () => unsubscribe();
}, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
            localStorage.clear();
      router.push("/"); // or home, wherever you want
    } catch (error) {
      console.error("Logout failed:", error);
    }
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


  const [timedouts, setTimeouts] = useState(false);

  useEffect(() => {
    // First timeout after 2 seconds
    const firstTimer = setTimeout(() => {
      setTimeouts(true);
    }, 2000);

    return () => clearTimeout(firstTimer); // cleanup
  }, []);

  useEffect(() => { 
    if (timedouts) {
      // Second timeout after 5 seconds when timedouts becomes true
      const secondTimer = setTimeout(() => {
        setTimeouts(false);
      }, 8000);

      return () => clearTimeout(secondTimer); // cleanup
    }
  }, [timedouts]);


   const [AppInstalled, setAppInstalled] = useState<any>(null)
  
    useEffect(() => {
  
      const APPP = localStorage.getItem("Appinstalled");
      if(APPP){
        setAppInstalled(APPP)
  
      }
    },[user])

   return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:hidden">
        <DropdownMenu>

          <DropdownMenuTrigger asChild>      

<div style={{position:"relative", padding:"0px"}}>
  <Button   className="outline"  style={{color:"black" ,border:"1px solid white", borderColor:"white"}} size="icon">


             <BlabzioLogo  style={{width:"40px", height:"40px"}}  className="h-9 w-9 justify m-auto" />
                

                              
                <span className="sr-only">Toggle Menu</span>
                                         {/* <Menu className="h-5 w-5" /> */}

            </Button>
           <div style={{ position: "absolute", top: "10px", left: "20px", zIndex: 9 }}>
  {unreadCount > 0 && (
    <span className="heartbeat-dot"></span>
  )}
</div>

</div>
          
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {navItems.map((item) => (
                 <DropdownMenuItem key={item.label} asChild>
                  
                 <>
                    <div className="flex ">
                        
                      
                   <Link href={item.href} className={cn(
                        "flex items-center gap-2 w-full",
                        pathname === item.href ? "bg-muted" : ""
                    )}>
                    
                        <item.icon className="h-4 w-4"/>
                        {item.label}
                    </Link>
                     


                       {/* 🔴 Unread badge for Messages */}
            {item.href === "/messages" && unreadCount > 0 && (
              <span className=" right-4 top-3 flex h-4 w-4 items-center mt-1 mr-2 justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}

              </span>

            )}

             </div>
                 
                 </>
                  



                 </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator/>
             <DropdownMenuItem asChild>
               <Link href="/create-post">
                 <PlusSquare className="mr-2 h-4 w-4" /> Create Post
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator/>
            <DropdownMenuItem asChild>
               <button
      onClick={handleLogout}
      className="flex items-center text-sm text-red-600 hover:underline"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="flex-1">
            <Link href="/feed" className="flex items-center gap-2 font-semibold">
    <span className="flex items-center font-headline text-xl">
  <b className="text-4xl font-dragon text-orange-400 m[] leading-none right-[-5px] bottom-[20px] top-[-10px]">B</b>
  <span style={{marginBottom:"-4px"}} className="bottom-[-20px]">labzio</span>
</span>
           </Link>
        </div>


  <div className="relative flex items-center w-full md:w-auto">





  {visible && (
        <div ref={wrapperRef} className="absolute left-0 right-0 z-50 flex justify-center mt-2">
          <form  style={{width:"90%",margin:"auto",zIndex:"99", position:"fixed",top:"50px",left:"0", right:"0" }}  onSubmit={handleSearch} className="w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           
                 {/* Search Input */}

              <Input
                type="search"
                value={querys}
                name="search"
                onChange={(e) => setQuerys(e.target.value)}
                placeholder="Search Blabzio..."
                  autoComplete="off"

className={cn(
          "bg-muted pl-9 rounded-full transition-all shadow-none",
          "absolute left-0 top-0 w-full", // mobile
          "md:static md:w-64 md:opacity-100", // desktop
          showInput ? "opacity-100" : "opacity-0 pointer-events-none md:opacity-100"
        )}              />
            </div>
          </form>
        </div>
      )}



   



        <Button         onClick={toggleInput}
 variant="ghost" size="icon" className="rounded-full">
          
          {showInput ?  <X className="h-5 w-5" />  :  <Search className="h-5 w-5" /> }
      
            <span className="sr-only">Search</span>
        </Button>
      </div>
      
         <Button onClick={() => markAllAsRead()} variant="ghost" size="icon" className="relative rounded-full">
  <Link href="/notification" className="relative inline-block">
    <Bell className="h-5 w-5" />
    <span className="sr-only">Notifications</span>

    {notifications.some((i) => i.read === false) && notifications.length > 0 && (
      <span className="absolute top-0 right-0 block h-4 w-4 animate-ping rounded-full bg-red-500 opacity-75"></span>
    )}
    {notifications.some((i) => i.read === false) && notifications.length > 0 && (
      <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
        {notifications?.length > 9 ? "9+" : notifications.length}

      </span>
    )}
  </Link>
</Button>

         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-9 w-9 cursor-pointer">
                <AvatarImage src={userData?.avatarUrl} alt="User Avatar" data-ai-hint="user avatar"/>
                <AvatarFallback>{(userData?.fullName ?? "").substring(0, 2) || "??"}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/profile/me">Profile</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
{

   (!user || user.email !== "abdulkarimkassimsalim@gmail.com") ?
           ""
            :
 (
               <DropdownMenuItem asChild>
              <Link href="/admin/inbox">Admin</Link>
            </DropdownMenuItem>
            )
  
            

          }

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Button onClick={handleLogout} ><LogOut className="mr-2 h-4 w-4" />Logout</Button></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

  { isInstallable ? ( AppInstalled ? null :
  <div
      className={`slide-container ${timedouts ? "slide-in" : "slide-out"}`}
    >
      <Button className="bg-primary" onClick={promptInstall}>
        Install App
      </Button>
    </div>

        ) : null}

       
    </header>
   );
}

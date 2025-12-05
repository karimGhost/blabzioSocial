'use client';

import { ColumnDef } from '@tanstack/react-table';
// import { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ref } from 'firebase/database';
import { db, rtdb } from '@/lib/firebase';
import { DialogHeader,DialogContent,Dialog, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
export interface User {
  notificationSettings(notificationSettings: any, arg1: null, arg2: number): import("react").ReactNode;
  forumsCreated(forumsCreated: any, arg1: null, arg2: number): import("react").ReactNode;
  keywords(keywords: any, arg1: null, arg2: number): import("react").ReactNode;
  privacySettings: any;
  isPremium(isPremium: any): unknown;
  deactivation(deactivation: any): unknown;
  user(deactivation: any): unknown;
  deactivated(deactivated: any): unknown;
  followingCount: any;
  postsCount: any;
  followersCount: any;
  updatedAt: any;
  createdAt: any;
  theme: any;
  uid: any;
  bio: any;
  username: any;
  CoverPhoto: string | undefined;
  id: string;
  name: string;
  email: string;
  avatarUrl:string;
  fullName: string;
  status:string

}

export const columns:  ColumnDef<User, unknown>[]  = [
  {
    accessorKey: 'name',
    header: 'User',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={ user?.avatarUrl
        ? user?.avatarUrl.replace(
            "/upload/",
            "/upload/w_320,h_320,c_fill,f_auto,q_auto/"
          )
        : "/default-avatar.png"} alt={user?.fullName} />
            <AvatarFallback>{user?.fullName.charAt(0)}</AvatarFallback> 
          </Avatar>
          <div>
            <div className="font-medium">{user?.fullName}</div>
            <div className="text-sm text-muted-foreground">{user?.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const user = row.original;
      const status = user.status;

    
      

      return (
        <Badge
          variant="outline"
          className={cn({
            'border-green-600 bg-green-50 text-orange-500': status === 'Active',
            'border-red-600 bg-red-50 text-red-700': status === 'Banned',
            'border-yellow-600 bg-yellow-50 text-yellow-700': status === 'Pending',
          })}
        >
          {status}
          
        </Badge>
      );
    },
  },
  {
    accessorKey: 'lastLogin',
    header: 'Last Login',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;

      const [open, setOpen] = useState(false);
  
      

const DisplayField = ({ label, value }: any) => (
  <div style={{width:"fit-content"}} className="flex flex-col  space-y-1">
    <Label className="text-sm font-medium">{label}</Label>
    <Input readOnly value={value ?? ""} className="bg-muted" />
  </div>
)


const reactivateAccount = async (uid: string) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    terminated: false,
    terminatedAt: "",
    terminationReason: "",
    deactivated: false,
  });
};


const handleDeleteUser = async (uid: string) => {
  try {
    const userDocRef = doc(db, "users", uid);
    await deleteDoc(userDocRef);
  toast({
        title: "Deleted",
        description: "Account Deleted.",
      });

  
  } catch (error) {
    console.error("Failed to Deleted account:", error);
     toast({
        title: "Failed ",
        description: "Failed to Deleted account.",
      });
  }
};
   

const handleTerminateAccount = async (uid: string) => {
  try {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, {
      terminated: true,
      reason: "Violated community guidelines",
      terminatedAt: serverTimestamp(),
      terminationReason: "Violated community guidelines", // optional
      deactivated: true, // optional if you want to prevent login
      isPremium: false,
    });
  toast({
        title: "Terminated",
        description: "Account terminated.",
      });

  
  } catch (error) {
    console.error("Failed to terminate account:", error);
     toast({
        title: "Failed ",
        description: "Failed to terminate account.",
      });
  }
};
   
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => {
  if (navigator?.clipboard) {
    navigator.clipboard.writeText(user.id);
  }
}}>
              Copy user ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <>


 

                        <DropdownMenuItem
                        
  onSelect={(e) => {
        e.preventDefault();
 open === false && setOpen(true)
  }}
                       >View details</DropdownMenuItem>

  <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] max-w-[100vh] justify-center  overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information for: {user?.fullName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">

            {/* Images */}
            <div>
              <p className="font-semibold">CoverPhoto</p>
              <img src={user?.CoverPhoto} className="w-50 rounded" />
              {/* <p style={{whiteSpace:"break-spaces"}} className="text-gray-500">{user.CoverPhoto}</p> */}
            </div>

            <div>
              <p  className="font-semibold">Avatar</p>
              <img src={user.avatarUrl} className="w-24 h-24 rounded-full" />
              {/* <p style={{whiteSpace:"break-spaces"}} className="text-gray-500">{user.avatarUrl}</p> */}
            </div>

          {/* String fields */}
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:"1rem"}}>

            <DisplayField  label="Full Name" value={user.fullName} />
<DisplayField label="Username" value={user.username} />
<DisplayField label="Email" value={user?.email} />
<DisplayField label="Bio" value={user?.bio} />
<DisplayField label="UID" value={user?.uid} />
<DisplayField label="Status" value={user?.status} />
<DisplayField label="Theme" value={user?.theme} />

{/* Numbers */}
<DisplayField label="Created At" value={new Date(user?.createdAt) } />
<DisplayField label="Updated At" value={user?.updatedAt} />
<DisplayField label="Followers Count" value={user?.followersCount} />
<DisplayField label="Following Count" value={user?.followingCount} />
<DisplayField label="Posts Count" value={user?.postsCount} />

{/* Boolean fields */}
<DisplayField label="Deactivated" value={String(user?.deactivated)} />
<DisplayField label="Deactivation" value={String(user?.deactivation)} />
<DisplayField label="Is Premium" value={String(user?.isPremium)} />
<DisplayField
  label="Private Account"
  value={String(user?.privacySettings?.privateAccount)}
 />
<DisplayField
  label="Activity Status"
  value={String(user?.privacySettings?.activityStatus)}
/>
          </div>


            {/* Arrays */}
            <div style={{width:"fit-content"}}>
              <p className="font-semibold">Keywords</p>
              <pre  className="bg-shadow border text-dark p-2 rounded bg-background">{JSON.stringify(user?.keywords, null, 2)}</pre>
            </div>

            <div style={{width:"fit-content"}}>
              <p className="font-semibold">Forums Created</p>
              <pre  className="bg-shadow borderp-2 rounded">{JSON.stringify(user?.forumsCreated, null, 2)}</pre>
            </div>

            {/* Maps */}
            <div style={{width:"fit-content"}}>
              <p className="font-semibold">Notification Settings</p>
              <pre  className="bg-shadow border p-2 rounded">{JSON.stringify(user?.notificationSettings, null, 2)}</pre>
            </div>

            <div style={{width:"fit-content"}}>
              <p className="font-semibold">Privacy Settings</p>
              <pre className="bg-shadow border p-2 rounded">{JSON.stringify(user?.privacySettings, null, 2)}</pre>
            </div>

          </div>
        </DialogContent>
      </Dialog>
            </>

            <DropdownMenuItem>Edit user</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTerminateAccount(user?.uid)} className="text-destructive">Ban user</DropdownMenuItem>

            <DropdownMenuItem onClick={() => handleDeleteUser(user?.uid)} className="text-destructive">Delete user</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => reactivateAccount(user?.uid)} className="text-destructive">Active user</DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

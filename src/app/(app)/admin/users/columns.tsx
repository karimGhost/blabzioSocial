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
import { rtdb } from '@/lib/firebase';

//onClick
export interface User {
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
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit user</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Ban user</DropdownMenuItem>

            <DropdownMenuItem className="text-destructive">Delete user</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">Active user</DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

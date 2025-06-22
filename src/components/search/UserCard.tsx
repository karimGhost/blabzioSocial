"use client";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function UserCard({ user }: { user: any }) {
  return (
    <Link href={`/profile/${user?.uid || user?.uid}`}>
      <Card className="p-4 flex items-center gap-4 cursor-pointer hover:bg-accent transition">
        <Image
          src={user?.avatarUrl || "/default-avatar.png"}
          alt={user?.fullName || "User"}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <p className="font-semibold">{user?.fullName || "User"}</p>
          <p className="text-muted-foreground text-sm">@{user?.username || "username"}</p>
        </div>
      </Card>
    </Link>
  );
}
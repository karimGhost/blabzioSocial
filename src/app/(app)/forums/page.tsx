"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { dbForums } from "@/lib/firebase"; // ✅ from your separate forums Firebase config

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Lock, Earth } from "lucide-react";

interface Forum {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  isPrivate: boolean;
  is18Plus: boolean;
  memberCount?: number;
  imageUrl?: string;
  aiHint?: string;
}

export default function Home() {
  const [forums, setForums] = useState<Forum[]>([]);

  useEffect(() => {
    const fetchForums = async () => {
      const snapshot = await getDocs(collection(dbForums, "forums"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Forum[];
      setForums(data);
    };

    fetchForums();
  }, []);

  return (
    <section className="py-12 md:py-20 lg:py-14">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
            Discover Forums
          </h2>
          <Link
            href="/forums/create"
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            <Button className="bg-orange-400">Create Forum</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {forums.map((forum) => (
            <Card
              key={forum.id}
              className="flex flex-col overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl"
            >
              <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                  <Image
                    src={forum.imageUrl || "https://placehold.co/600x400"}
                    alt={forum.name}
                    fill
                    className="object-cover"
                    data-ai-hint={forum.aiHint}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary">{forum.category}</Badge>
                    <div className="flex items-center gap-4">
                      {forum.is18Plus && (
                        <Badge variant="destructive">18+</Badge>
                      )}
                      {forum.isPrivate ? (
                        <span
                          className="flex items-center text-xs text-muted-foreground"
                          title="Private Forum"
                        >
                          <Lock className="h-3 w-3 mr-1" /> Private
                        </span>
                      ) : (
                        <span
                          className="flex items-center text-xs text-muted-foreground"
                          title="Public Forum"
                        >
                          <Earth className="h-3 w-3 mr-1" /> Public
                        </span>
                      )}
                    </div>
                  </div>
                  <CardTitle className="mt-2 font-headline">
                    {forum.name}
                  </CardTitle>
                  <CardDescription className="mt-2 h-12 overflow-hidden">
                    {forum.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow"></CardContent>
              <CardFooter className="flex justify-between items-center bg-muted/50 p-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-2" />
                  {(forum.memberCount || 0).toLocaleString()} members
                </div>
                <Link href={`/forums/${forum.slug}`}>
                  <Button variant={forum.isPrivate ? "outline" : "default"}>
                    {forum.isPrivate ? "Request to Join" : "Join Forum"}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

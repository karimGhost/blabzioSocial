"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db, dbb } from "@/lib/firebase";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ThumbsUp, PenSquare, Eye } from "lucide-react";
import StatCard from "@/components/dashboard/stat-card";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { useUsersList } from "../users/useUsersList";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Author {
  name: string;
  id: string;
}

export interface ContentPost {
  createdAt: any;
  id: string;
  content: string;
  platform: "Instagram" | "Twitter" | "Facebook";
  status: "Pending" | "Approved" | "Rejected";
  author: Author;
  timestamp: number; // Firestore timestamp as number
}

export default function DashboardPage() {
  const { users, contentPosts, loading } = useUsersList();


   if (loading) return <div>Loading...</div>;

 
  const totalUsers = users.length;
  const totalPosts = contentPosts.length;
  const pendingContent = contentPosts.filter((p) => p.status === "Pending").length;

  return (
    <div className="flex flex-col gap-8">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={totalUsers.toString()} icon={<Users />} />

        <StatCard
          title="Engagement Rate"
          value="58.2%"
          icon={<ThumbsUp />}
          description="+5% from last month"
        />

        <StatCard title="Total Posts" value={totalPosts.toString()} icon={<PenSquare />} />

        <StatCard
          title="Content to Review"
          value={pendingContent.toString()}
          icon={<Eye />}
          variant="warning"
        />
      </div>

      {/* Charts + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">User Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsCharts />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contentPosts.slice(0, 4).map((post) => (
                <div key={post.id} className="flex items-center gap-4">
                  
                  {/* Social icon placeholder */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    {post.platform === "Instagram" ? "I" : post.platform === "Twitter" ? "T" : "F"}
                  </div>

                  <div className="flex-1">
                    <p
                      style={{ whiteSpace: "break-spaces" }}
                      className="text-sm font-medium truncate"
                    >
                      {post.content.length > 100 ? post.content.slice(0, 100) + "..." : post.content  }
                    </p>
                    <p className="text-xs text-muted-foreground">by {post.author?.name}</p>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString()
                      : "--"}
                  </div>

                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { Admin, db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
export default function AdminInboxPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  
  const router = useRouter();
  useEffect(() => {
    const fetchData = async () => {
      const reportsSnap = await getDocs(
        query(collection(Admin, "reports"), orderBy("createdAt", "desc"))
      );
      const messagesSnap = await getDocs(
        query(collection(Admin, "supportMessages"), orderBy("createdAt", "desc"))
      );
      const paymentsSnap = await getDocs(
        query(collection(db, "payments"), orderBy("createdAt", "desc"))
      );
console.log("admins", reportsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      setReports(reportsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setMessages(messagesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setPayments(paymentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    if (user?.email === "abdulkarimkassimsalim@gmail.com") {
      fetchData();
    }
  }, [user]);

  const handleReply = async (messageId: string) => {
    const replyText = replyInputs[messageId];
    if (!replyText) return;
    await addDoc(collection(Admin, "supportMessages", messageId, "replies"), {
      reply: replyText,
      sender: "admin",
      createdAt: serverTimestamp(),
    });
    setReplyInputs((prev) => ({ ...prev, [messageId]: "" }));
  };

  if (!user || user.email !== "abdulkarimkassimsalim@gmail.com") {
    return <p className="text-red-500 p-4 text-center">Access denied</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📥 Admin Inbox</h1>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="reports">Bug-Reports</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        {/* Bug Reports */}
        <TabsContent value="reports">
          <div className="grid gap-4">
            {reports.length === 0 && (
              <p className="text-muted-foreground">No bug reports found.</p>
            )}


            {reports.map((r) => (
              <Card key={r.id}>
                <CardHeader>

                  <h1>From User-Email: {r.email}</h1>
                  <h2>
                    userId : {r.userId}
                  </h2>
                            <div className="flex items-center gap-2 pt-2 sm:pt-0">

                  <Button onClick={() =>  router.push(`/profile/${r.userId}`)}>View User</Button>
                  </div>
                  <CardTitle className="text-sm text-muted-foreground">
                    {r.message}
                  </CardTitle>

                </CardHeader>
                <CardContent>

                  <p className="text-xs text-gray-500">
                    Submitted {r.createdAt?.toDate()?.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Support Messages */}
        <TabsContent value="support">
          <div className="grid gap-4">
            {messages.length === 0 && (
              <p className="text-muted-foreground">No support messages yet.</p>
            )}
            {messages.map((m) => (
              <Card key={m.id}>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">
                    {m.message}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-gray-500">From: {m.email ?? "Unknown"}</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Reply..."
                      value={replyInputs[m.id] || ""}
                      onChange={(e) =>
                        setReplyInputs((prev) => ({
                          ...prev,
                          [m.id]: e.target.value,
                        }))
                      }
                    />
                    <Button onClick={() => handleReply(m.id)}>Send</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Premium Payments */}
        <TabsContent value="payments">
          <div className="grid gap-4">
            {payments.length === 0 && (
              <p className="text-muted-foreground">No payments found.</p>
            )}
            {payments.map((p) => (
              <Card key={p.id}>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">
                    {p.paymentMethod?.toUpperCase()} – {p.paymentId}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-gray-500 space-y-1">
                  <p>User ID: {p.userId}</p>
                  <p>Subscription: {p.subscriptionMonths} month(s)</p>
                  <p>Expires: {p.expiresAt?.toDate?.()?.toLocaleDateString?.()}</p>
                  <p>Created: {p.createdAt?.toDate?.()?.toLocaleString?.()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

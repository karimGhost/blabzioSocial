
"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { Admin, db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

export interface User {
   id: string;
  name: string;
  email: string;
  avatarUrl:string;
  fullName: string;
  status:string

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
export function useContentMod() {
const { user } = useAuth();

  const [reports, setReports] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  const [reportedUsers, setreportedUsers] = useState<any[]>([]);

    const [Postsreports, setPostsreports] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const reportsSnap = await getDocs(
        query(collection(Admin, "reports"), orderBy("createdAt", "desc"))
      );
      const messagesSnap = await getDocs(
        query(collection(Admin, "supportMessages"), orderBy("createdAt", "desc"))
      );


      const PostsreportsSnap = await getDocs(
        query(collection(Admin, "Postsreports"), orderBy("createdAt", "desc"))
      );

const reportedUsersSnap  = await getDocs(
        query(collection(Admin, "reportedUsers"), orderBy("createdAt", "desc"))
      );


      const paymentsSnap = await getDocs(
        query(collection(db, "payments"), orderBy("createdAt", "desc"))
      );

console.log("admins", reportsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
setPostsreports(PostsreportsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

console.log("Reports", PostsreportsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) )

      setReports(reportsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setreportedUsers(reportedUsersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      setMessages(messagesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setPayments(paymentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    if (user?.email === "abdulkarimkassimsalim@gmail.com") {
      fetchData();
    }
  }, [user]);



  return {    reports,
    messages,
    payments,
    reportedUsers,
    Postsreports
  };

}
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  limit,
  deleteDoc,
} from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { dbForums } from '@/lib/firebase';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

export default function ForumSettingsPage() {
  const { user } = useAuth();
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
const {toast} = useToast()

  const [forum, setForum] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [allowPublicPosting, setAllowPublicPosting] = useState(false);

  useEffect(() => {
    if (!slug || !user) return;

    const fetchForumData = async () => {
      const forumQuery = query(
        collection(dbForums, 'forums'),
        where('slug', '==', slug),
        limit(1)
      );
      const forumSnap = await getDocs(forumQuery);
      if (forumSnap.empty) {
        router.push('/forums');
        return;
      }

      const forumDoc = forumSnap.docs[0];
      const forumData = { id: forumDoc.id, ...forumDoc.data() };

      // Ensure current user is Admin
      const adminDoc = await getDoc(
        doc(dbForums, 'forums', forumData.id, 'members', user.uid)
      );
      const adminData = adminDoc.exists() ? adminDoc.data() : null;

      if (!adminData || adminData.role !== 'Admin') {
        toast.error('Access denied. Admins only.');
        router.push(`/forums/${slug}`);
        return;
      }

      setForum(forumData);
      setAllowPublicPosting(forumData.settings?.allowPublicPosting ?? false);

      const membersSnap = await getDocs(
        collection(dbForums, 'forums', forumData.id, 'members')
      );
      const membersData = membersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMembers(membersData);
    };

    fetchForumData();
  }, [slug, user]);

  const handleSaveSettings = async () => {
    try {
      await updateDoc(doc(dbForums, 'forums', forum.id), {
        settings: {
          ...forum.settings,
          allowPublicPosting,
        },
      });
                      toast({ title: "updated", description: "Settings updated" });

    } catch (err) {
                      toast({ title: "Failed",variant:"destructive", description: "Failed to update settings." });

    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user from the forum?')) return;

    try {
      await deleteDoc(doc(dbForums, 'forums', forum.id, 'members', userId));
      setMembers((prev) => prev.filter((m) => m.id !== userId));
                      toast({ title: "removed", description: "User removed." });

    
    } catch (err) {
                      toast({ title: "Failed",variant:"destructive", description: "Failed to remove user.." });

     
    }
  };

  if (!forum) return <div className="p-8">Loading...</div>;

  return (
    <div className="container py-10 max-w-3xl space-y-10">
<div className="flex items-center justify-between">
  <h1 className="text-2xl font-bold">Forum Settings: {forum.name}</h1>
  <Button
    variant="outline"
    onClick={() => router.push(`/forums/${slug}`)}
  >
    Back to Forum
  </Button>
</div>
      {/* --- PUBLIC POSTING TOGGLE --- */}
      <div className="flex items-center justify-between">
        <span>Allow Public to Create Articles</span>
        <Switch
          checked={allowPublicPosting}
          onCheckedChange={setAllowPublicPosting}
        />
      </div>

      <Button onClick={handleSaveSettings}>Save Settings</Button>

      {/* --- MANAGE USERS --- */}
      <div>
        <h2 className="text-xl font-semibold mt-10 mb-4">Manage Users</h2>

        <div className="grid gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex justify-between items-center border p-3 rounded-md bg-background"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.avatarUrl} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>

              {member.role !== 'Admin' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveUser(member.id)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
const [rules, setRules] = useState<string>('');
const [Description, setDescription] = useState<string>('');
  const [forum, setForum] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [allowPublicPosting, setAllowPublicPosting] = useState(false);
  const [privateForum, setprivateForum] = useState<boolean>(false);

  useEffect(() => {
  if (!slug || !user) return;

  const fetchForumData = async () => {
    // ✅ Directly fetch doc if slug is actually the Firestore doc ID
    const forumRef = doc(dbForums, "forums", slug);
    const forumSnap = await getDoc(forumRef);

    if (!forumSnap.exists()) {
      router.push("/forums");
      return;
    }

    const forumData = { id: forumSnap.id, ...forumSnap.data() };

    // ✅ Check admin role
    const adminRef = doc(dbForums, "forums", forumData.id);
    const adminSnap = await getDoc(forumRef);
    const adminData = adminSnap.exists() ? adminSnap.data() : null;

      if (!adminData || adminData.adminId !== user?.uid) {
        router.push(`/forums/${slug}`);
        return;
      }

    setForum(forumData);
    setprivateForum((forumData as any)?.isPrivate );
    setAllowPublicPosting((forumData as any)?.settings?.allowPublicPosting ?? false);
setRules((forumData as any)?.settings?.rules );
setDescription((forumData as any)?.description );
    // ✅ Fetch members
    const membersSnap = await getDocs(
      collection(dbForums, "forums", (forumData as any).id, "members")
    );
    const membersData = membersSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMembers(membersData);
  };

  fetchForumData();
}, [slug, user]);



useEffect(() => {

console.log("rules", rules)
}, [rules])

  const handleSaveSettings = async () => {
    try {
      await updateDoc(doc(dbForums, 'forums', forum.id), {
        isPrivate:privateForum,
        description:Description, 
        settings: {
          ...forum.settings,
          allowPublicPosting,
            rules: rules || "", 

        },
      });
                      toast({ title: "updated", description: "Settings updated" });

    } catch (err) {
      console.log("err", err)
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



  const deleteSubcollection = async (forumId: string, subcollection: string) => {
    const snap = await getDocs(collection(dbForums, "forums", forumId, subcollection));
    const deletions = snap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletions);
  };
  
  const TerminateForum = async (forumId: string) => {
   const confirmed = window.confirm("Are you sure you want to delete the forum?");
  if (!confirmed) return;
    try {
      // Delete subcollections if needed
      await deleteSubcollection(forumId, "members");
      await deleteSubcollection(forumId, "requests");
      await deleteSubcollection(forumId, "posts");
  
      // Finally delete the forum doc
      await deleteDoc(doc(dbForums, "forums", forumId));
  
      toast({
        title: "Success",
        description: "The forum and its data have been permanently deleted.",
      });
  
      // Update local state
    } catch (err) {
      console.error("Error deleting forum:", err);
      toast({
        title: "Failed",
        variant: "destructive",
        description: "Failed to delete forum.",
      });
    }
  };
  

  if (!forum) return <div className="p-8">Loading...</div>;

  return (
    <div className="container py-10 max-w-3xl space-y-10">
<div className="flex items-center justify-between">
  <h1 className="text-2xl font-bold">Forum Settings: {forum.name}</h1>
  <Button
    variant="outline"
    onClick={() => router.back()}
  >
    Back to Forum
  </Button>
</div>
      {/* --- PUBLIC POSTING TOGGLE --- */}
      <div className="flex items-center justify-between">
          <div style={{padding:"10px"}}>
         <span style={{marginRight:"10px"}}>Allow Members to Create</span>

        <Switch 
          checked={allowPublicPosting}
          onCheckedChange={setAllowPublicPosting}
        />

      </div>
       
              <Button onClick={() => TerminateForum(forum.id)} variant="destructive">Delete Forum</Button>


      </div>
        <div className="flex items-center justify-between">
          <div style={{padding:"10px"}}>
             <span  style={{textDecorationColor:"turquoise",fontWeight:"bold", color:"muted", textShadow: privateForum ? "1px 1.2px orange" :" ", marginRight:"10px"}}>{privateForum ? "Private Forum" : "Public Forum"}</span>
        
     <Switch
     className='sm'
  checked={privateForum}
  onCheckedChange={() =>  setprivateForum((prev) => !prev)}
/> 
          </div>
      




      </div>


<div className="space-y-2">
  <label className="font-medium">Forum about</label>
  <textarea
    className="w-full border rounded-md p-2 bg-background"
    placeholder="Write your forum description..."
    value={Description}
    onChange={(e) => setDescription(e.target.value)}
    rows={5}
  />
</div>

<div className="space-y-2">
  <label className="font-medium">Forum Rules</label>
  <textarea
    className="w-full border rounded-md p-2 bg-background"
    placeholder="Write your forum rules here..."
    value={rules}
    onChange={(e) => setRules(e.target.value)}
    rows={5}
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
                  <AvatarImage src={member?.avatarUrl} alt={member.name} />
                  <AvatarFallback>{member?.name?.charAt(0)}</AvatarFallback>
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

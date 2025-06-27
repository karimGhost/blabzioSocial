"use client";
import { useEffect, useState , useRef} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Lock, Bell, Shield, Palette, UserCircle, LogOut, Loader2, ShieldCheck, HelpCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { deleteUser, signOut } from "firebase/auth";
import { doc, getDoc,setDoc, collection, getDocs, query, where, updateDoc, deleteDoc } from "firebase/firestore";
import { db , dbb} from "@/lib/firebase";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import Link from "next/link";
export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
const {user, userData, setUserData} = useAuth();
 const [avatarUrl, setAvatarUrl] = useState(userData?.avatarUrl);
const [uploading, setUploading] = useState(false);
const [password, setPassword] = useState("");
const [repeatPassword, setRepeatPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [error, setError] = useState("");
const [currentPassword, setCurrentPassword] = useState("");
const [isReauthenticating, setIsReauthenticating] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [privacySettings, setPrivacySettings] = useState<Record<PrivacySettingKey, boolean>>({
  privateAccount: false,
  activityStatus: true,
});

type NotificationType = "newFollower" | "postLike" | "postComment" | "replies" | "directMessage";

const [notifications, setNotifications] = useState<Record<NotificationType, boolean>>({
  newFollower: true,
  postLike: true,
  postComment: true,
  directMessage: true,
  replies:true,
});




type ThemeMode = "light" | "dark";

const [theme, setTheme] = useState<ThemeMode>("light");



type PrivacySettingKey = "privateAccount" | "activityStatus";



const fileInputRef = useRef<HTMLInputElement>(null);




const handleReauthenticate = async () => {
  if (!user || !user.email) return;

  try {
    setIsReauthenticating(true);
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    await updatePassword(user, password); // retry here
toast({ title: "Password updated successfully ✅" });

    toast({ title: "Re-authenticated! Try again now." });
    setError(""); // clear the re-auth error
  } catch (err) {
    console.error("Re-authentication failed:", err);
    setError("Re-authentication failed. Check your current password.");
  } finally {
    setIsReauthenticating(false);
  }
};

const handleReactivateAccount = async () => {
  const userRef = doc(db, "users", user?.uid as string);
  await updateDoc(userRef, {
    deactivation: false,
  });

  alert("Account reactivated!");
  // Optionally reload user data or redirect
};

useEffect(() => {
  if (!user?.uid) return;

  const docRef = doc(db, "users", user.uid);

  const fetchSettings = async () => {
    try {
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return;

      const data = docSnap.data();

      // Theme
      const savedTheme = data.theme;
      if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);
        document.documentElement.classList.toggle("dark", savedTheme === "dark");
        
                localStorage.setItem("darkMode",  savedTheme === "dark" ? "true" : "false")

      }

      // Notifications
      if (data.notificationSettings) {
        setNotifications(data.notificationSettings);
      }

      // Privacy
      if (data.privacySettings) {
        setPrivacySettings(data.privacySettings);
      }
    } catch (err) {
      console.error("Failed to load user settings:", err);
    }
  };

  fetchSettings();
}, [user]);




  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, section: string) => {
    e.preventDefault();
    toast({
      title: `${section} Settings Updated`,
      description: `Your ${section.toLowerCase()} settings have been saved.`,
    });
  };

 

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
      router.push("/"); // or home, wherever you want
      clearUserCache()

    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleAvatarChange = async (e: React.FormEvent<HTMLFormElement>, section: string) => {
    if (!e.target?.files?.[0]) return;
    const file = e.target?.files[0];
  
    if (!file.type.startsWith("image/") ) {
      toast({
        title: "Invalid File",
        description: "Please select a valid image file.",
        variant: "destructive",
      });
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "profilePic"); // Your preset
    formData.append("folder", "profiledp"); // Optional folder
  
    setUploading(true);
  
    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dpebbtz2z/image/upload", {
        method: "POST",
        body: formData,
      });
  
      const data = await res.json();
      if (data.secure_url) {
        setAvatarUrl(data.secure_url);
  
        if (user?.uid) {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { avatarUrl: data.secure_url });
        }
  
        toast({
          title: "Avatar Updated",
          description: "Your profile picture has been updated.",
        });
      } else {
        throw new Error("No secure URL returned");
      }
    } catch (error) {
      console.error("Upload failed", error);
      toast({
        title: "Upload Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

const handleSavePrivacy = async () => {
  if (!user?.uid) return toast({ title: "Please log in" });

  const docRef = doc(db, "users", user.uid);

  try {
    await updateDoc(docRef, {
      privacySettings,
    });

    toast({ title: "Privacy settings saved ✅" });
  } catch (err) {
    console.error("Error saving privacy settings:", err);
    toast({ title: "Failed to save", variant: "destructive" });
  }
};

const reauthenticate = async (email: string, currentPassword: string) => {
  const credential = EmailAuthProvider.credential(email, currentPassword);
  await reauthenticateWithCredential(user?.uid, credential);
};
const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>, section: string) => {
  e.preventDefault();
  setError("");

  if (password !== repeatPassword) {
    return setError("Passwords do not match.");
  }

  const isStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
  if (!isStrong) {
    return setError(
      "Password must be at least 8 characters and include uppercase, lowercase, and a number."
    );
  }

  try {
    setIsSaving(true);
    if (!user?.uid) throw new Error("Not authenticated");

await updatePassword(user, password);

    toast({ title: "Password updated successfully ✅" });
    setPassword("");
    setRepeatPassword("");
  } catch (err: any) {
    console.error("Error:", err);

    if (err.code === "auth/requires-recent-login") {
      setError("Please re-authenticate to change password.");
      // Optionally open a modal to re-login
    } else {
      setError("Password update failed.");
    }
  } finally {
    setIsSaving(false);
  }
};



const toggleTheme = async () => {
  const newTheme: ThemeMode = theme === "light" ? "dark" : "light";

  document.documentElement.classList.toggle("dark", newTheme === "dark");
  setTheme(newTheme);

  toast({ title: `Switched to ${newTheme === "dark" ? "Dark" : "Light"} Mode` });

  if (user?.uid) {
    const docRef = doc(db, "users", user.uid);
    try {
      await updateDoc(docRef, { theme: newTheme });
    } catch (err) {
      console.error("Failed to save theme:", err);
    }
  }
};


const handleThemeChange = async (val: ThemeMode) => {
  document.documentElement.classList.toggle("dark", val === "dark");
  setTheme(val);

  if (user?.uid) {
    const docRef = doc(db, "users", user.uid);
    await updateDoc(docRef, { theme: val });
  }
};
const handleSaveNotifications = async () => {
  if (!user?.uid) return toast({ title: "Please log in first" });

  const docRef = doc(db, "users", user.uid);

  try {
    await updateDoc(docRef, {
      notificationSettings: notifications,
    });

    toast({ title: "Notification settings saved!" });
  } catch (err) {
    console.error("Error saving notification settings:", err);
    toast({ title: "Failed to save", variant: "destructive" });
  }
};

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>, section: string) => {
  e.preventDefault();

  const name = (document.getElementById("name") as HTMLInputElement).value.trim();
  const username = (document.getElementById("username") as HTMLInputElement).value.trim();
  const bio = (document.getElementById("bio") as HTMLTextAreaElement).value.trim();

  if (!name || !username) {
    toast({ title: "Name and username are required." });
    return;
  }


  try {
    const userRef = doc(db, "users", user?.uid as string);
     const keywords =name.toLowerCase().split(" ")
    await updateDoc(userRef, {
      fullName: name,
      keywords:keywords,
      username,
      bio,
      updatedAt: Date.now(),
    });

    const docSnap = await getDoc(userRef);
setUserData(docSnap.data());

    toast({
      title: `${section} section Updated`,
      description: `Your ${section.toLowerCase()} Profile updated successfully!.`,
    });

  } catch (err) {
    console.error("Failed to update profile:", err);
    toast({
      title: "Error",
      description: "Something went wrong while updating your profile.",
      variant: "destructive",
    });
  }
};


const handleDeactivateAccount = async () => {
  const userRef = doc(db, "users", user?.uid as string);
  await updateDoc(userRef, {
    deactivation: true,
  });

  alert("Account deactivated (simulate)");
  handleLogout();
};


const handleDeleteAccount = async () => {
  if (!confirm("Are you sure? This will permanently delete your account.")) return;

  try {
    // 🔥 1. Delete Posts + Cloudinary
    const postQuery = query(collection(db, "posts"), where("author.uid", "==", user?.uid ));
    const postSnap = await getDocs(postQuery);

    await Promise.all(
      postSnap.docs.map(async (d) => {
        const postData = d.data();
        // If mediaUrl contains Cloudinary, delete from Cloudinary first
        if (postData.mediaUrl && postData.mediaUrl.includes("res.cloudinary.com")) {
          await fetch("/api/delete-cloudinary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mediaUrl: postData.mediaUrl }),
          });
        }

        // Delete post from Firestore
        await deleteDoc(doc(db, "posts", d.id));
      })
    );

    // 🗑 2. Delete Comments
    const commentQuery = query(collection(db, "comments"), where("uid", "==", user?.uid ));
    const commentSnap = await getDocs(commentQuery);
    await Promise.all(commentSnap.docs.map((d) => deleteDoc(doc(db, "comments", d.id))));

    // ❤️ 3. Delete Likes
    const likeQuery = query(collection(db, "likes"), where("userId", "==", user?.uid));
    const likeSnap = await getDocs(likeQuery);
    await Promise.all(likeSnap.docs.map((d) => deleteDoc(doc(db, "likes", d.id))));

    // 👤 4. Delete User Profile
    await deleteDoc(doc(db, "users", user?.uid as string));

    // 🔐 5. Delete Auth Account
    if (auth.currentUser) {
      await deleteUser(auth.currentUser);
    }

    // ✅ 6. Cleanup (session, cookies, etc.)
    const res = await fetch("/api/delete-user", { method: "POST" });
    if (res.ok) {
      handleLogout();
    } else {
      alert("Error deleting account");
    }

    alert("Your account and data were deleted.");
  } catch (err) {
    console.error("Account deletion error:", err);
    alert("Failed to delete account.");
  }
};


const notificationItems: {
  id: NotificationType;
  label: string;
  description: string;
}[] = [
  { id: "newFollower", label: "New Followers", description: "When someone starts following you." },
  { id: "postLike", label: "Post Likes", description: "When someone likes your post." },
  { id: "postComment", label: "Post Comments", description: "When someone comments on your post." },
  { id: "replies", label: "replies", description: "When someone replies on your comment." },

  { id: "directMessage", label: "Direct Messages", description: "When you receive a new direct message." },
];

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-4 sm:p-0">
      <h1 className="text-3xl font-bold font-headline mb-8">Settings</h1>

      {/* Profile Settings */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserCircle className="h-6 w-6 text-primary" /> Profile Settings</CardTitle>
          <CardDescription>Manage your public profile information.</CardDescription>
        </CardHeader>
        <form onSubmit={(e) => handleProfileUpdate(e, "Profile")}>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userData?.avatarUrl} alt="User Avatar" data-ai-hint="profile avatar"/>
                <AvatarFallback>      {(userData?.fullName ?? "").substring(0, 2) || "??"}
</AvatarFallback>
              </Avatar>

              {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                  )}
            
                
                 <input
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        ref={fileInputRef}
        className="hidden"
      />
                <Button variant="outline"  onClick={ triggerFileSelect } type="button">  Change Avatar</Button>

            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
      <Input id="name" defaultValue={userData?.fullName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                   <Input id="username" defaultValue={userData?.username || userData?.fullName} />

              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
  <Textarea
      id="bio"
      defaultValue={userData?.bio || ""}
      className="min-h-[80px]"
    />            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit">Save Profile</Button>
          </CardFooter>
        </form>
      </Card>

      {/* Account Settings */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock className="h-6 w-6 text-primary" /> Account Settings</CardTitle>
          <CardDescription>Manage your email, password, and account security.</CardDescription>
        </CardHeader>
        <form onSubmit={(e) => handleChangePassword(e, "Account")}>
          <CardContent className="space-y-6">
             <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" disabled defaultValue={userData?.email}/>
           <div className="space-y-2">
    <Label htmlFor="password">New Password</Label>
    <div className="relative">
      <Input
        id="password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-2 top-2 text-gray-500"
      >
        {showPassword ? "🙈" : "👁️"}
      </button>
    </div>
  </div>

  <div className="space-y-2">
    <Label htmlFor="repeat_password">Repeat Password</Label>
    <Input
      id="repeat_password"
      type={showPassword ? "text" : "password"}
      value={repeatPassword}
      onChange={(e) => setRepeatPassword(e.target.value)}
    />
  </div>


  {error === "Please re-authenticate to change password." && (
  <div className="space-y-2">
    <Label htmlFor="currentPassword">Enter your Prev Password</Label>
    <Input
      id="currentPassword"
      type="password"
      value={currentPassword}
      onChange={(e) => setCurrentPassword(e.target.value)}
    />
    <Button onClick={handleReauthenticate}>Re-authenticate</Button>
  </div>
)}

  {error && <p className="text-sm text-red-500">{error}</p>}

  <CardFooter className="px-0 pt-4">
    <Button type="submit" disabled={isSaving}>
      {isSaving ? "Saving..." : "Change Password"}
    </Button>
  </CardFooter>
      </CardContent>       
        </form>
      </Card>

      {/* Notification Settings */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-6 w-6 text-primary" /> Notification Settings</CardTitle>
          <CardDescription>Choose what activities you want to be notified about.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
       {notificationItems.map(item => (
  <div key={item.id} className="flex items-center justify-between rounded-lg border p-4">
    <div>
      <h4 className="font-medium">{item.label}</h4>
      <p className="text-sm text-muted-foreground">{item.description}</p>
    </div>
    <Switch
      id={item.id}
      checked={notifications[item.id]}
      onCheckedChange={(value) =>
        setNotifications((prev) => ({ ...prev, [item.id]: value }))
      }
    />
  </div>
))}

         
        </CardContent>
         <CardFooter className="border-t px-6 py-4">
          <Button type="button" onClick={handleSaveNotifications}>
  Save Notifications
</Button>
          </CardFooter>
      </Card>



      
      {/* Privacy Settings */}
     <Card className="shadow-lg">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Shield className="h-6 w-6 text-primary" /> Privacy Settings
    </CardTitle>
    <CardDescription>
      Control who can see your activity and information.
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div>
        <h4 className="font-medium">Private Account</h4>
        <p className="text-sm text-muted-foreground">
          Only approved followers can see your posts.
        </p>
      </div>
      <Switch
        id="privateAccount"
        checked={privacySettings.privateAccount}
        onCheckedChange={(val) =>
          setPrivacySettings((prev) => ({ ...prev, privateAccount: val }))
        }
      />
    </div>

    <div className="flex items-center justify-between rounded-lg border p-4">
      <div>
        <h4 className="font-medium">Activity Status</h4>
        <p className="text-sm text-muted-foreground">
          Allow others to see when you're active.
        </p>
      </div>
      <Switch
        id="activityStatus"
        checked={privacySettings.activityStatus}
        onCheckedChange={(val) =>
          setPrivacySettings((prev) => ({ ...prev, activityStatus: val }))
        }
      />
    </div>
  </CardContent>
  <CardFooter className="border-t px-6 py-4">
    <Button type="button" onClick={handleSavePrivacy}>
      Save Privacy Settings
    </Button>
  </CardFooter>
</Card>

      {/* Appearance Settings */}
   <Card className="shadow-lg">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Palette className="h-6 w-6 text-primary" /> Appearance
    </CardTitle>
    <CardDescription>Customize the look and feel of Blabzio.</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div>
        <h4 className="font-medium">Theme</h4>
        <p className="text-sm text-muted-foreground">Choose between light or dark mode.</p>
      </div>
      <Button variant="outline" onClick={toggleTheme}>
        Toggle Theme
      </Button>
    </div>
  </CardContent>
</Card>


  
<Card className="shadow-lg">
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


      <Card className="shadow-lg">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <ShieldCheck className="h-6 w-6 text-primary" /> Legal & Support
    </CardTitle>
    <CardDescription>Learn more about your rights and our policies.</CardDescription>
  </CardHeader>
  <CardContent className="space-y-2">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <p className="text-sm text-muted-foreground">Read our legal documents and policies:</p>
      <div className="flex flex-wrap gap-4">
        <Link href="/privacy" className="text-sm text-primary hover:underline">Privacy Policy</Link>
        <Link href="/terms" className="text-sm text-primary hover:underline">Terms of Service</Link>
        <Link href="/cookies" className="text-sm text-primary hover:underline">Cookies Policy</Link>
        <Link href="/support" className="text-sm text-primary hover:underline">Support</Link>
      </div>
    </div>
  </CardContent>

</Card>



 <Card className="shadow-lg border border-red-300">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-red-600">
        <Trash2 className="h-6 w-6 text-red-500" /> Delete or Deactivate Account
      </CardTitle>
      <CardDescription className="text-muted-foreground">
        Permanently delete your account or temporarily deactivate it.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {userData?.deactivation ?

      <div className="rounded-lg border p-4">
        <h4 className="font-semibold text-sm">Deactivate Account</h4>
        <p className="text-sm text-muted-foreground">
          You can temporarily deactivate your account. You’ll be logged out, and your profile will be hidden until reactivation.
        </p>
        <Button variant="outline" className="mt-2" onClick={handleDeactivateAccount}>
          Deactivate Account
        </Button>
      </div>


:
<>
 {userData?.deactivation && (
  <Card className="shadow-lg border">
    <CardHeader>
      <CardTitle className="text-primary">Reactivate Account</CardTitle>
      <CardDescription>
        Your account is currently deactivated. You can reactivate anytime.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Button onClick={handleReactivateAccount}>Reactivate Account</Button>
    </CardContent>
  </Card>
)}

</>
     


}


      <div className="rounded-lg border border-destructive p-4">
        <h4 className="font-semibold text-sm text-red-600">Delete Account</h4>
        <p className="text-sm text-muted-foreground">
          This will permanently delete your profile, content, and data. This action cannot be undone.
        </p>
        <Button variant="destructive" className="mt-2" onClick={ handleDeleteAccount}>
          Delete Account
        </Button>
      </div>
    </CardContent>
  </Card>


  <Separator />
      
      <Button variant="destructive" className="w-full sm:w-auto" onClick={handleLogout}>
        <LogOut className="mr-2 h-5 w-5" /> Logout
      </Button>


    </div>
  );
}

 {/* <div className="flex items-center justify-between rounded-lg border p-4">
              {/* <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
              </div> */}
              {/* <Switch id="2fa" /> */}
            {/* </div> */} 
        
          {/* <CardFooter className="border-t px-6 py-4">
            <Button type="submit">Save Account Settings</Button>
          </CardFooter> */}

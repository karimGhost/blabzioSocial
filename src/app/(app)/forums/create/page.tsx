"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { CldUploadWidget } from "next-cloudinary";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Image, X } from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  setDoc,
} from "firebase/firestore";
import { db, dbForums } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { randomUUID } from "crypto";
import { SelectContent, SelectItem, SelectValue,Select, SelectTrigger } from "@/components/ui/select";
const formSchema = z.object({
  name: z.string().min(3, "Forum name must be at least 3 characters.").max(50),
  category: z.string().min(2, "Category is required.").max(30),
  description: z.string().min(10, "Description must be at least 10 characters.").max(500),
  isPrivate: z.boolean().default(false),
  is18Plus: z.boolean().default(false),
  headerImageUrl: z.string().optional(),
});

export default function CreateForumPage() {
 
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      isPrivate: false,
      is18Plus: false,
      headerImageUrl: "",
    },
  });
  const { toast } = useToast();
  const router = useRouter();
 const {user} = useAuth();

async function onSubmit(values: z.infer<typeof formSchema>) {
  try {
    if (!user) {
      toast({ title: "Not logged in", description: "Please login first." });
      return;
    }

    // Generate slug
    const slug = values.name.toLowerCase().replace(/\s+/g, "-");

    // Check for duplicate
    const q = query(collection(dbForums, "forums"), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      toast({
        title: "Name Already Taken",
        description: `A forum with the name "${values.name}" already exists.`,
        variant: "destructive",
      });
      return;
    }

    // 1. Create forum document (without id)
    const forumRef = await addDoc(collection(dbForums, "forums"), {
      ...values,
      slug,
          settings: {
  allowPublicPosting: true
},

  id: crypto.randomUUID(),
  memberCount: '0',
creatorId:user.uid,
      adminId: user.uid,
      moderators: [],
      requests:[],
      createdAt: new Date(),
    });


  


    // 2. Write the forum's id *into* the forum document
    await setDoc(forumRef, { id: forumRef.id }, { merge: true });

    // 3. Add the creator to the "members" subcollection as Admin
    const memberRef = doc(dbForums, "forums", forumRef.id, "members", user.uid);
    await setDoc(memberRef, {
      id: user.uid,
      name: user.displayName || "Unknown",
      avatarUrl: user.photoURL || "",
      role: "Admin",
      joinedAt: new Date(),
    });

    // 4. Update the user's document to include this forum
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      forumsCreated: arrayUnion(forumRef.id),
    });

    // 5. Optional success toast
    toast({
      title: "Forum Created!",
      description: `The forum "${values.name}" has been successfully created.`,
    });

    // 6. Navigate to the forum or forum list
    router.push(`/forums/${slug}`);
  } catch (error) {
    console.error(error);
    toast({ title: "Error", description: "Failed to create forum" });
  }
}
  return (
    <div className="container py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="font-headline text-3xl">
              Create a New Forum
            </CardTitle>
            <Button variant="ghost" size="lg" aria-label="Close" onClick={() => router.push("/forums")}>
              <X />
            </Button>
          </div>
          <CardDescription className="mt-2">
            Build a new community. Fill out the details below to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Cloudinary upload widget */}
              <FormItem style={{display:"flex", flexDirection:"column"}}>
                <FormLabel>Header Image    </FormLabel> 
         <CldUploadWidget
  uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME!}
  onSuccess={(result) => {
  if (typeof result.info === "object" && result.info?.secure_url) {
  form.setValue("headerImageUrl", result.info.secure_url);
} else {
  console.error("Upload info missing secure_url");
}
    
  }}
>
  {({ open }) => (
    <Button type="button" onClick={() => open()}>
      {form.watch("headerImageUrl")
        ? "Change Image"
        : "Upload Header Image"}
        <Image />
    </Button>
  )}
</CldUploadWidget>
                {form.watch("headerImageUrl") && (
  <img
    src={form.watch("headerImageUrl")}
    alt="Preview"
    className="mt-4 rounded-md w-full max-w-lg"
  />
)}
                <FormMessage />
              </FormItem>


<FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forum Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Quantum Computing Enthusiasts" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
  control={form.control}
  name="category"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Category</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="Science">Science</SelectItem>
          <SelectItem value="Technology">Technology</SelectItem>
          <SelectItem value="Gaming">Gaming</SelectItem>
          <SelectItem value="Education">Education</SelectItem>
          <SelectItem value="Health">Health</SelectItem>
          <SelectItem value="Business">Business</SelectItem>
          <SelectItem value="Lifestyle">Lifestyle</SelectItem>
          <SelectItem value="Entertainment">Entertainment</SelectItem>
          <SelectItem value="Politics">Politics</SelectItem>
          <SelectItem value="Other">Other</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About this Forum</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A short description of what this forum is about."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Other form fields */}
              {/* Name, Category, Description, Switches */}
              {/* ... */}
                <FormField
                control={form.control}
                name="isPrivate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Private Forum</FormLabel>
                      <FormDescription>
                        Only approved members can see and post in this forum.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is18Plus"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>18+ Content</FormLabel>
                      <FormDescription>
                        Mark this forum as containing mature content.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit">Create Forum</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

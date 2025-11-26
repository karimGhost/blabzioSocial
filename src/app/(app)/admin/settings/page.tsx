import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Facebook, Twitter, Link as LinkIcon } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-headline">Settings</h2>
        <p className="text-muted-foreground">Manage your account and platform settings.</p>
      </div>
      <Tabs defaultValue="profile" className="flex flex-col md:flex-row gap-8">
        <TabsList className="flex flex-row md:flex-col h-auto md:h-full justify-start bg-transparent p-0">
          <TabsTrigger value="profile" className="justify-start w-full">Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="justify-start w-full">Notifications</TabsTrigger>
          <TabsTrigger value="integrations" className="justify-start w-full">Integrations</TabsTrigger>
        </TabsList>

        <div className="flex-2 ">
          <TabsContent value="profile">
            <Card  >
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="https://picsum.photos/seed/admin/100/100" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <Button variant="outline">Change Photo</Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue="Admin User" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="admin@socialsphere.io" />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Choose how you want to be notified.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="email-notifications" defaultChecked />
                  <label htmlFor="email-notifications" className="text-sm font-medium">Email Notifications</label>
                </div>
                 <p className="text-sm text-muted-foreground pl-6">Receive emails about mentions, new content for review, and system updates.</p>
                <div className="flex items-center space-x-2">
                  <Checkbox id="push-notifications" />
                  <label htmlFor="push-notifications" className="text-sm font-medium">Push Notifications</label>
                </div>
                <p className="text-sm text-muted-foreground pl-6">Get push notifications on your mobile device.</p>
                <Button className="mt-4">Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Platform Integrations</CardTitle>
                <CardDescription>Connect and manage your social media accounts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                        <Twitter className="h-8 w-8 text-[#1DA1F2]" />
                        <div>
                            <p className="font-semibold">Twitter</p>
                            <p className="text-sm text-green-600">Connected</p>
                        </div>
                    </div>
                    <Button variant="destructive" size="sm">Disconnect</Button>
                </div>
                 <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                        <Facebook className="h-8 w-8 text-[#1877F2]" />
                        <div>
                            <p className="font-semibold">Facebook</p>
                             <p className="text-sm text-green-600">Connected</p>
                        </div>
                    </div>
                    <Button variant="destructive" size="sm">Disconnect</Button>
                </div>
                 <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                         <div className="h-8 w-8 rounded-md bg-gradient-to-br from-purple-400 via-pink-500 to-yellow-500" />
                        <div>
                            <p className="font-semibold">Instagram</p>
                            <p className="text-sm text-muted-foreground">Not Connected</p>
                        </div>
                    </div>
                    <Button variant="outline">
                        <LinkIcon className="h-4 w-4 mr-2" /> Connect
                    </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

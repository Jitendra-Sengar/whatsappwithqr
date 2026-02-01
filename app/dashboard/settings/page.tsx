import { getSession } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, User, Shield, Bell } from "lucide-react"
import { OrganizationSettingsForm } from "@/components/settings/organization-settings-form"
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form"
import { SecuritySettingsForm } from "@/components/settings/security-settings-form"

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) return null
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and organization settings.
        </p>
      </div>
      
      <Tabs defaultValue="organization" className="space-y-6">
        <TabsList>
          <TabsTrigger value="organization" className="gap-2">
            <Building2 className="h-4 w-4" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>
                Manage your organization&apos;s details and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrganizationSettingsForm tenant={session.tenant} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Update your personal information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSettingsForm user={session.user} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SecuritySettingsForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive email updates about your sessions</p>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Webhook Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified when webhooks fail</p>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Usage Alerts</p>
                    <p className="text-sm text-muted-foreground">Alerts when approaching plan limits</p>
                  </div>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

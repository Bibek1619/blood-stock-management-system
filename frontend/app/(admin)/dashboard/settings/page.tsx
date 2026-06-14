"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Building2,
  Shield,
  Bell,
  Mail,
  Users,
  Database,
  Palette,
  Globe,
  Key,
  Lock,
  Save,
  Upload,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  const handleSave = (section: string) => {
    toast.success(`${section} settings saved successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Settings className="h-8 w-8 text-red-600" />
          System Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your blood bank management system configuration and preferences
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-8 h-auto p-1">
          <TabsTrigger value="general" className="flex flex-col gap-1 py-3">
            <Building2 className="h-4 w-4" />
            <span className="text-xs">General</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex flex-col gap-1 py-3">
            <Shield className="h-4 w-4" />
            <span className="text-xs">Security</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex flex-col gap-1 py-3">
            <Palette className="h-4 w-4" />
            <span className="text-xs">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex flex-col gap-1 py-3">
            <Bell className="h-4 w-4" />
            <span className="text-xs">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex flex-col gap-1 py-3">
            <Mail className="h-4 w-4" />
            <span className="text-xs">Email</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex flex-col gap-1 py-3">
            <Users className="h-4 w-4" />
            <span className="text-xs">Users</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex flex-col gap-1 py-3">
            <Database className="h-4 w-4" />
            <span className="text-xs">Backup</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex flex-col gap-1 py-3">
            <Key className="h-4 w-4" />
            <span className="text-xs">API</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="border-t-4 border-t-red-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organization Information
              </CardTitle>
              <CardDescription>
                Update your blood bank's basic information and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Organization Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 rounded-lg border-2 border-dashed border-muted flex items-center justify-center bg-muted/50">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Recommended: 512x512px, PNG or SVG
                    </p>
                  </div>
                </div>
              </div>

              {/* Organization Name */}
              <div className="grid gap-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input
                  id="org-name"
                  placeholder="Blood Donation Management System"
                  defaultValue="Blood Donation Management System"
                />
              </div>

              {/* Dashboard Title */}
              <div className="grid gap-2">
                <Label htmlFor="dashboard-title">Dashboard Title</Label>
                <Input
                  id="dashboard-title"
                  placeholder="Admin Dashboard"
                  defaultValue="Blood Bank Management"
                />
                <p className="text-xs text-muted-foreground">
                  This appears in the browser tab and dashboard header
                </p>
              </div>

              {/* Short Name */}
              <div className="grid gap-2">
                <Label htmlFor="short-name">Short Name / Abbreviation</Label>
                <Input
                  id="short-name"
                  placeholder="BBMS"
                  defaultValue="BBMS"
                />
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="org-description">Organization Description</Label>
                <Textarea
                  id="org-description"
                  placeholder="Brief description of your organization..."
                  rows={4}
                  defaultValue="Leading blood bank management system providing comprehensive solutions for donation management, inventory tracking, and donor engagement."
                />
              </div>

              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="org-email">Contact Email</Label>
                  <Input
                    id="org-email"
                    type="email"
                    placeholder="contact@bloodbank.org"
                    defaultValue="contact@bloodbank.org"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="org-phone">Contact Phone</Label>
                  <Input
                    id="org-phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    defaultValue="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="grid gap-2">
                <Label htmlFor="org-address">Address</Label>
                <Textarea
                  id="org-address"
                  placeholder="Enter full address..."
                  rows={2}
                  defaultValue="123 Medical District, Healthcare City, HC 12345"
                />
              </div>

              <Button onClick={() => handleSave("General")}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-t-4 border-t-orange-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Authentication
              </CardTitle>
              <CardDescription>
                Manage password, authentication, and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Change Password */}
              <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Change Password
                </h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" placeholder="••••••••" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" placeholder="••••••••" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" placeholder="••••••••" />
                  </div>
                  <Button onClick={() => handleSave("Password")} className="w-fit">
                    Update Password
                  </Button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="space-y-4 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="font-semibold">Two-Factor Authentication (2FA)</h3>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch />
                </div>
                <Button variant="outline" size="sm">
                  Configure 2FA
                </Button>
              </div>

              {/* Session Management */}
              <div className="space-y-4 p-4 rounded-lg border">
                <h3 className="font-semibold">Active Sessions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">Current Device</p>
                      <p className="text-xs text-muted-foreground">Windows • Chrome • Last active: Now</p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <Button variant="destructive" size="sm">
                    Logout All Other Sessions
                  </Button>
                </div>
              </div>

              {/* Password Reset */}
              <div className="space-y-4 p-4 rounded-lg border border-amber-200 bg-amber-50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-amber-900">Forgot Password Recovery</h3>
                    <p className="text-sm text-amber-800">
                      If you've forgotten your password, you can request a password reset link via email.
                    </p>
                    <Button variant="outline" size="sm" className="border-amber-300">
                      Send Reset Link
                    </Button>
                  </div>
                </div>
              </div>

              {/* Login History */}
              <div className="space-y-4 p-4 rounded-lg border">
                <h3 className="font-semibold">Recent Login Activity</h3>
                <div className="space-y-2">
                  {[
                    { date: "May 31, 2026 10:30 AM", location: "Pokhara, Nepal", device: "Windows • Chrome" },
                    { date: "May 30, 2026 3:15 PM", location: "Pokhara, Nepal", device: "Windows • Chrome" },
                    { date: "May 29, 2026 9:45 AM", location: "Pokhara, Nepal", device: "Windows • Chrome" },
                  ].map((login, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 text-sm">
                      <div>
                        <p className="font-medium">{login.date}</p>
                        <p className="text-xs text-muted-foreground">{login.location} • {login.device}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">Success</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="border-t-4 border-t-purple-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance & Branding
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Settings */}
              <div className="grid gap-4">
                <h3 className="font-semibold">Theme</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border-2 border-primary rounded-lg p-4 cursor-pointer">
                    <div className="h-20 rounded bg-gradient-to-br from-white to-gray-100 mb-2"></div>
                    <p className="text-sm font-medium text-center">Light</p>
                  </div>
                  <div className="border rounded-lg p-4 cursor-pointer hover:border-primary">
                    <div className="h-20 rounded bg-gradient-to-br from-gray-800 to-gray-900 mb-2"></div>
                    <p className="text-sm font-medium text-center">Dark</p>
                  </div>
                  <div className="border rounded-lg p-4 cursor-pointer hover:border-primary">
                    <div className="h-20 rounded bg-gradient-to-br from-white via-gray-100 to-gray-800 mb-2"></div>
                    <p className="text-sm font-medium text-center">Auto</p>
                  </div>
                </div>
              </div>

              {/* Primary Color */}
              <div className="grid gap-4">
                <h3 className="font-semibold">Primary Color</h3>
                <div className="grid grid-cols-6 gap-3">
                  {['#DC2626', '#EA580C', '#CA8A04', '#16A34A', '#2563EB', '#9333EA'].map((color) => (
                    <div
                      key={color}
                      className="h-12 rounded-lg cursor-pointer border-2 hover:scale-105 transition-transform"
                      style={{ backgroundColor: color }}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Sidebar Settings */}
              <div className="grid gap-4">
                <h3 className="font-semibold">Sidebar</h3>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">Collapsed by Default</p>
                    <p className="text-xs text-muted-foreground">Start with sidebar collapsed</p>
                  </div>
                  <Switch />
                </div>
              </div>

              {/* Favicon */}
              <div className="grid gap-2">
                <Label>Favicon</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded border-2 border-dashed border-muted flex items-center justify-center bg-muted/50">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Favicon
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      32x32px or 64x64px, .ico or .png
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={() => handleSave("Appearance")}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-t-4 border-t-blue-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div className="space-y-4">
                <h3 className="font-semibold">Email Notifications</h3>
                {[
                  { label: "New Donor Registrations", desc: "Get notified when new donors register" },
                  { label: "Low Blood Stock Alerts", desc: "Alerts when blood stock falls below threshold" },
                  { label: "Upcoming Events", desc: "Reminders for scheduled donation events" },
                  { label: "Expiry Warnings", desc: "Notifications for blood units nearing expiry" },
                  { label: "Daily Reports", desc: "Receive daily summary reports via email" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={index < 3} />
                  </div>
                ))}
              </div>

              {/* Push Notifications */}
              <div className="space-y-4">
                <h3 className="font-semibold">Push Notifications</h3>
                {[
                  { label: "Browser Notifications", desc: "Show desktop notifications" },
                  { label: "Sound Alerts", desc: "Play sound for important notifications" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch />
                  </div>
                ))}
              </div>

              <Button onClick={() => handleSave("Notifications")}>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Configuration */}
        <TabsContent value="email" className="space-y-6">
          <Card className="border-t-4 border-t-green-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Configure SMTP settings for email delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* SMTP Settings */}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input id="smtp-host" placeholder="smtp.gmail.com" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input id="smtp-port" placeholder="587" type="number" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="smtp-encryption">Encryption</Label>
                    <select id="smtp-encryption" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option>TLS</option>
                      <option>SSL</option>
                      <option>None</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="smtp-username">SMTP Username</Label>
                  <Input id="smtp-username" type="email" placeholder="your-email@gmail.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="smtp-password">SMTP Password</Label>
                  <Input id="smtp-password" type="password" placeholder="••••••••" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="from-email">From Email Address</Label>
                  <Input id="from-email" type="email" placeholder="noreply@bloodbank.org" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="from-name">From Name</Label>
                  <Input id="from-name" placeholder="Blood Bank Management System" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">Test Connection</Button>
                <Button onClick={() => handleSave("Email")}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management */}
        <TabsContent value="users" className="space-y-6">
          <Card className="border-t-4 border-t-indigo-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management Settings
              </CardTitle>
              <CardDescription>
                Configure user registration and access control
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Registration Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold">Registration Settings</h3>
                {[
                  { label: "Allow Public Registration", desc: "Let users create accounts publicly" },
                  { label: "Email Verification Required", desc: "Users must verify email before access" },
                  { label: "Admin Approval Required", desc: "Admins must approve new registrations" },
                  { label: "Auto-assign Default Role", desc: "Automatically assign 'Donor' role to new users" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={index !== 0} />
                  </div>
                ))}
              </div>

              {/* Password Policy */}
              <div className="space-y-4 p-4 rounded-lg border">
                <h3 className="font-semibold">Password Policy</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="min-length">Minimum Password Length</Label>
                    <Input id="min-length" type="number" defaultValue="8" />
                  </div>
                  {[
                    { label: "Require Uppercase Letters", checked: true },
                    { label: "Require Lowercase Letters", checked: true },
                    { label: "Require Numbers", checked: true },
                    { label: "Require Special Characters", checked: false },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <Label className="text-sm font-normal">{item.label}</Label>
                      <Switch defaultChecked={item.checked} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Session Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold">Session Settings</h3>
                <div className="grid gap-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input id="session-timeout" type="number" defaultValue="60" />
                  <p className="text-xs text-muted-foreground">
                    Users will be logged out after this period of inactivity
                  </p>
                </div>
              </div>

              <Button onClick={() => handleSave("User Management")}>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup & Data */}
        <TabsContent value="backup" className="space-y-6">
          <Card className="border-t-4 border-t-cyan-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup & Data Management
              </CardTitle>
              <CardDescription>
                Manage database backups and data exports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Automatic Backups */}
              <div className="space-y-4 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Automatic Backups</h3>
                    <p className="text-sm text-muted-foreground">Schedule regular database backups</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="backup-frequency">Backup Frequency</Label>
                    <select id="backup-frequency" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="backup-time">Backup Time</Label>
                    <Input id="backup-time" type="time" defaultValue="02:00" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="backup-retention">Retention Period (days)</Label>
                    <Input id="backup-retention" type="number" defaultValue="30" />
                  </div>
                </div>
              </div>

              {/* Recent Backups */}
              <div className="space-y-4">
                <h3 className="font-semibold">Recent Backups</h3>
                <div className="space-y-2">
                  {[
                    { date: "May 31, 2026 02:00 AM", size: "45.2 MB", status: "Success" },
                    { date: "May 30, 2026 02:00 AM", size: "44.8 MB", status: "Success" },
                    { date: "May 29, 2026 02:00 AM", size: "44.5 MB", status: "Success" },
                  ].map((backup, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">{backup.date}</p>
                        <p className="text-xs text-muted-foreground">{backup.size}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-green-600">{backup.status}</Badge>
                        <Button variant="ghost" size="sm">Download</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manual Backup */}
              <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold">Manual Backup</h3>
                <p className="text-sm text-muted-foreground">
                  Create an immediate backup of your database
                </p>
                <Button variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Create Backup Now
                </Button>
              </div>

              {/* Data Export */}
              <div className="space-y-4 p-4 rounded-lg border">
                <h3 className="font-semibold">Data Export</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Export your data in various formats
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">Export as CSV</Button>
                  <Button variant="outline" size="sm">Export as Excel</Button>
                  <Button variant="outline" size="sm">Export as JSON</Button>
                  <Button variant="outline" size="sm">Export as PDF</Button>
                </div>
              </div>

              <Button onClick={() => handleSave("Backup")}>
                <Save className="h-4 w-4 mr-2" />
                Save Backup Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="api" className="space-y-6">
          <Card className="border-t-4 border-t-pink-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Manage API keys and integration settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* API Keys */}
              <div className="space-y-4">
                <h3 className="font-semibold">API Keys</h3>
                <div className="space-y-3">
                  {[
                    { name: "Production API Key", key: "pk_live_••••••••••••••••", created: "May 15, 2026", status: "Active" },
                    { name: "Development API Key", key: "pk_test_••••••••••••••••", created: "May 10, 2026", status: "Active" },
                  ].map((apiKey, index) => (
                    <div key={index} className="p-4 rounded-lg border">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{apiKey.name}</p>
                          <p className="text-sm text-muted-foreground font-mono">{apiKey.key}</p>
                          <p className="text-xs text-muted-foreground mt-1">Created: {apiKey.created}</p>
                        </div>
                        <Badge variant="secondary">{apiKey.status}</Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm">Regenerate</Button>
                        <Button variant="ghost" size="sm" className="text-red-600">Revoke</Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline">
                  <Key className="h-4 w-4 mr-2" />
                  Generate New API Key
                </Button>
              </div>

              {/* API Rate Limiting */}
              <div className="space-y-4 p-4 rounded-lg border">
                <h3 className="font-semibold">Rate Limiting</h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Enable Rate Limiting</p>
                      <p className="text-xs text-muted-foreground">Limit API requests per user</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="rate-limit">Requests per Minute</Label>
                    <Input id="rate-limit" type="number" defaultValue="100" />
                  </div>
                </div>
              </div>

              {/* Webhook Configuration */}
              <div className="space-y-4 p-4 rounded-lg border">
                <h3 className="font-semibold">Webhooks</h3>
                <p className="text-sm text-muted-foreground">
                  Configure webhooks to receive real-time updates
                </p>
                <div className="grid gap-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input id="webhook-url" placeholder="https://your-domain.com/webhook" />
                </div>
                <div className="space-y-2">
                  <Label>Events to Subscribe</Label>
                  {[
                    "donor.created",
                    "donation.completed",
                    "stock.low",
                    "event.created",
                  ].map((event, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input type="checkbox" id={event} className="rounded" />
                      <Label htmlFor={event} className="text-sm font-normal">{event}</Label>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm">Test Webhook</Button>
              </div>

              {/* CORS Settings */}
              <div className="space-y-4 p-4 rounded-lg border">
                <h3 className="font-semibold">CORS Settings</h3>
                <div className="grid gap-2">
                  <Label htmlFor="allowed-origins">Allowed Origins</Label>
                  <Textarea
                    id="allowed-origins"
                    placeholder="https://example.com&#10;https://app.example.com"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter one origin per line
                  </p>
                </div>
              </div>

              <Button onClick={() => handleSave("API")}>
                <Save className="h-4 w-4 mr-2" />
                Save API Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

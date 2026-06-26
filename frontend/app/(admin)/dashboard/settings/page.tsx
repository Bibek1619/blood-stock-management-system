"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Palette,
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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
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

        {/* Horizontal Navigation Tabs */}
        <Card>
          <CardContent className="p-2">
            <nav className="flex flex-wrap gap-1">
              <button
                onClick={() => setActiveTab("general")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "general"
                    ? "bg-red-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>General</span>
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "security"
                    ? "bg-red-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Security</span>
              </button>
              <button
                onClick={() => setActiveTab("appearance")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "appearance"
                    ? "bg-red-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Palette className="h-4 w-4" />
                <span>Appearance</span>
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "notifications"
                    ? "bg-red-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </button>
            </nav>
          </CardContent>
        </Card>

        {/* Full Width Content Area */}
        <div className="space-y-6">
            {/* General Settings */}
            {activeTab === "general" && (
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
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
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
            )}

            {/* Appearance Settings */}
            {activeTab === "appearance" && (
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
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
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
            )}
          </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplets, Mail, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export default function LoginPage() {
  const router = useRouter();
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [regError, setRegError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setLoginError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...regForm,
          role: 'STAFF', // Staff/Admin registration from login page
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to dashboard (staff don't need donor profile)
      router.push('/dashboard');
    } catch (err: any) {
      setRegError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />
      <main className="flex-1 bg-gradient-to-br from-red-50 to-white">
        <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
              <Droplets className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to continue saving lives</p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                    Register
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  {loginError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{loginError}</p>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-gray-700">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="login-email"
                          type="email"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          placeholder="admin@vitalflow.com"
                          className="pl-10 h-11"
                          required
                          disabled={loginLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-gray-700">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="login-password"
                          type={showLoginPassword ? "text" : "password"}
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          placeholder="••••••••"
                          className="pl-10 pr-10 h-11"
                          required
                          disabled={loginLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          disabled={loginLoading}
                        >
                          {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300" disabled={loginLoading} />
                        <span className="text-gray-600">Remember me</span>
                      </label>
                      <a href="#" className="text-red-600 hover:text-red-700 font-medium">
                        Forgot password?
                      </a>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-red-600 hover:bg-red-700 text-base font-semibold"
                      disabled={loginLoading}
                    >
                      {loginLoading ? "Signing In..." : "Sign In"}
                    </Button>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                      <p className="font-semibold mb-1">Demo Credentials:</p>
                      <p>Email: admin@vitalflow.com</p>
                      <p>Password: admin123</p>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  {regError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{regError}</p>
                    </div>
                  )}

                  <form onSubmit={handleRegister} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name" className="text-gray-700">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="reg-name"
                          value={regForm.name}
                          onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                          placeholder="John Doe"
                          className="pl-10 h-11"
                          required
                          disabled={regLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="text-gray-700">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="reg-email"
                          type="email"
                          value={regForm.email}
                          onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                          placeholder="john@example.com"
                          className="pl-10 h-11"
                          required
                          disabled={regLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-phone" className="text-gray-700">Phone Number</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="reg-phone"
                          type="tel"
                          value={regForm.phone}
                          onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                          placeholder="+1 234 567 8900"
                          className="pl-10 h-11"
                          required
                          disabled={regLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="text-gray-700">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="reg-password"
                          type={showRegPassword ? "text" : "password"}
                          value={regForm.password}
                          onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                          placeholder="••••••••"
                          className="pl-10 pr-10 h-11"
                          required
                          minLength={6}
                          disabled={regLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          disabled={regLoading}
                        >
                          {showRegPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                      <p className="font-semibold mb-1">Note:</p>
                      <p>This registration is for staff/admin users. If you want to become a blood donor, please use the "Become a Donor" link below.</p>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                      <input type="checkbox" className="mt-1 rounded border-gray-300" required disabled={regLoading} />
                      <span className="text-gray-600">
                        I agree to the{" "}
                        <a href="#" className="text-red-600 hover:underline">Terms of Service</a>
                        {" "}and{" "}
                        <a href="#" className="text-red-600 hover:underline">Privacy Policy</a>
                      </span>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-red-600 hover:bg-red-700 text-base font-semibold"
                      disabled={regLoading}
                    >
                      {regLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Want to become a blood donor?{" "}
              <Link href="/become-donor" className="text-red-600 hover:underline font-semibold">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

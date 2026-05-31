'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplets, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import axiosInstance from "@/lib/axiosInstance";
import { API_PATHS } from "@/lib/apiPaths";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    // Check if user just completed registration
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('Registration complete! Your profile is under review. You will be notified once approved.');
      toast.success('Registration complete!', {
        description: 'Your profile is under review. Please wait for admin approval.',
      });
    }
  }, [searchParams]);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, loginData);

      if (response.data.success) {
        const { user, token } = response.data.data;

        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Check if user is a donor and fetch donor verification status
        if (user.role === 'DONOR') {
          try {
            const donorResponse = await axiosInstance.get(`/api/donors/user/${user.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            const donor = donorResponse.data.data;
            
            // Check verification status
            if (donor && donor.verificationStatus === 'PENDING') {
              // Donor is pending approval
              toast.info('Profile Under Review', {
                description: 'Your donor profile is awaiting admin approval. You will be notified once approved.',
                duration: 5000,
              });
              setError('Your profile is under review. Please wait for admin approval before accessing the platform.');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setLoading(false);
              return;
            } else if (donor && donor.verificationStatus === 'REJECTED') {
              // Donor was rejected
              const reason = donor.rejectionReason || 'No reason provided';
              toast.error('Profile Rejected', {
                description: `Your donor profile was rejected. Reason: ${reason}`,
                duration: 7000,
              });
              setError(`Your profile was rejected. Reason: ${reason}`);
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setLoading(false);
              return;
            }
          } catch (donorErr) {
            console.error('Error fetching donor status:', donorErr);
          }
        }

        // Redirect based on role and verification status
        let redirectUrl = '/';
        
        if (!user.isVerified && user.role === 'DONOR') {
          // Unverified donor -> complete profile
          redirectUrl = '/donor-form';
        } else if (user.role === 'DONOR') {
          // Verified donor -> home
          redirectUrl = '/home';
        } else {
          // Admin/Staff -> dashboard
          redirectUrl = '/dashboard';
        }
        
        // Force a page reload to update navbar
        window.location.href = redirectUrl;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicNav />

      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md px-4">

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-red-600 rounded-full mb-3">
              <Droplets className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 text-sm">Login to your account</p>
          </div>

          {/* Card */}
          <Card className="shadow-xl">
            <CardContent className="p-6">
              {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Registration Successful!</p>
                    <p className="text-xs text-green-700 mt-1">{successMessage}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Unable to Login</p>
                    <p className="text-xs text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      name="email"
                      type="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      placeholder="Enter email"
                      className="pl-9"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <Label>Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="Enter password"
                      className="pl-9 pr-9"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer Link */}
          <div className="text-center mt-5 text-sm">
            <Link href="/become-donor" className="text-red-600 hover:underline font-medium">
              Don't have an account? Become a blood donor
            </Link>
          </div>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
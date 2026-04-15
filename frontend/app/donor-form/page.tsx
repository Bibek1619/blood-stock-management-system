'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Droplet, Calendar, Weight, MapPin, AlertCircle, CheckCircle } from "lucide-react";

export default function DonorFormPage() {
  const router = useRouter();
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  
  const [form, setForm] = useState({
    bloodGroup: "",
    dateOfBirth: "",
    weight: "",
    location: "",
    city: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
  }, [router]);

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate age
    if (form.dateOfBirth) {
      const age = calculateAge(form.dateOfBirth);
      if (age < 18 || age > 65) {
        setError("You must be between 18 and 65 years old to donate blood.");
        setLoading(false);
        return;
      }
    }

    // Validate weight
    if (parseFloat(form.weight) < 50) {
      setError("You must weigh at least 50 kg to donate blood.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/donors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          bloodGroup: form.bloodGroup,
          dateOfBirth: form.dateOfBirth,
          weight: parseFloat(form.weight),
          location: form.location,
          city: form.city,
          address: form.address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create donor profile');
      }

      // Success! Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-16 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
            <Droplet className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Donor Profile</h1>
          <p className="text-gray-600">Welcome, {user.name}! Just a few more details to get started.</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-green-600">Account Info</span>
            </div>
            <div className="w-16 h-1 bg-red-600"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-semibold">
                2
              </div>
              <span className="text-sm font-medium text-red-600">Medical Info</span>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl text-center">Step 2: Medical Information</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Medical Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Droplet className="h-5 w-5 text-red-600" />
                  Required Medical Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup" className="text-gray-700">Blood Group *</Label>
                    <Select
                      value={form.bloodGroup}
                      onValueChange={(v) => setForm({ ...form, bloodGroup: v })}
                      required
                      disabled={loading}
                    >
                      <SelectTrigger id="bloodGroup" className="h-11">
                        <SelectValue placeholder="Select your blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloodGroups.map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-gray-700">Date of Birth *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={form.dateOfBirth}
                        onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                        className="pl-10 h-11"
                        required
                        disabled={loading}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-gray-700">Weight (kg) *</Label>
                    <div className="relative">
                      <Weight className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="weight"
                        type="number"
                        value={form.weight}
                        onChange={(e) => setForm({ ...form, weight: e.target.value })}
                        placeholder="70"
                        min="50"
                        step="0.1"
                        className="pl-10 h-11"
                        required
                        disabled={loading}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Minimum 50 kg required</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-gray-700">City *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        id="city"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        placeholder="New York"
                        className="pl-10 h-11"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  Location Details
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-gray-700">Location/Area</Label>
                    <Input
                      id="location"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="Manhattan, NY"
                      className="h-11"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-gray-700">Full Address</Label>
                    <Input
                      id="address"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="123 Main Street, Apt 4B"
                      className="h-11"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Eligibility Info */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-600 rounded-lg p-5">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  Eligibility Requirements
                </h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✓</span>
                    <span>Age between 18-65 years</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✓</span>
                    <span>Weight at least 50 kg (110 lbs)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✓</span>
                    <span>Good general health condition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✓</span>
                    <span>No recent illness, surgery, or tattoos (within 6 months)</span>
                  </li>
                </ul>
              </div>

              {/* Confirmation */}
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 rounded border-gray-300" required disabled={loading} />
                <span className="text-sm text-gray-600">
                  I confirm that I meet all the eligibility requirements and the information provided is accurate.
                </span>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-lg font-semibold"
                disabled={loading}
              >
                {loading ? "Completing Registration..." : "Complete Registration"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

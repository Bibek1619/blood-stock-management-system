'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, User, Mail, Lock, Phone, MapPin, Droplet, Calendar, Weight } from "lucide-react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export default function BecomeDonorPage() {
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    bloodGroup: "",
    phone: "",
    location: "",
    age: "",
    weight: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Donor Registration:", form);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />
      <main className="flex-1 bg-gradient-to-br from-red-50 to-white">
        <div className="max-w-3xl mx-auto px-4 py-16 animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Life Saver</h1>
            <p className="text-gray-600">Join our community of heroes and start saving lives today</p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
              <CardTitle className="text-2xl text-center">Donor Registration Form</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-red-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="John Doe"
                          className="pl-10 h-11"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="john@example.com"
                          className="pl-10 h-11"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700">Password *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          placeholder="••••••••"
                          className="pl-10 h-11"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+1 234 567 8900"
                          className="pl-10 h-11"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Droplet className="h-5 w-5 text-red-600" />
                    Medical Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bloodGroup" className="text-gray-700">Blood Group *</Label>
                      <Select
                        value={form.bloodGroup}
                        onValueChange={(v) => setForm({ ...form, bloodGroup: v })}
                        required
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
                      <Label htmlFor="age" className="text-gray-700">Age *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="age"
                          type="number"
                          value={form.age}
                          onChange={(e) => setForm({ ...form, age: e.target.value })}
                          placeholder="25"
                          min="18"
                          max="65"
                          className="pl-10 h-11"
                          required
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
                          className="pl-10 h-11"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-gray-700">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="location"
                          value={form.location}
                          onChange={(e) => setForm({ ...form, location: e.target.value })}
                          placeholder="New York, NY"
                          className="pl-10 h-11"
                        />
                      </div>
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

                {/* Terms */}
                <div className="flex items-start gap-3">
                  <input type="checkbox" className="mt-1 rounded border-gray-300" required />
                  <span className="text-sm text-gray-600">
                    I confirm that I meet the eligibility requirements and agree to the{" "}
                    <a href="#" className="text-red-600 hover:underline font-medium">Terms & Conditions</a>
                    {" "}and{" "}
                    <a href="#" className="text-red-600 hover:underline font-medium">Privacy Policy</a>
                  </span>
                </div>

                <Button type="submit" className="w-full h-12 bg-red-600 hover:bg-red-700 text-lg font-semibold">
                  Register as Donor
                </Button>
              </form>

              <div className="text-center mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="text-red-600 hover:underline font-semibold">
                    Login here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

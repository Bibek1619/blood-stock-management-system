'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Heart, Target, Users, Award } from "lucide-react";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicNav />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About VitalFlow</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We're on a mission to make blood donation accessible, efficient, and impactful for everyone.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h2>
            <p className="text-gray-600">
              To create a seamless bridge between blood donors and those in need, ensuring that no life is lost due to blood shortage. We leverage technology to make blood donation more accessible and efficient.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h2>
            <p className="text-gray-600">
              A world where every person has access to safe blood when they need it. We envision a community of engaged donors who understand the life-saving impact of their contribution.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Values */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Users,
              title: "Community First",
              desc: "We believe in the power of community and collective action to save lives.",
            },
            {
              icon: Award,
              title: "Excellence",
              desc: "We maintain the highest standards in blood collection, storage, and distribution.",
            },
            {
              icon: Heart,
              title: "Compassion",
              desc: "Every interaction is guided by empathy and understanding of the critical nature of our work.",
            },
          ].map((value) => (
            <Card key={value.title} className="border border-gray-200 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-600">{value.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Story */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              VitalFlow was founded in 2024 with a simple yet powerful idea: use technology to save lives through better blood donation management. Our founders witnessed firsthand the challenges faced by blood banks and donors in coordinating donations.
            </p>
            <p>
              What started as a small initiative has grown into a comprehensive platform serving thousands of donors and healthcare facilities. We've streamlined the donation process, making it easier for people to donate and for hospitals to access the blood they need.
            </p>
            <p>
              Today, VitalFlow continues to innovate, introducing features like real-time blood stock tracking, automated donor notifications, and digital certificates. Our commitment remains unchanged: to ensure that every drop of blood donated reaches someone who needs it.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="mt-12 bg-red-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Our Impact</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Active Donors", value: "500+" },
            { label: "Lives Saved", value: "1,200+" },
            { label: "Partner Hospitals", value: "25+" },
            { label: "Blood Units Collected", value: "3,000+" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-red-600">{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

'use client';
import Link from "next/link";
import { Droplets, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-rose-950 flex items-center justify-center overflow-hidden" suppressHydrationWarning>
      {/* Subtle Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4">
        {/* Logo */}
        <div className="mb-8 inline-block">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl">
            <Droplets size={40} className="text-red-800" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-6xl md:text-7xl font-black text-white mb-4 tracking-tight">
          Blood Bank
        </h1>

        <p className="text-xl text-red-100 mb-12">
          Management System
        </p>

        {/* Dashboard Button */}
        <Link 
          href="/dashboard"
          className="group inline-flex items-center gap-3 px-8 py-4 bg-white rounded-xl shadow-2xl hover:scale-105 transition-transform duration-300"
        >
          <span className="text-xl font-bold text-red-900">Go to Dashboard</span>
          <ArrowRight size={24} className="text-red-900 group-hover:translate-x-2 transition-transform duration-300" />
        </Link>
      </div>
    </div>
  );
}

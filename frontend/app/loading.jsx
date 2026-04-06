'use client';
import { Droplets } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-red-950 via-red-900 to-rose-950 flex items-center justify-center z-50">
      <div className="text-center px-4">
        {/* Logo with pulse animation */}
        <div className="mb-8 inline-block animate-pulse">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl">
            <Droplets size={32} className="text-red-800" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-8">Loading Dashboard...</h2>

        {/* Progress Bar Container */}
        <div className="w-80 max-w-full mx-auto">
          {/* Background Track */}
          <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            {/* Animated Progress Fill */}
            <div className="h-full bg-gradient-to-r from-red-400 via-rose-400 to-pink-400 rounded-full animate-progress shadow-lg" />
          </div>
          
          {/* Loading Text */}
          <p className="text-red-200 text-sm mt-4 animate-pulse">Please wait...</p>
        </div>
      </div>

      {/* Custom Animation */}
      <style jsx>{`
        @keyframes progress {
          0% {
            width: 0%;
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
          100% {
            width: 100%;
            opacity: 0.9;
          }
        }
        
        .animate-progress {
          animation: progress 1.5s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const images = [
  {
    id: 1,
    src: "/blood1.jpg",
    name: "Blood Donation Process",
    alt: "Person donating blood with medical professional"
  },
  {
    id: 2,
    src: "/blood2.avif",
    name: "Blood Collection Setup",
    alt: "Medical staff setting up blood collection equipment"
  },
  {
    id: 3,
    src: "/blood3.jpg",
    name: "Community Blood Drive",
    alt: "Community blood donation event with volunteers"
  },
  {
    id: 4,
    src: "/blood4.webp",
    name: "Donor Registration",
    alt: "Volunteer registering for blood donation"
  },
  {
    id: 5,
    src: "/blood6.jpeg",
    name: "Blood Donation Chair",
    alt: "Donor in blood donation chair with nurse"
  },
  {
    id: 6,
    src: "/blood1.jpg",
    name: "Medical Staff Assistance",
    alt: "Healthcare worker assisting blood donor"
  },
  {
    id: 7,
    src: "/blood2.avif",
    name: "Blood Collection Process",
    alt: "Medical professional during blood collection"
  },
  {
    id: 8,
    src: "/blood3.jpg",
    name: "Volunteer Blood Donors",
    alt: "Group of volunteers at blood donation event"
  },
  {
    id: 9,
    src: "/blood4.webp",
    name: "Donation Drive Setup",
    alt: "Blood donation drive setup with medical equipment"
  },
  {
    id: 10,
    src: "/blood6.jpeg",
    name: "Blood Donor Care",
    alt: "Medical team caring for blood donor during process"
  }
];

export function ImageSlider() {
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Duplicate images for seamless loop
  const duplicatedImages = [...images, ...images];

  const handleMouseEnter = (imageId: number, event: React.MouseEvent) => {
    setIsPaused(true);
    setHoveredImage(imageId);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    setHoveredImage(null);
  };

  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-red-800 border border-red-800/30 bg-red-800/5 px-3 py-1 rounded-full mb-4">
            Our Impact
          </span>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl leading-tight">
            Saving Lives Together
          </h2>
          <p className="mt-3 text-gray-600 max-w-md mx-auto text-sm sm:text-base">
            See the real impact of blood donation through our community and medical partnerships.
          </p>
        </div>

        {/* Image Slider */}
        <div className="relative">
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{
                x: isPaused ? undefined : [-2400, 0]
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 30,
                  ease: "linear"
                }
              }}
              style={{ width: `${duplicatedImages.length * 320}px` }}
            >
              {duplicatedImages.map((image, index) => (
                <motion.div
                  key={`${image.id}-${index}`}
                  className="relative flex-shrink-0 w-80 h-60 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                  onMouseEnter={(e) => handleMouseEnter(image.id, e)}
                  onMouseLeave={handleMouseLeave}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  
                  {/* Image overlay on hover */}
                  <motion.div
                    className="absolute inset-0 bg-red-800/20 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-white text-center">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Gradient overlays for seamless effect */}
          <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-gray-50 to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10" />
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredImage && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="fixed z-50 pointer-events-none"
              style={{
                left: tooltipPosition.x,
                top: tooltipPosition.y,
                transform: 'translateX(-50%) translateY(-100%)'
              }}
            >
              <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap">
                {images.find(img => img.id === hoveredImage)?.name}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
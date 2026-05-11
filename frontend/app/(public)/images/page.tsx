'use client';

import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export default function ImagesPage() {
  const images = [
    {
      id: 1,
      url: "/blood1.jpg",
      title: "Blood Donation Drive",
      description: "Community members participating in our monthly blood drive",
    },
    {
      id: 2,
      url: "/blood2.avif",
      title: "Medical Professional",
      description: "Our trained staff ensuring safe donation procedures",
    },
    {
      id: 3,
      url: "/blood3.jpg",
      title: "Blood Samples",
      description: "Careful handling and testing of donated blood",
    },
    {
      id: 4,
      url: "/blood4.webp",
      title: "Donation Center",
      description: "Modern and comfortable donation facilities",
    },
    {
      id: 5,
      url: "/blood6.jpeg",
      title: "Healthcare Team",
      description: "Dedicated professionals committed to saving lives",
    },
    {
      id: 6,
      url: "/blood1.jpg",
      title: "Blood Storage",
      description: "State-of-the-art blood storage and preservation",
    },
    {
      id: 7,
      url: "/blood2.avif",
      title: "Community Impact",
      description: "Making a difference in our community together",
    },
    {
      id: 8,
      url: "/blood3.jpg",
      title: "Volunteer Support",
      description: "Volunteers helping coordinate donation events",
    },
    {
      id: 9,
      url: "/blood4.webp",
      title: "Health Screening",
      description: "Pre-donation health checks for donor safety",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900">Gallery</h1>
            <p className="text-gray-600 mt-2">Moments from our blood donation events and facilities</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((img) => (
              <Card key={img.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-white">
                <div className="relative h-64 w-full overflow-hidden bg-gray-100">
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://via.placeholder.com/800x600/ef4444/ffffff?text=${encodeURIComponent(img.title)}`;
                    }}
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{img.title}</h3>
                  <p className="text-sm text-gray-600">{img.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

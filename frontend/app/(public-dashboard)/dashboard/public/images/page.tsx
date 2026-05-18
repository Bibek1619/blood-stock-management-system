export default function ImagesPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gallery</h1>
        <p className="text-gray-500 mt-2">
          Images from our blood donation camps and events.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="aspect-square bg-gray-100 rounded-xl border overflow-hidden relative group">
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <span className="text-sm font-medium">Image {i}</span>
            </div>
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

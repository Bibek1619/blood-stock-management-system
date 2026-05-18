export default function PublicDashboardHome() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to the Public Portal</h1>
        <p className="text-gray-500 mt-2">
          View public information, request blood donations, and see our gallery.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder cards */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-semibold text-lg text-red-700">Available Blood</h3>
          <p className="text-gray-600 mt-2 text-sm">Real-time stock of blood units available for request.</p>
          <div className="mt-4 text-3xl font-bold">124 <span className="text-sm font-normal text-gray-500">units</span></div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-semibold text-lg text-blue-700">Recent Requests</h3>
          <p className="text-gray-600 mt-2 text-sm">Check the status of your recent blood donation requests.</p>
          <div className="mt-4 text-3xl font-bold">3 <span className="text-sm font-normal text-gray-500">pending</span></div>
        </div>
      </div>
    </div>
  );
}

export default function DonorRequestPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Donor Requests</h1>
        <p className="text-gray-500 mt-2">
          Submit a request for blood donation or view your previous requests.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-center justify-center min-h-[300px] border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Donor Request Form</h3>
            <p className="mt-1 text-sm text-gray-500">
              The request form will be available here soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

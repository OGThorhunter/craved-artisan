export default function VendorInbox() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Messages & Notifications</h2>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="flex-1">
            <p className="text-sm font-medium">New order from Sarah M.</p>
            <p className="text-xs text-gray-600">2 cinnamon rolls, 1 sourdough loaf</p>
          </div>
          <span className="text-xs text-gray-500">2m ago</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <div className="flex-1">
            <p className="text-sm font-medium">Customer review received</p>
            <p className="text-xs text-gray-600">5 stars for your sourdough bread!</p>
          </div>
          <span className="text-xs text-gray-500">1h ago</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <div className="flex-1">
            <p className="text-sm font-medium">Weekly payout processed</p>
            <p className="text-xs text-gray-600">$247.50 transferred to your account</p>
          </div>
          <span className="text-xs text-gray-500">3h ago</span>
        </div>
      </div>
    </div>
  );
} 
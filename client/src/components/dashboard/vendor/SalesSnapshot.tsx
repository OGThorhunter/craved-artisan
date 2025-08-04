export default function SalesSnapshot() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Sales Snapshot</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Today's Sales</h3>
          <p className="text-2xl font-bold text-green-600">$247.50</p>
          <p className="text-xs text-green-600">+12% from yesterday</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">This Week</h3>
          <p className="text-2xl font-bold text-blue-600">$1,234.00</p>
          <p className="text-xs text-blue-600">+8% from last week</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800">Orders Pending</h3>
          <p className="text-2xl font-bold text-purple-600">23</p>
          <p className="text-xs text-purple-600">5 need attention</p>
        </div>
      </div>
    </div>
  );
} 
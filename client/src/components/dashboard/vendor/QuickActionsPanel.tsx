export default function QuickActionsPanel() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition">
          <div className="text-2xl mb-2">📦</div>
          <span className="text-sm font-medium">Add Product</span>
        </button>
        <button className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition">
          <div className="text-2xl mb-2">📊</div>
          <span className="text-sm font-medium">View Orders</span>
        </button>
        <button className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition">
          <div className="text-2xl mb-2">💰</div>
          <span className="text-sm font-medium">Payout</span>
        </button>
        <button className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-600 transition">
          <div className="text-2xl mb-2">📝</div>
          <span className="text-sm font-medium">Update Hours</span>
        </button>
      </div>
    </div>
  );
} 
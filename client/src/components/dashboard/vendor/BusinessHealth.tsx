export default function BusinessHealth() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Business Health</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-3">Customer Satisfaction</h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
            <span className="text-sm text-gray-600">4.8/5.0</span>
          </div>
          <p className="text-sm text-gray-600">Based on 127 reviews</p>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-3">Inventory Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Low Stock Items</span>
              <span className="text-sm font-medium text-orange-600">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Out of Stock</span>
              <span className="text-sm font-medium text-red-600">1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Active Products</span>
              <span className="text-sm font-medium text-green-600">24</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
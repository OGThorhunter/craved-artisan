export default function AIInsightsPanel() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">AI Insights</h2>
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">📈 Sales Opportunity</h3>
          <p className="text-sm text-blue-700">
            Your sourdough bread sells 40% better on weekends. Consider increasing production for Friday-Sunday.
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium text-green-800 mb-2">🎯 Customer Trend</h3>
          <p className="text-sm text-green-700">
            Customers who buy your cinnamon rolls often purchase coffee products. Consider a bundle offer.
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">⚠️ Inventory Alert</h3>
          <p className="text-sm text-yellow-700">
            Your organic flour supply is running low. Reorder within 3 days to avoid stockouts.
          </p>
        </div>
      </div>
    </div>
  );
} 
export default function LeaderboardWidget() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Top Performers</h2>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">1</div>
          <div className="flex-1">
            <p className="font-medium">Sweetwater Farms</p>
            <p className="text-sm text-gray-600">$2,847 this week</p>
          </div>
          <span className="text-sm font-medium text-green-600">+15%</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">2</div>
          <div className="flex-1">
            <p className="font-medium">Artisan Bread Co.</p>
            <p className="text-sm text-gray-600">$2,234 this week</p>
          </div>
          <span className="text-sm font-medium text-green-600">+8%</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
          <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold">3</div>
          <div className="flex-1">
            <p className="font-medium">Fresh Pastries</p>
            <p className="text-sm text-gray-600">$1,987 this week</p>
          </div>
          <span className="text-sm font-medium text-green-600">+12%</span>
        </div>
      </div>
    </div>
  );
} 
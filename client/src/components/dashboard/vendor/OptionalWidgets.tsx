export default function OptionalWidgets() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Additional Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-3">Weather & Local Events</h3>
          <div className="space-y-2 text-sm">
            <p>🌤️ Sunny, 72°F - Perfect for outdoor markets</p>
            <p>🎪 Local Food Festival this weekend</p>
            <p>📅 3 upcoming events in your area</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-3">Community Updates</h3>
          <div className="space-y-2 text-sm">
            <p>👥 12 new customers joined this week</p>
            <p>💬 5 new reviews across the platform</p>
            <p>📢 New feature: Bulk ordering available</p>
          </div>
        </div>
      </div>
    </div>
  );
} 
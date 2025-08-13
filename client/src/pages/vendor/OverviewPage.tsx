import { useState } from "react";
import { useVendorOverviewDashboard } from "@/hooks/dashboard";

function DeltaBadge({ pct }: { pct:number }) {
  const color = pct > 0 ? "text-green-600" : pct < 0 ? "text-red-600" : "text-gray-700";
  const sign = pct>0? "▲" : pct<0? "▼" : "■";
  return <span className={`text-sm ${color}`}>{sign} {Math.abs(pct).toFixed(1)}%</span>;
}

function SparkLine({ data }:{ data:Array<{date:string; revenue:number; orders:number}> }) {
  // placeholder: simple inline bars; replace with your chart
  const max = Math.max(1, ...data.map(d=>d.revenue));
  return (
    <div className="flex items-end gap-1 h-10">
      {data.slice(-30).map((d,i)=>(
        <div key={i} style={{ height: `${(d.revenue/max)*100}%` }} className="w-1 bg-black/50 rounded-sm" />
      ))}
    </div>
  );
}

export default function OverviewPage(){
  const vendorId = "dev-vendor-id"; // TODO: from auth context
  const [range, setRange] = useState<"today"|"week"|"month">("today");
  const { data, isLoading } = useVendorOverviewDashboard(vendorId, range);

  const sales = data?.sales;
  const health = data?.health;
  const messages = data?.messages;
  const insights = data?.insights || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid md:grid-cols-5 gap-4 mb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Hero */}
      <div className="rounded-2xl p-6 bg-[#F7F2EC] flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Welcome back 👋</h1>
          <p className="text-sm text-neutral-700">Here's your business at a glance.</p>
        </div>
        <div className="flex gap-2">
          {(["today","week","month"] as const).map(r=>(
            <button key={r} onClick={()=>setRange(r)} className={`px-3 py-1 rounded-xl border ${range===r?"bg-[#5B6E02] text-white":"bg-white"}`}>{r.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* Today's Performance Tiles */}
      <div className="grid md:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl border-2 border-[#5B6E02] bg-[#F7F2EC] shadow-xl">
          <div className="text-xs text-neutral-600">Revenue ({sales?.period?.label || ""})</div>
          <div className="text-2xl font-semibold">${(sales?.revenue||0).toFixed(2)}</div>
          <div className="mt-1"><DeltaBadge pct={sales?.delta?.revenuePct||0} /></div>
          <div className="mt-2"><SparkLine data={sales?.sparkline||[]} /></div>
        </div>
        <div className="p-4 rounded-2xl border-2 border-[#5B6E02] bg-[#F7F2EC] shadow-xl">
          <div className="text-xs text-neutral-600">Orders</div>
          <div className="text-2xl font-semibold">{sales?.orders||0}</div>
          <div className="mt-1"><DeltaBadge pct={sales?.delta?.ordersPct||0} /></div>
        </div>
        <div className="p-4 rounded-2xl border-2 border-[#5B6E02] bg-[#F7F2EC] shadow-xl">
          <div className="text-xs text-neutral-600">Average Order Value</div>
          <div className="text-2xl font-semibold">${(sales?.aov||0).toFixed(2)}</div>
          <div className="mt-1"><DeltaBadge pct={sales?.delta?.aovPct||0} /></div>
        </div>
        <div className="p-4 rounded-2xl border-2 border-[#5B6E02] bg-[#F7F2EC] shadow-xl">
          <div className="text-xs text-neutral-600">Top Product Today</div>
          <div className="text-base">{data?.sales?.topProductToday?.name || "—"}</div>
          <div className="text-xs text-neutral-600">{data?.sales?.topProductToday ? `${data.sales.topProductToday.qtySold} sold` : ""}</div>
        </div>
        <div className="p-4 rounded-2xl border-2 border-[#5B6E02] bg-[#F7F2EC] shadow-xl">
          <div className="text-xs text-neutral-600">Best Day</div>
          <div className="text-base">{data?.sales?.bestDay?.date ? new Date(data.sales.bestDay.date).toDateString() : "—"}</div>
          <div className="text-sm font-medium">${(data?.sales?.bestDay?.revenue||0).toFixed(2)}</div>
        </div>
      </div>

      {/* Business Health Snapshot */}
      <div className="grid md:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl border-2 border-[#5B6E02] bg-[#F7F2EC] shadow-xl">
          <div className="text-xs">Inventory Status</div>
          <div className="text-lg">{health?.lowStockCount||0} low-stock</div>
        </div>
        <div className="p-4 rounded-2xl border-2 border-[#5B6E02] bg-[#F7F2EC] shadow-xl">
          <div className="text-xs">Fulfillment Queue</div>
          <div className="text-lg">{health?.fulfillmentQueueCount||0} orders</div>
        </div>
        <div className="p-4 rounded-2xl border-2 border-[#5B6E02] bg-[#F7F2EC] shadow-xl">
          <div className="text-xs">Profit Margin (est.)</div>
          <div className="text-lg">{(health?.profitMarginPct||0).toFixed(1)}%</div>
        </div>
        <div className="p-4 rounded-2xl border-2 border-[#5B6E02] bg-[#F7F2EC] shadow-xl">
          <div className="text-xs">Pending Payouts</div>
          <div className="text-lg">${(health?.pendingPayoutsEstimate||0).toFixed(2)}</div>
        </div>
        <div className="p-4 rounded-2xl border-2 border-[#5B6E02] bg-[#F7F2EC] shadow-xl">
          <div className="text-xs">Churn Risk</div>
          <div className="text-lg">⚠️ {health?.churnRiskCount||0}</div>
        </div>
      </div>

      {/* AI Insights + Notifications */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border-2 border-[#5B6E02] bg-[#F7F2EC] shadow-xl md:col-span-2">
          <div className="font-medium mb-2">🧠 AI Insights</div>
          <ul className="list-disc pl-5 space-y-1">
            {insights.length ? insights.map((s,i)=><li key={i}>{s}</li>) : <li>No insights yet — come back after more orders.</li>}
          </ul>
        </div>
        <div className="p-4 rounded-2xl border-2 border-[#5B6E02] bg-[#F7F2EC] shadow-xl">
          <div className="font-medium mb-2">📬 Messages & Alerts</div>
          <div>{(messages?.unreadCount||0)} new messages</div>
          <div>{(messages?.newReviewsToday||0)} reviews today</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 rounded-2xl border-2 border-[#5B6E02] bg-[#F7F2EC] shadow-xl">
        <div className="font-medium mb-3">🎯 Quick Actions</div>
        <div className="flex flex-wrap gap-2">
          <a href="/dashboard/vendor/products/new" className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50">Add New Product</a>
          <a href="/dashboard/vendor/discounts/new" className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50">Create Discount</a>
          <a href="/dashboard/vendor/marketing/email" className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50">Send Email to Segment</a>
          <a href="/dashboard/vendor/payouts" className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50">View Payouts</a>
          <a href="/dashboard/vendor/reports/export" className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50">Export Report</a>
        </div>
      </div>

      {/* Motivator */}
      <div className="p-4 rounded-2xl border-2 border-[#5B6E02] bg-[#F7F2EC] shadow-xl">
        <div className="font-medium mb-2">🔥 Leaderboard / Motivator</div>
        <div>Your best sales day: {data?.sales?.bestDay?.date ? new Date(data.sales.bestDay.date).toDateString() : "—"} — ${ (data?.sales?.bestDay?.revenue||0).toFixed(2) }</div>
        <div>You've served {data?.leaderboard?.totalCustomersServed||0} customers 🙌</div>
      </div>
    </div>
  );
}

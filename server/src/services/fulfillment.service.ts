import dayjs from "dayjs";
import prisma from '../lib/prisma';

export async function getVendorAvailability(vendorProfileId: string, { days = 21, zip }: { days?: number; zip?: string }) {
  // Pull windows and (optionally) filter locations by ZIP if provided
  // FulfillmentWindow and FulfillmentLocation models not available in current schema
  const [windows, locs] = await Promise.all([
    // prisma.fulfillmentWindow.findMany({ where: { vendorProfileId, active: true } }),
    // prisma.fulfillmentLocation.findMany({ where: { vendorProfileId, active: true, ...(zip ? { zip } : {}) } })
    Promise.resolve([]), // Placeholder for windows
    Promise.resolve([])  // Placeholder for locations
  ]);
  const locMap = new Map(locs.map((l: any) => [l.id, l]));

  const out: Array<{ date: string; startTime: string; endTime: string; kind: string; location?: any }> = [];
  const start = dayjs().startOf("day");

  for (let d = 0; d < days; d++) {
    const date = start.add(d, "day");
    const weekday = date.day(); // 0..6
    for (const w of windows) {
      if (w.weekday !== weekday || !w.active) continue;
      const location = w.locationId ? locMap.get(w.locationId) : undefined;
      out.push({ date: date.toISOString(), startTime: w.startTime, endTime: w.endTime, kind: w.kind, location });
    }
  }

  // TODO: enforce capacity based on existing OrderFulfillment for that vendor/date window.
  return out;
}

export async function scheduleOrderForVendors(orderId: string, selections: Array<{
  vendorProfileId: string; method: "pickup"|"delivery"|"ship"; date: string; locationId?: string; fee?: number; notes?: string;
}>) {
  // OrderFulfillment and OrderEvent models not available in current schema
  const rows = selections.map(s => ({
    orderId, vendorProfileId: s.vendorProfileId, method: s.method, date: new Date(s.date),
    locationId: s.locationId ?? null, fee: s.fee ?? 0, notes: s.notes ?? null
  }));
  
  // TODO: Restore when models are properly implemented
  // await prisma.orderFulfillment.createMany({ data: rows });
  // await prisma.orderEvent.create({ data: { orderId, type: "scheduled", message: "Fulfillment scheduled" } });
  
  return true;
}

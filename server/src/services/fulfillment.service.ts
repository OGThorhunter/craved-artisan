import dayjs from "dayjs";
import { prisma } from "../db/prisma";

export async function getVendorAvailability(vendorId: string, { days = 21, zip }: { days?: number; zip?: string }) {
  // Pull windows and (optionally) filter locations by ZIP if provided
  const [windows, locs] = await Promise.all([
    prisma.fulfillmentWindow.findMany({ where: { vendorId, active: true } }),
    prisma.fulfillmentLocation.findMany({ where: { vendorId, active: true, ...(zip ? { zip } : {}) } })
  ]);
  const locMap = new Map(locs.map(l => [l.id, l]));

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
  vendorId: string; method: "pickup"|"delivery"|"ship"; date: string; locationId?: string; fee?: number; notes?: string;
}>) {
  const rows = selections.map(s => ({
    orderId, vendorId: s.vendorId, method: s.method, date: new Date(s.date),
    locationId: s.locationId ?? null, fee: s.fee ?? 0, notes: s.notes ?? null
  }));
  await prisma.orderFulfillment.createMany({ data: rows });
  await prisma.orderEvent.create({ data: { orderId, type: "scheduled", message: "Fulfillment scheduled" } });
  return true;
}

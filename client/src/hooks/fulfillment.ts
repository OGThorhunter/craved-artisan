import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpJson } from "@/lib/http"; // your fetch wrapper that returns .json()

export function useVendorWindows(vendorId: string, zip?: string) {
  return useQuery({
    queryKey: ["windows", vendorId, zip],
    queryFn: () => httpJson(`/api/fulfillment/vendor/${vendorId}/windows${zip ? `?zip=${zip}` : ""}`),
    staleTime: 60_000,
  });
}

export function useScheduleOrder() {
  return useMutation({
    mutationFn: ({ orderId, selections }: { orderId: string; selections: any[] }) =>
      httpJson(`/api/fulfillment/order/${orderId}/schedule`, { method: "POST", body: JSON.stringify({ selections }) }),
  });
}

import { useQuery } from "@tanstack/react-query";

export function useVendorOverviewDashboard(vendorId: string, range: "today"|"week"|"month"="today") {
  return useQuery({
    queryKey: ["dash","overview",vendorId,range],
    queryFn: async () => {
      const r = await fetch(`/api/dashboard/vendor/${vendorId}/overview?range=${range}`, { credentials: "include" });
      if (!r.ok) throw new Error("Failed to load overview");
      return r.json();
    },
    staleTime: 30_000
  });
}

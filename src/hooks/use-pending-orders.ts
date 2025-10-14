import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/lib/services/order-service";

export function usePendingOrdersCount() {
  return useQuery({
    queryKey: ["pending-orders-count"],
    queryFn: () => orderService.getPendingOrdersCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 25000, // Consider data stale after 25 seconds
  });
}

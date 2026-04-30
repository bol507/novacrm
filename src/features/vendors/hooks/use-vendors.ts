import { useQuery } from "@tanstack/react-query";
import { vendorService } from "../services/vendor-service";

export const useVendors = (
  page: number = 1,
  limit: number = 10,
  filters?: { search?: string; category?: string }
) => {
  return useQuery({
    queryKey: ["vendors", page, limit, filters],
    queryFn: () => vendorService.getVendors(page, limit, filters),
    staleTime: 5 * 60 * 1000,
  });
};
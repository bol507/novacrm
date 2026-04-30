import { useQuery } from "@tanstack/react-query";
import { vendorService } from "../services/vendor-service";

export const useVendor = (id: string | undefined) => {
  return useQuery({
    queryKey: ["vendor", id],
    queryFn: () => vendorService.getVendor(parseInt(id || "0")),
    enabled: !!id && id !== "undefined",
    staleTime: 0, // Siempre fresco al entrar
  });
};
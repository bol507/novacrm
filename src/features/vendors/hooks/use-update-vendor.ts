import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { VendorFormValues } from "../types/vendor";
import { useNavigate } from "react-router-dom";
import { vendorService } from "../services/vendor-service";

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: VendorFormValues }) => 
      vendorService.updateVendor(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vendor", variables.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor updated successfully");
      navigate(`/dashboard/vendors/${variables.id}`);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || "Error updating vendor";
      toast.error(msg);
    },
  });
};
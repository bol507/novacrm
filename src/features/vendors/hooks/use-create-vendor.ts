import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { VendorFormValues } from "../types/vendor";
import { useNavigate } from "react-router-dom";
import { vendorService } from "../services/vendor-service";

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: VendorFormValues) => vendorService.createVendor(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor created successfully");
      navigate(`/dashboard/vendors/${response.data.id}`);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || "Error creating vendor";
      toast.error(msg);
    },
  });
};
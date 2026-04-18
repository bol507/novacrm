import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { vendorService } from "../services/vendor-service";

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (id: number) => vendorService.deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor deleted successfully");
      navigate("/dashboard/vendors");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || "Error deleting vendor";
      toast.error(msg);
    },
  });
};
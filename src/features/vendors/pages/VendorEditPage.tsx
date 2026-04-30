import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VendorFormValues } from "../types/vendor";
import { useVendor } from "../hooks/use-vendor";
import { useUpdateVendor } from "../hooks/use-update-vendor";
import { VendorFormContent } from "../components/VendorFormContent";

export const VendorEditPage = () => {
  const { vendorId} = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const { data: vendor, isLoading } = useVendor(vendorId);
  const updateVendor = useUpdateVendor();

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  const handleSubmit = async (values: VendorFormValues) => {
    await updateVendor.mutateAsync({ id: parseInt(vendorId!), data: values });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Vendor</h1>
          <p className="text-muted-foreground">Update supplier information</p>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Vendor Details</CardTitle></CardHeader>
        <CardContent>
          <VendorFormContent
            mode="edit"
            initialData={vendor}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
            isSubmitting={updateVendor.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorEditPage;
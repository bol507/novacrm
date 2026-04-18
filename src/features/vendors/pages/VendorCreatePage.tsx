import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VendorFormContent } from "../components/VendorFormContent";
import type { VendorFormValues } from "../types/vendor";
import { useCreateVendor } from "../hooks/use-create-vendor";

export const VendorCreatePage = () => {
  const navigate = useNavigate();
  const createVendor = useCreateVendor();

  const handleSubmit = async (values: VendorFormValues) => {
    await createVendor.mutateAsync(values);
    // Navigation handled inside hook onSuccess
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Vendor</h1>
          <p className="text-muted-foreground">Add a new supplier to your network</p>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>Vendor Details</CardTitle></CardHeader>
        <CardContent>
          <VendorFormContent
            mode="create"
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
            isSubmitting={createVendor.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorCreatePage;
// src/features/vendors/pages/VendorDetailPage.tsx

import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, Mail, Phone, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useVendor } from "../hooks/use-vendor";
import { useDeleteVendor } from "../hooks/use-delete-vendor";

export const VendorDetailPage = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const { data: vendor, isLoading, error } = useVendor(vendorId);
  const deleteVendor = useDeleteVendor();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;
    try {
      await deleteVendor.mutateAsync(parseInt(vendorId!));
      toast.success("Vendor deleted successfully");
    } catch {
      toast.error("Error deleting vendor");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Vendor not found</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{vendor.vendorname}</h1>
            <p className="text-muted-foreground">ID: {vendor.id} • {vendor.category || "No Category"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(`/dashboard/vendors/${vendorId}/edit`)}>
            <Edit className="h-4 w-4" /> Edit
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive" onClick={handleDelete} disabled={deleteVendor.isPending}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Contact & Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {vendor.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{vendor.email}</span>
              </div>
            )}
            {vendor.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{vendor.phone}</span>
              </div>
            )}
            {vendor.website && (
              <div className="flex items-center gap-3 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a href={vendor.website} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
                  {vendor.website}
                </a>
              </div>
            )}
            {!vendor.email && !vendor.phone && !vendor.website && (
              <p className="text-sm text-muted-foreground">No contact information provided</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Address</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                {vendor.address && <p className="font-medium">{vendor.address}</p>}
                <p className="text-muted-foreground">
                  {[vendor.city, vendor.state, vendor.postalcode, vendor.country].filter(Boolean).join(", ") || "No address provided"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {vendor.description && (
        <Card>
          <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{vendor.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader><CardTitle className="text-base">System Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Created:</span>
            <span className="ml-2 font-medium">{new Date(vendor.createdtime).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Modified:</span>
            <span className="ml-2 font-medium">{vendor.modifiedtime ? new Date(vendor.modifiedtime).toLocaleDateString() : "-"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorDetailPage;  
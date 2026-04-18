import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PurchaseStatusBadge } from "../components/PurchaseStatusBadge";
import { usePurchaseDetail } from "../hooks/usePurchaseDetail";
import { useDeletePurchase } from "../hooks/useDeletePurchase";
import { toast } from "sonner";

export const PurchaseDetailPage = () => {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const navigate = useNavigate();
  const { data: purchase, isLoading, error } = usePurchaseDetail(purchaseId || "");
  const deletePurchase = useDeletePurchase();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-PA", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-PA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEdit = () => {
    navigate(`/dashboard/purchases/${purchaseId}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this purchase order?")) {
      return;
    }
    try {
      await deletePurchase.mutateAsync(parseInt(purchaseId!));
      toast.success("Purchase order deleted successfully");
      navigate("/dashboard/purchases");
    } catch (error) {
      toast.error("Error deleting purchase order");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin text-2xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading purchase...</p>
        </div>
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Error loading purchase</p>
        <Button variant="outline" onClick={handleBack}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {purchase.subject}
            </h1>
            <p className="text-sm text-muted-foreground">
              PO #{purchase.ponumber} • {purchase.projectname || "No Project"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleEdit}>
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={handleDelete}
            disabled={deletePurchase.isPending}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <PurchaseStatusBadge status={purchase.status} />
        {purchase.vendorname && (
          <Badge variant="outline">Vendor: {purchase.vendorname}</Badge>
        )}
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {purchase.projectname || "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              PO Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {formatDate(purchase.podate)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valid Until
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {formatDate(purchase.validtill)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">
                    #
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">
                    Product
                  </th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-muted-foreground">
                    Qty
                  </th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-muted-foreground">
                    Price
                  </th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-muted-foreground">
                    Discount
                  </th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-muted-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {purchase.items.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-3 text-sm">{item.sequence_no}</td>
                    <td className="py-3 px-3 text-sm">
                      <div className="font-medium">{item.productname}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-sm text-right">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 text-sm text-right">
                      {formatCurrency(item.listprice)}
                    </td>
                    <td className="py-3 px-3 text-sm text-right">
                      {item.discount_percent > 0 ? `${item.discount_percent}%` : "-"}
                    </td>
                    <td className="py-3 px-3 text-sm text-right font-medium">
                      {formatCurrency(
                        (item.quantity || 0) *
                          (item.listprice || 0) *
                          (1 - (item.discount_percent || 0) / 100)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Subtotal</div>
              <div className="text-xl font-bold">
                {formatCurrency(purchase.subtotal)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tax (7%)</div>
              <div className="text-xl font-bold text-blue-600">
                {formatCurrency(purchase.taxtotal)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(purchase.total)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      {purchase.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {purchase.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Created:</span>{" "}
              <span className="font-medium">
                {formatDate(purchase.createdtime || null)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Modified:</span>{" "}
              <span className="font-medium">
                {formatDate(purchase.modifiedtime || null)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Assigned To:</span>{" "}
              <span className="font-medium">
                {purchase.assigned_user_name || "-"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Created By:</span>{" "}
              <span className="font-medium">
                {purchase.assigned_user_name || "-"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseDetailPage;
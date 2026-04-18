import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PurchaseStatusBadge } from "../components/PurchaseStatusBadge";
import { usePurchases } from "../hooks/usePurchases";
import type { Purchase } from "../types/purchase";

/**
 * PurchaseListPage component for displaying a paginated list of purchase orders.
 *
 * Features:
 * - Displays purchase orders in a sortable table
 * - Search by subject or PO number
 * - Filter by purchase status
 * - Pagination controls
 * - Create new purchase order
 * - Clickable rows to view purchase details
 *
 * @component
 * @returns The rendered purchase list page
 */
export const PurchaseListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, _setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading, error } = usePurchases(
    page,
    limit,
    searchTerm,
    {
      status: statusFilter !== "all" ? statusFilter : undefined,
    }
  );

  const purchases = data?.data || [];
  const meta = data?.meta || { current_page: 1, last_page: 1, total: 0 };

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
      month: "short",
      day: "numeric",
    });
  };

  const handleViewPurchase = (purchaseId: number) => {
    navigate(`/dashboard/purchases/${purchaseId}`);
  };

  const handleCreatePurchase = () => {
    navigate("/dashboard/purchases/new");
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="border-destructive/20 bg-destructive/5 max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-destructive font-medium">Error loading purchases</p>
            <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Purchases</h1>
            <p className="text-sm text-muted-foreground">
              Manage purchase orders and track spending
            </p>
          </div>
        </div>
        <Button onClick={handleCreatePurchase} className="gap-2">
          <Plus className="h-4 w-4" />
          New Purchase
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by subject or PO number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Received">Received</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders ({meta.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
              ))}
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">No purchases found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first purchase order"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button
                  variant="outline"
                  onClick={handleCreatePurchase}
                  className="mt-4 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Purchase
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">PO Number</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="w-[150px]">Project</TableHead>
                    <TableHead className="w-[150px]">Vendor</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[120px] text-right">Total</TableHead>
                    <TableHead className="w-[120px]">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase: Purchase) => (
                    <TableRow
                      key={purchase.purchaseorderid}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleViewPurchase(purchase.purchaseorderid)}
                    >
                      <TableCell className="font-mono text-sm">
                        {purchase.ponumber}
                      </TableCell>
                      <TableCell className="font-medium">
                        {purchase.subject}
                      </TableCell>
                      <TableCell>
                        {purchase.projectname || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {purchase.vendorname || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <PurchaseStatusBadge status={purchase.status} />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(purchase.total || 0)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(purchase.podate)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(meta.current_page - 1) * limit + 1} to{" "}
            {Math.min(meta.current_page * limit, meta.total)} of {meta.total}{" "}
            purchases
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={meta.current_page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {meta.current_page} of {meta.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={meta.current_page === meta.last_page}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseListPage;
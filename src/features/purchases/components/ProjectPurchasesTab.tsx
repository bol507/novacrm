// src/features/purchases/components/ProjectPurchasesTab.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Plus, Search, Filter, Eye } from "lucide-react";
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
import { PurchaseBudgetAlert } from "./PurchaseBudgetAlert";
import { useProjectPurchases } from "../hooks/useProjectPurchases";
import { cn } from "@/shared/lib/utils";
import { PurchaseStatusBadge } from "./PurchaseStatusBadge";
import type { Purchase } from "../types/purchase";

interface ProjectPurchasesTabProps {
  projectId: number;
  projectBudget?: number | null;
}

/**
 * ProjectPurchasesTab Component
 *
 * Displays all purchases related to a project with budget tracking.
 * Features:
 * - Budget vs spent alert
 * - Search and filter by status
 * - Purchase list with status badges
 * - Create new purchase button
 * - View purchase detail navigation
 *
 * @component
 * @param {ProjectPurchasesTabProps} props - Component props
 * @param {number} props.projectId - Project ID to fetch purchases for
 * @param {number|null} props.projectBudget - Project budget for tracking
 *
 * @returns {JSX.Element} Purchases tab content
 */
export const ProjectPurchasesTab = ({
  projectId,
  projectBudget,
}: ProjectPurchasesTabProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading, error } = useProjectPurchases(projectId);

  const purchases = data?.data || [];
  const totalSpent = purchases.reduce((sum : number, p : Purchase) => sum + (p.total || 0), 0);
  const percentageUsed = projectBudget
    ? (totalSpent / projectBudget) * 100
    : 0;

  // Filter purchases
  const filteredPurchases = purchases.filter((purchase: Purchase) => {
    const matchesSearch =
      purchase.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.ponumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || purchase.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const handleCreatePurchase = () => {
  
  navigate(`/dashboard/purchases/create?projectId=${projectId}`);
  
};
  

  const handleViewPurchase = (purchaseId: number) => {
    navigate(`/dashboard/purchases/${purchaseId}`);
  };

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

  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="p-6 text-center">
          <p className="text-destructive font-medium">
            Error loading purchases
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ✅ Budget Alert */}
      <PurchaseBudgetAlert
        projectBudget={projectBudget || null}
        projectSpent={totalSpent}
        percentageUsed={percentageUsed}
      />

      {/* ✅ Header with Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">
            Project Purchases ({filteredPurchases.length})
          </h3>
        </div>

        <Button onClick={handleCreatePurchase} className="gap-2">
          <Plus className="h-4 w-4" />
          New Purchase
        </Button>
      </div>

      {/* ✅ Search and Filter */}
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

      {/* ✅ Purchases Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-muted/50 rounded animate-pulse"
                />
              ))}
            </div>
          ) : filteredPurchases.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">
                No purchases found
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first purchase order for this project"}
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
                    <TableHead className="w-[150px]">Vendor</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[120px] text-right">
                      Total
                    </TableHead>
                    <TableHead className="w-[120px]">Date</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.map((purchase : Purchase) => (
                    <TableRow
                      key={purchase.purchaseorderid}
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() =>
                        handleViewPurchase(purchase.purchaseorderid)
                      }
                    >
                      <TableCell className="font-mono text-sm">
                        {purchase.ponumber}
                      </TableCell>
                      <TableCell className="font-medium">
                        {purchase.subject}
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
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPurchase(purchase.purchaseorderid);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ Summary Footer */}
      {purchases.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 bg-muted/30 rounded-lg border">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Total Purchases: {purchases.length}
            </p>
            <p className="text-sm text-muted-foreground">
              Total Spent: {formatCurrency(totalSpent)}
            </p>
          </div>
          {projectBudget && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Budget Remaining</p>
              <p
                className={cn(
                  "text-lg font-bold",
                  projectBudget - totalSpent < 0
                    ? "text-destructive"
                    : "text-emerald-600"
                )}
              >
                {formatCurrency(Math.max(0, projectBudget - totalSpent))}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
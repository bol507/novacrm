import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  Users,
  Building2,
  TrendingUp,
  ArrowLeft,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Hash,
  Percent,
  Scale,
  Activity,
  ExternalLinkIcon,
} from "lucide-react";
import { useOpportunity } from "@/features/opportunity/hooks/useOpportunity";
import { opportunityService } from "../services/opportunityService";
import { toast } from "sonner";
import { useConfirm } from "@/components/confirm-dialog";

/**
 * OpportunityDetailPage component for displaying detailed information about a sales opportunity.
 *
 * Features:
 * - Displays comprehensive opportunity details including financial metrics
 * - Shows pipeline progress with visual progress bar
 * - Calculates weighted value based on amount and probability
 * - Shows days until closing with color-coded urgency indicators
 * - Displays client and assigned user information
 * - Edit and delete actions with confirmation dialog
 * - Special banners for Won/Lost opportunities
 * - Responsive layout with card-based metrics
 *
 * @component
 * @returns The rendered opportunity detail page
 *
 * @example
 * // Route configuration
 * <Route path="/dashboard/opportunities/:id" element={<OpportunityDetailPage />} />
 *
 * @example
 * // Navigate to detail page
 * navigate(`/dashboard/opportunities/${opportunityId}`);
 */
const OpportunityDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const showConfirm = useConfirm();

  const opportunityId = parseInt(id || "0");
  const { data: opportunity, isLoading, error } = useOpportunity(opportunityId);

  /**
   * Navigates to the opportunity edit page.
   */
  const handleEdit = () => {
    if (!opportunity) return;
    navigate(`/dashboard/opportunities/${opportunity.potentialid}/edit`);
  };

  /**
   * Handles opportunity deletion with confirmation dialog.
   * Shows success or error toast based on the result.
   */
  const handleDelete = async () => {
    if (!opportunity) return;

    await showConfirm({
      title: "Delete Opportunity?",
      description: `Are you sure you want to delete the opportunity "${opportunity.potentialname}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await opportunityService.deleteOpportunity(opportunity.potentialid);
          toast.success("Opportunity deleted successfully");
          navigate("/dashboard/opportunities");
        } catch (error: any) {
          toast.error(error.response?.data?.error || "Error deleting opportunity");
        }
      },
    });
  };

  /**
   * Formats a number as USD currency.
   *
   * @param value - The number to format
   * @returns Formatted currency string or '-' if value is falsy
   */
  const formatCurrency = (value: number | null | undefined): string => {
    if (!value) return "-";
    return new Intl.NumberFormat("es-PA", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  /**
   * Formats a date string to Spanish locale short format.
   *
   * @param dateString - ISO date string or null
   * @returns Formatted date string or '-' if date is null
   */
  const formatDateShort = (dateString: string | null): string => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES");
  };

  /**
   * Calculates the number of days until the closing date.
   *
   * @param closingDate - The closing date string or null
   * @returns Number of days until closing, or null if no date provided
   */
  const getDaysUntilClose = (closingDate: string | null): number | null => {
    if (!closingDate) return null;
    const today = new Date();
    const close = new Date(closingDate);
    const diffTime = close.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  /**
   * Calculates the weighted value of the opportunity (amount * probability / 100).
   *
   * @param amount - The opportunity amount
   * @param probability - The probability percentage (0-100)
   * @returns Weighted value or null if either parameter is missing
   */
  const getWeightedValue = (amount: number | null, probability: number | null): number | null => {
    if (!amount || !probability) return null;
    return amount * (probability / 100);
  };

  /**
   * Returns the appropriate color class for a stage badge.
   *
   * @param stage - The sales stage string
   * @returns Tailwind CSS classes for the stage badge
   */
  const getStageColor = (stage: string): string => {
    switch (stage) {
      case "Closed Won":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "Closed Lost":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "Proposal/Price Quote":
      case "Negotiation/Review":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "Needs Analysis":
      case "Value Proposition":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "Qualification":
        return "bg-cyan-500/10 text-cyan-600 border-cyan-500/20";
      default:
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    }
  };

  /**
   * Returns the index of a stage in the sales pipeline.
   *
   * @param stage - The sales stage string
   * @returns The stage index (0-9), or -1 if not found
   */
  const getStageIndex = (stage: string): number => {
    const stages = [
      "Prospecting",
      "Qualification",
      "Needs Analysis",
      "Value Proposition",
      "Identifying Decision Makers",
      "Perception Analysis",
      "Proposal/Price Quote",
      "Negotiation/Review",
      "Closed Won",
      "Closed Lost",
    ];
    return stages.indexOf(stage);
  };

  /**
   * Calculates pipeline progress percentage based on current stage.
   *
   * @param stage - The sales stage string
   * @returns Progress percentage (0-100), excluding Closed Lost
   */
  const getPipelineProgress = (stage: string): number => {
    const index = getStageIndex(stage);
    if (index === -1) return 0;
    if (stage === "Closed Lost") return 0;
    return Math.round((index / 7) * 100);
  };

  /**
   * Returns status badge color classes based on opportunity stage.
   *
   * @param stage - The sales stage string
   * @returns Tailwind CSS classes for the status badge
   */
  const getStatusColor = (stage: string): string => {
    switch (stage) {
      case "Closed Won":
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "Closed Lost":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 w-96 bg-muted rounded" />
          <div className="grid gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-24 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-destructive mb-4 text-lg">Opportunity Not Found</div>
            <p className="text-muted-foreground mb-6">
              The opportunity you are looking for does not exist or has been deleted.
            </p>
            <Button asChild>
              <a href="/dashboard/opportunities">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Opportunities
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const daysUntilClose = getDaysUntilClose(opportunity.closingdate);
  const weightedValue = getWeightedValue(opportunity.amount, opportunity.probability);
  const pipelineProgress = getPipelineProgress(opportunity.sales_stage);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/dashboard/opportunities")}
            className="h-10 w-10 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                {opportunity.potentialname}
              </h1>
              <Badge variant="outline" className={getStageColor(opportunity.sales_stage)}>
                {opportunity.sales_stage}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Hash className="h-3.5 w-3.5" />
                {opportunity.potential_no}
              </span>
              <span className="flex items-center gap-1">
                <Activity className="h-3.5 w-3.5" />
                ID: {opportunity.potentialid}
              </span>
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(opportunity.sales_stage)}`}>
                {opportunity.sales_stage === "Closed Won" && <CheckCircle className="h-3 w-3" />}
                {opportunity.sales_stage === "Closed Lost" && <XCircle className="h-3 w-3" />}
                {opportunity.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Pipeline Progress */}
      {opportunity.sales_stage !== "Closed Lost" && (
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Pipeline Progress</span>
              <span className="text-sm font-bold">{pipelineProgress}%</span>
            </div>
            <Progress value={pipelineProgress} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Start</span>
              <span>Close</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Grid - Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Estimated Value */}
        <Card className="relative overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Estimated Value</p>
                <p className="text-2xl font-bold">{formatCurrency(opportunity.amount)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weighted Value */}
        <Card className="relative overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Weighted Value</p>
                <p className="text-2xl font-bold">
                  {weightedValue ? formatCurrency(weightedValue) : "-"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ({opportunity.probability}% probability)
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <Scale className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Probability */}
        <Card className="relative overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Probability</p>
                <p className="text-2xl font-bold">
                  {opportunity.probability ? `${opportunity.probability}%` : "-"}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Percent className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            {opportunity.probability && (
              <Progress value={opportunity.probability} className="h-1.5 mt-3" />
            )}
          </CardContent>
        </Card>

        {/* Days Until Close */}
        <Card className="relative overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Closing Date</p>
                <p className="text-lg font-bold">{formatDateShort(opportunity.closingdate)}</p>
                {daysUntilClose !== null && (
                  <p className={`text-xs mt-1 ${daysUntilClose < 0 ? "text-red-600" :
                      daysUntilClose === 0 ? "text-amber-600" :
                        daysUntilClose <= 30 ? "text-yellow-600" :
                          "text-green-600"
                    }`}>
                    {daysUntilClose < 0 ? `Expired ${Math.abs(daysUntilClose)} days ago` :
                      daysUntilClose === 0 ? "Expires today" :
                        `${daysUntilClose} days remaining`}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-full ${daysUntilClose !== null && daysUntilClose < 0 ? "bg-red-100" :
                  daysUntilClose !== null && daysUntilClose <= 7 ? "bg-amber-100" :
                    "bg-blue-100"
                }`}>
                <Clock className={`h-6 w-6 ${daysUntilClose !== null && daysUntilClose < 0 ? "text-red-600" :
                    daysUntilClose !== null && daysUntilClose <= 7 ? "text-amber-600" :
                      "text-blue-600"
                  }`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Grid - Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Client and Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-5 h-5" />
              Relationships
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Related Client - Con link en el nombre */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Client</p>
                {opportunity.related_to ? (
                  <Link
                    to={`/dashboard/clients/${opportunity.related_to}`}
                    className="font-medium text-primary hover:underline flex items-center gap-1 truncate"
                  >
                    {opportunity.related_to_name || 'View Client'}
                    <ExternalLinkIcon className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity" />
                  </Link>
                ) : (
                  <p className="font-medium text-muted-foreground">No client</p>
                )}
                {opportunity.related_to && (
                  <p className="text-xs text-muted-foreground">
                    ID: {opportunity.related_to}
                  </p>
                )}
              </div>
            </div>

            {/* Assigned To - También con link opcional */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">Assigned To</p>
                {opportunity.assigned_user_id ? (
                  <Link
                    to={`/dashboard/users/${opportunity.assigned_user_id}`}
                    className="font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    {opportunity.assigned_user_name || 'View User'}
                    <ExternalLinkIcon className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity" />
                  </Link>
                ) : (
                  <p className="font-medium text-muted-foreground">Unassigned</p>
                )}
                {opportunity.assigned_user_id && (
                  <p className="text-xs text-muted-foreground">
                    ID: {opportunity.assigned_user_id}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Opportunity Number</span>
              <span className="font-mono text-sm">{opportunity.potential_no}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Internal ID</span>
              <span className="font-mono text-sm">{opportunity.potentialid}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Stage</span>
              <Badge variant="outline" className={getStageColor(opportunity.sales_stage)}>
                {opportunity.sales_stage}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={opportunity.is_active ? "default" : "secondary"}>
                {opportunity.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {opportunity.description && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="w-5 h-5" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {opportunity.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Won/Lost Status Banner */}
      {opportunity.sales_stage === "Closed Won" && (
        <Card className="border-2 border-emerald-200 bg-emerald-50">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-emerald-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-900">Opportunity Won!</h3>
                <p className="text-emerald-700">
                  This opportunity was successfully closed with a value of{" "}
                  <span className="font-bold">{formatCurrency(opportunity.amount)}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {opportunity.sales_stage === "Closed Lost" && (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-red-100 rounded-full">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-900">Opportunity Lost</h3>
                <p className="text-red-700">
                  This opportunity was not closed. The lost value was{" "}
                  <span className="font-bold">{formatCurrency(opportunity.amount)}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OpportunityDetailPage;
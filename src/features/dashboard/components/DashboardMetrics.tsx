import { Users, DollarSign, FileText, TrendingUp, type LucideIcon } from 'lucide-react';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import MetricCard from './MetricCard';

/**
 * Color variant options for metric cards
 */
export type MetricColorVariant = "primary" | "accent" | "info" | "warning";

/**
 * Trend direction for metric change indicators
 */
export type MetricTrend = "up" | "down";

/**
 * Individual metric configuration for dashboard display
 * 
 * @remarks
 * - Uses LucideIcon type for proper icon component typing
 * - All fields are required for consistent metric card rendering
 */
export interface MetricConfig {
  /** Display title for the metric */
  title: string;
  /** Formatted value string for display */
  value: string;
  /** Percentage change string (e.g., "+12.5%") */
  change: string;
  /** Trend direction for visual indicator */
  trend: MetricTrend;
  /** Lucide icon component to display */
  icon: LucideIcon;
  /** Color variant for styling the metric card */
  color: MetricColorVariant;
}

/**
 * DashboardMetrics Component
 * 
 * Displays key performance indicators (KPIs) for the business dashboard.
 * Fetches metrics via custom hook, calculates month-over-month changes,
 * and renders metric cards with icons, values, and trend indicators.
 * 
 * @component
 * @returns {JSX.Element} Grid of metric cards or loading/error states
 * 
 * @example
 * // Basic usage in dashboard layout
 * <div className="space-y-6">
 *   <DashboardMetrics />
 *   
 * </div>
 * 
 * @remarks
 * - Uses useDashboardMetrics hook for data fetching with React Query
 * - Displays skeleton loaders while metrics are being fetched
 * - Shows error message if API call fails
 * - Calculates percentage changes using mock previous month data
 * - Metrics include: active clients, monthly sales, total quotes, conversion rate
 * - Each metric card uses semantic color variants for visual differentiation
 * - Values are formatted with Panama locale (es-PA) for currency and numbers
 * - Trend calculations handle edge case where previous value is zero
 * - Component is purely presentational; business logic is in custom hook
 * 
 * @see {@link useDashboardMetrics} for data fetching hook
 * @see {@link MetricCard} for individual metric display component
 * @see {@link LucideIcon} for icon type definition
 */
const DashboardMetrics = () => {
  /**
   * Fetch dashboard metrics from API via React Query
   * 
   * @returns Object with data, loading state, and error state
   */
  const {  data, isLoading, error } = useDashboardMetrics();

  /**
   * Loading state - displays skeleton loaders for each metric card
   * 
   * @returns {JSX.Element} Grid of animated skeleton cards
   * 
   * @remarks
   * - Matches the layout of loaded metric cards for visual consistency
   * - Uses animate-pulse class for subtle loading animation
   * - Renders 4 skeleton cards to match the 4 metrics displayed
   * - Responsive grid: 1 column mobile, 2 tablet, 4 desktop
   */
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5 sm:p-6 h-full animate-pulse">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                {/* Skeleton for metric title */}
                <div className="h-4 w-24 bg-muted rounded" />
                {/* Skeleton for metric value */}
                <div className="h-8 w-32 bg-muted rounded" />
                {/* Skeleton for change indicator */}
                <div className="h-4 w-40 bg-muted rounded" />
              </div>
              {/* Skeleton for icon container */}
              <div className="h-12 w-12 bg-muted rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  /**
   * Error state - displays error message when metrics fail to load
   * 
   * @returns {JSX.Element} Centered error message spanning full grid width
   */
  if (error) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="col-span-4 text-center py-4 text-muted-foreground">
          Error loading dashboard metrics
        </div>
      </div>
    );
  }

  /**
   * Calculates percentage change between current and previous values
   * 
   * @param current - Current period value
   * @param previous - Previous period value for comparison
   * @returns Object with formatted change string and trend direction
   * 
   * @example
   * calculateChange(120, 100) // returns { value: '+20.0%', trend: 'up' }
   * calculateChange(80, 100)  // returns { value: '-20.0%', trend: 'down' }
   * calculateChange(50, 0)    // returns { value: '+0%', trend: 'up' } (edge case)
   * 
   * @remarks
   * - Handles division by zero by returning neutral '+0%' when previous is 0
   * - Formats percentage with one decimal place and sign prefix
   * - Trend is 'up' for positive or zero change, 'down' for negative
   * - Used for all four metrics to ensure consistent change display
   */
  const calculateChange = (current: number, previous: number) => {
    // Edge case: avoid division by zero when previous value is 0
    if (previous === 0) return { value: '+0%', trend: 'up' as const };
    
    // Calculate percentage change: ((current - previous) / previous) * 100
    const change = ((current - previous) / previous) * 100;
    
    return {
      // Format with sign prefix and one decimal place
      value: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
      // Determine trend direction based on change sign
      trend: change >= 0 ? 'up' as const : 'down' as const,
    };
  };

  /**
   * Mock previous month data for change calculations
   * 
   * @remarks
   * - In production, replace with actual historical data from API
   * - Current implementation uses estimated percentages of current values:
   *   - clients: 90% of current (simulating 10% growth)
   *   - sales: 92% of current (simulating 8% growth)
   *   - quotes: 85% of current (simulating 15% growth)
   *   - conversion: 110% of current (simulating 10% decline in rate)
   * - These estimates allow development and testing without backend changes
   */
  const previousMonth = {
    clients: Math.floor((data?.activeClients || 0) * 0.9),
    sales: (data?.monthlySales || 0) * 0.92,
    quotes: Math.floor((data?.totalQuotes || 0) * 0.85),
    conversion: (data?.conversionRate || 0) * 1.1,
  };

  /**
   * Configuration array for the four dashboard metrics
   * 
   * Each object defines the display properties for one metric card.
   * Values are formatted with Panama locale (es-PA) for consistency.
   * Icons are typed as LucideIcon for proper type compatibility.
   * 
   * @type {MetricConfig[]}
   */
  const stats: MetricConfig[] = [
    {
      title: "Active Clients",
      // Format number with Panama locale, no decimals
      value: data?.activeClients.toLocaleString('es-PA') || '0',
      // Calculate and format month-over-month change
      change: calculateChange(data?.activeClients || 0, previousMonth.clients).value,
      trend: calculateChange(data?.activeClients || 0, previousMonth.clients).trend,
      icon: Users,
      color: "primary" as const,
    },
    {
      title: "Monthly Sales",
      // Format currency with Panama locale, USD, no decimals
      value: `$${(data?.monthlySales || 0).toLocaleString('es-PA', { minimumFractionDigits: 0 })}`,
      change: calculateChange(data?.monthlySales || 0, previousMonth.sales).value,
      trend: calculateChange(data?.monthlySales || 0, previousMonth.sales).trend,
      icon: DollarSign,
      color: "accent" as const,
    },
    {
      title: "Quotes",
      value: data?.totalQuotes.toLocaleString('es-PA') || '0',
      change: calculateChange(data?.totalQuotes || 0, previousMonth.quotes).value,
      trend: calculateChange(data?.totalQuotes || 0, previousMonth.quotes).trend,
      icon: FileText,
      color: "info" as const,
    },
    {
      title: "Conversion Rate",
      // Format percentage with one decimal place
      value: `${(data?.conversionRate || 0).toFixed(1)}%`,
      change: calculateChange(data?.conversionRate || 0, previousMonth.conversion).value,
      trend: calculateChange(data?.conversionRate || 0, previousMonth.conversion).trend,
      icon: TrendingUp,
      color: "warning" as const,
    },
  ];

  return (
    /**
     * Responsive grid container for metric cards
     * 
     * - grid-cols-1: Single column on mobile
     * - sm:grid-cols-2: Two columns on tablet (640px+)
     * - lg:grid-cols-4: Four columns on desktop (1024px+)
     * - gap-4 sm:gap-6: Consistent spacing between cards
     * - mb-6: Bottom margin to separate from next dashboard section
     */
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
      {/* 
       * Render each metric card with staggered animation delay
       * 
       * - key: Use title as unique identifier for React reconciliation
       * - {...stat}: Spread metric config props to MetricCard
       * - delay: Stagger entrance animations by 100ms per card
       */}
      {stats.map((stat, index) => (
        <MetricCard key={stat.title} {...stat} delay={index * 0.1} />
      ))}
    </div>
  );
};

export default DashboardMetrics;
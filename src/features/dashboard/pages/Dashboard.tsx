import { motion } from "framer-motion";
import TasksWidget from "../components/TasksWidget";
import CalendarWidget from "../components/CalendarWidget";
import QuickActionsWidget from "../components/QuickActionsWidget";
import DashboardMetrics from "../components/DashboardMetrics";
import { RecentActivity } from "@/features/activity-logs/components/RecentActivity";

/**
 * Dashboard Component
 * 
 * Main dashboard page that aggregates key business metrics and widgets
 * for a comprehensive overview of CRM data. Uses framer-motion for
 * staggered entrance animations on page load.
 * 
 * @component
 * @returns {JSX.Element} Animated dashboard layout with metrics and widgets
 * 
 * @example
 * // Used as a route component
 * <Route path="/dashboard" element={<Dashboard />} />
 * 
 * @remarks
 * - Uses framer-motion for staggered fade-in animations on mount
 * - Container variants control parent animation timing
 * - Item variants control individual section entrance animations
 * - Responsive grid layout: 1 column mobile, 2-3 columns tablet/desktop
 * - Metrics component fetches live data via React Query hooks
 * - Widgets are independent components with their own data fetching
 * - Last updated timestamp uses Spanish locale (es-ES) for display
 * - All widgets are wrapped in motion.div for coordinated animations
 * 
 * @see {@link DashboardMetrics} for KPI metrics component
 * @see {@link TasksWidget} for task management widget
 * @see {@link RecentActivityWidget} for activity feed widget
 * @see {@link CalendarWidget} for calendar events widget
 * @see {@link QuickActionsWidget} for action shortcuts widget
 */
const Dashboard = () => {
  /**
   * Container animation variants for framer-motion
   * 
   * Controls the parent motion.div behavior:
   * - hidden: Initial state with opacity 0
   * - visible: Final state with opacity 1 and staggered children
   * 
   * @type {import('framer-motion').Variants}
   */
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        /**
         * Stagger children animations by 0.1 seconds each
         * Creates sequential fade-in effect for dashboard sections
         */
        staggerChildren: 0.1,
      },
    },
  };

  /**
   * Item animation variants for framer-motion
   * 
   * Controls individual motion.div behavior for dashboard sections:
   * - hidden: Initial state with opacity 0 and 20px vertical offset
   * - visible: Final state with opacity 1 and no offset (slide-up effect)
   * 
   * @type {import('framer-motion').Variants}
   */
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    /**
     * Main dashboard container with framer-motion animations
     * 
     * - variants: Applies containerVariants for staggered animation control
     * - initial: Sets initial animation state to "hidden"
     * - animate: Triggers transition to "visible" state on mount
     * - className: Applies vertical spacing between sections
     */
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* 
       * Page Header Section
       * 
       * Displays dashboard title, welcome message, and last updated timestamp.
       * Responsive layout: stacked on mobile, row on tablet/desktop.
       */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        {/* Title and description */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back. Here is a summary of your business.
          </p>
        </div>
        
        {/* Last updated timestamp with Spanish locale */}
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString("es-ES")}
        </div>
      </motion.div>

      {/* 
       * Metrics Grid Section
       * 
       * Renders DashboardMetrics component which displays key performance
       * indicators (KPIs) such as active clients, monthly sales, quotes,
       * and conversion rate. Wrapped in motion.div for animation.
       */}
      <motion.div variants={itemVariants}>
        <DashboardMetrics />
      </motion.div>

      {/* 
       * Main Content Grid
       * 
       * Responsive grid layout:
       * - Mobile: 1 column
       * - Desktop (lg+): 3 columns with TasksWidget spanning full width
       * 
       * Note: ActivityChart section is currently commented out.
       * Uncomment to restore chart visualization in 2-column span.
       */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 
         * Activity Chart Section (Currently Disabled)
         * 
         * Uncomment the code below to restore the activity chart:
         * 
         * <motion.div variants={itemVariants} className="lg:col-span-2">
         *   <div className="bg-card rounded-lg border p-4 sm:p-6 h-full">
         *     <ActivityChart />
         *   </div>
         * </motion.div>
         */}

        {/* 
         * Tasks Widget Section
         * 
         * Displays pending and recent tasks with completion actions.
         * Wrapped in motion.div and card styling for consistent layout.
         */}
        <motion.div variants={itemVariants}>
          <div className="bg-card rounded-lg border p-4 sm:p-6 h-full">
            <TasksWidget />
          </div>
        </motion.div>
      </div>

      {/* 
       * Secondary Content Grid
       * 
       * Responsive grid layout:
       * - Mobile: 1 column
       * - Tablet (md+): 2 columns
       * - Desktop (lg+): 3 columns
       * 
       * Contains three widgets: Recent Activity, Calendar, and Quick Actions.
       */}
      <div className="grid grid-cols-1 ">
        {/* 
         * Recent Activity Widget
         * 
         * Displays a chronological feed of recent system activities,
         * such as project updates, new quotes, and user actions.
         */}
        <motion.div variants={itemVariants}>
          <div className="bg-card rounded-lg border p-4 sm:p-6 h-full w-full">
             <RecentActivity 
            limit={10}
            showHeader={true}
            allowRefresh={true}
          />
          </div>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 
         * Calendar Widget
         * 
         * Displays upcoming events, deadlines, and scheduled meetings.
         * Integrates with calendar data source for real-time updates.
         */}
        <motion.div variants={itemVariants}>
          <div className="bg-card rounded-lg border p-4 sm:p-6 h-full">
            <CalendarWidget />
          </div>
        </motion.div>

        {/* 
         * Quick Actions Widget
         * 
         * Provides shortcut buttons for common actions such as:
         * - Create new project
         * - Create new quote
         * - Add new task
         * - Import data
         * 
         * Improves user efficiency by reducing navigation steps.
         */}
        <motion.div variants={itemVariants}>
          <div className="bg-card rounded-lg border p-4 sm:p-6 h-full">
            <QuickActionsWidget />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
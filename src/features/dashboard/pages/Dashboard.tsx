import { motion } from "framer-motion";
import {
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  ShoppingCart,
  Target,
} from "lucide-react";
import StatsCard from "../components/StatsCard";
import ActivityChart from "../components/ActivityChart";
import TasksWidget from "../components/TasksWidget";
import RecentActivityWidget from "../components/RecentActivityWidget";
import CalendarWidget from "../components/CalendarWidget";
import QuickActionsWidget from "../components/QuickActionsWidget";
import DashboardMetrics from "../components/DashboardMetrics";

const Dashboard = () => {
  const stats = [
    {
      title: "Clientes Activos",
      value: "2,847",
      change: "+12.5%",
      trend: "up" as const,
      icon: Users,
      color: "primary" as const,
    },
    {
      title: "Ventas del Mes",
      value: "$128,450",
      change: "+8.2%",
      trend: "up" as const,
      icon: DollarSign,
      color: "accent" as const,
    },
    {
      title: "Cotizaciones",
      value: "156",
      change: "+23.1%",
      trend: "up" as const,
      icon: FileText,
      color: "info" as const,
    },
    {
      title: "Tasa de Conversión",
      value: "24.8%",
      change: "-2.4%",
      trend: "down" as const,
      icon: TrendingUp,
      color: "warning" as const,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Bienvenido de vuelta. Aquí está el resumen de tu negocio.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Última actualización: {new Date().toLocaleString("es-ES")}
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div
        variants={itemVariants}
      >
         <DashboardMetrics />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart - Takes 2 columns on large screens */} {/*
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="bg-card rounded-lg border p-4 sm:p-6 h-full">
            <ActivityChart />
          </div>
        </motion.div> 
        */}

        {/* Tasks Widget */}
        <motion.div variants={itemVariants}>
          <div className="bg-card rounded-lg border p-4 sm:p-6 h-full">
            <TasksWidget />
          </div>
        </motion.div>
      </div>

      {/* Secondary Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <div className="bg-card rounded-lg border p-4 sm:p-6 h-full">
            <RecentActivityWidget />
          </div>
        </motion.div>

        {/* Calendar Widget */}
        <motion.div variants={itemVariants}>
          <div className="bg-card rounded-lg border p-4 sm:p-6 h-full">
            <CalendarWidget />
          </div>
        </motion.div>

        {/* Quick Actions */}
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
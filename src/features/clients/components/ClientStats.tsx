// src/features/clients/components/ClientStats.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Briefcase, FileText, FolderKanban, Users } from "lucide-react";
import type { ClientSummary } from "../types/client";
import { Button } from "@/components/ui/button";

interface ClientStatsProps {
    summary: ClientSummary;
    isLoading?: boolean;
    onViewOpportunities?: () => void;
    onViewQuotes?: () => void;
    onViewProjects?: () => void;
    onViewContacts?: () => void;
}

/**
 * ClientStats Component
 * 
 * Displays summary statistics for a client's related entities.
 * Shows counts for opportunities, quotes, projects, and contacts
 * with visual indicators and optional loading state.
 * 
 * @component
 * @param {ClientStatsProps} props - Component configuration props
 * @param {ClientSummary} props.summary - Summary data with entity counts
 * @param {boolean} [props.isLoading] - Loading state indicator
 * @returns {JSX.Element} Grid of stat cards or loading skeleton
 */
export const ClientStats = ({ summary, isLoading = false, onViewOpportunities,
    onViewQuotes,
    onViewProjects,
    onViewContacts, }: ClientStatsProps) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-2">
                            <div className="h-4 bg-muted rounded w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-muted rounded w-1/4" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const stats = [
        {
            label: "Oportunidades",
            value: summary.opportunitiesCount,
            icon: Briefcase,
            color: "text-blue-600",
            bgColor: "bg-blue-500/10",
            onClick: onViewOpportunities,
        },
        {
            label: "Cotizaciones",
            value: summary.quotesCount,
            icon: FileText,
            color: "text-green-600",
            bgColor: "bg-green-500/10",
            onClick: onViewQuotes,
        },
        {
            label: "Proyectos",
            value: summary.projectsCount,
            icon: FolderKanban,
            color: "text-purple-600",
            bgColor: "bg-purple-500/10",
            onClick: onViewProjects,
        },
        {
            label: "Contactos",
            value: summary.contactsCount,
            icon: Users,
            color: "text-orange-600",
            bgColor: "bg-orange-500/10",
            onClick: onViewContacts,
        },
    ];


    return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card 
          key={stat.label} 
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={stat.onClick}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.value > 0 && stat.onClick && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 h-auto py-1 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  stat.onClick?.();
                }}
              >
                Ver lista
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ClientStats;
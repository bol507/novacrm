import { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Project } from '../types/projects';

/**
 * Return type for useProjectCalculations hook
 */
export interface ProjectCalculations {
  /** Target budget as number */
  targetBudget: number;
  /** ITBMS tax amount (7% of budget) */
  itbms: number;
  /** Total budget including tax */
  totalWithTax: number;
  /** Currency formatter function */
  formatCurrency: (value: number) => string;
  /** Date formatter function */
  formatDate: (dateString: string | null) => string;
  /** Days remaining calculator */
  getDaysRemaining: (endDate: string | null) => number | null;
  /** Assigned user name with special handling for "All users" */
  assignedUserName: string;
}

/**
 * Custom hook for project financial and date calculations
 * 
 * @param project - Project object or null/undefined
 * @returns Calculated values and formatting utilities
 * 
 * @example
 * const { targetBudget, itbms, formatCurrency, formatDate } = useProjectCalculations(project);
 */
export const useProjectCalculations = (project: Project | null | undefined): ProjectCalculations => {
  return useMemo(() => {
    if (!project) {
      return {
        targetBudget: 0,
        itbms: 0,
        totalWithTax: 0,
        formatCurrency: () => '',
        formatDate: () => '-',
        getDaysRemaining: () => null,
        assignedUserName: 'Unassigned',
      };
    }

    // Calculate budget values with ITBMS tax (7% Panama)
    const targetBudget = project.targetbudget ? parseFloat(project.targetbudget) : 0;
    const itbms = targetBudget * 0.07;
    const totalWithTax = targetBudget + itbms;

    // Currency formatter for Panama (USD, no decimals)
    const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat('es-PA', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    };

    // Date formatter with Spanish locale
    const formatDate = (dateString: string | null): string => {
      if (!dateString) return '-';
      try {
        return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
      } catch {
        return '-';
      }
    };

    // Calculate remaining days until end date
    const getDaysRemaining = (endDate: string | null): number | null => {
      if (!endDate) return null;
      const end = new Date(endDate);
      const today = new Date();
      const diffTime = end.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Handle special case: assigned to "All users" (ID=2)
    const isAssignedToAll = project.assigned_user_id === 2;
    const assignedUserName = isAssignedToAll
      ? 'All users'
      : project.assigned_user_name || 'Unassigned';

    return {
      targetBudget,
      itbms,
      totalWithTax,
      formatCurrency,
      formatDate,
      getDaysRemaining,
      assignedUserName,
    };
  }, [project]);
};
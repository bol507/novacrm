import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Custom hooks
import { useProjectDetail } from '../hooks/useProjectDetail';
import { useProjectCalculations } from '../hooks/useProjectCalculations';
import { useProjectActions } from '../hooks/useProjectActions';

// Presentational components
import {
  ProjectDetailHeader,
  ProjectInfoCards,
  ProjectFinancialSummary,
  ProjectTabsNavigation,
  ProjectOverviewTab,
  ProjectAttachmentsTab,
  ProjectActionButtons,
  ProjectLoadingSkeleton,
  ProjectErrorState,
  ProjectNotFoundState,
} from '../components/ProjectDetail';

/**
 * ProjectDetailPage Container Component
 * 
 * Orchestrates data fetching, state management, and composition of presentational components
 * for displaying project details. Handles loading, error, and empty states.
 * 
 * @component
 * @returns {JSX.Element} Complete project detail page
 * 
 * @remarks
 * Responsibilities:
 * - Fetches project data via useProjectDetail hook
 * - Manages tab state for overview/attachments/comments
 * - Composes presentational components with calculated data
 * - Handles navigation and user interactions
 * - Provides error boundary for graceful error handling
 * 
 * @see {@link useProjectDetail} for data fetching
 * @see {@link useProjectCalculations} for financial/date calculations
 * @see {@link useProjectActions} for action handlers
 */
const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  // Data fetching
  const { data: project, isLoading, error, refetch } = useProjectDetail(projectId);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('overview');
  
  // Custom hooks
  const calculations = useProjectCalculations(project);
  const actions = useProjectActions(projectId);

  // Loading state
  if (isLoading) {
    return <ProjectLoadingSkeleton />;
  }

  // Error state
  if (error) {
    return <ProjectErrorState message={error.message} onBack={() => navigate(-1)} />;
  }

  // Not found state
  if (!project) {
    return <ProjectNotFoundState onBack={() => navigate('/dashboard/projects')} />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          {/* Header Section */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            <ProjectDetailHeader
              projectname={project.projectname}
              projectNo={project.project_no}
              projectstatus={project.projectstatus || 'In Progress'}
              onBack={() => navigate(-1)}
            />

            {/* Info Cards */}
            <ProjectInfoCards
              accountName={project.account_name}
              accountId={project.linktoaccountscontacts}
              assignedUserName={calculations.assignedUserName}
              startDate={project.startdate}
              targetEndDate={project.targetenddate}
              formatDate={calculations.formatDate}
              getDaysRemaining={calculations.getDaysRemaining}
            />

            {/* Financial Summary */}
            <ProjectFinancialSummary
              targetBudget={calculations.targetBudget}
              itbms={calculations.itbms}
              totalWithTax={calculations.totalWithTax}
              progress={project.progress || '0'}
              formatCurrency={calculations.formatCurrency}
            />
          </div>

          {/* Tabbed Content Section */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* Tab Navigation */}
              <ProjectTabsNavigation />

              {/* Overview Tab */}
              <TabsContent value="overview">
                <ProjectOverviewTab
                  projectid={parseInt(projectId || '0')}
                  description={project.description}
                  totalTasks={project.totalTasks}
                  completedTasks={project.completedTasks}
                  projectpriority={project.projectpriority}
                  projecttype={project.projecttype}
                  hits={project.hits}
                  projectstatus={project.projectstatus || 'In Progress'}
                  actualenddate={project.actualenddate}
                  formatDate={calculations.formatDate}
                />
              </TabsContent>

              {/* Attachments Tab */}
              <TabsContent value="attachments">
                <ProjectAttachmentsTab
                  projectId={parseInt(projectId || '0')}
                  onFileClick={(url) => window.open(url, '_blank')}
                />
              </TabsContent>

              
            </Tabs>

            {/* Sticky Action Buttons */}
            <ProjectActionButtons
              project={project}
              onEdit={() => actions.handleEditProject(projectId || '')}
              onDelete={() => actions.handleDeleteClick(project)}
              onComplete={() => actions.handleCompleteProject(project, refetch)}
              isDeleting={actions.isDeleting}
              isUpdating={actions.isUpdating}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ProjectDetailPage;
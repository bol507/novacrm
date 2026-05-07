import {  useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  ProjectOverviewTab,
  ProjectActionButtons,
  ProjectLoadingSkeleton,
  ProjectErrorState,
  ProjectNotFoundState,
  ProjectAttachmentsTab,
} from '../components/ProjectDetail';
import { ProjectModuleNav, type ModuleId } from '../components/ProjectModuleNav';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { ProjectProcurementTab } from '@/features/procurements/components/tabs/ProjectProcurementTab';
import ProjectPurchaseOrdersTab from '@/features/procurements/components/tabs/ProjectPurchaseOrdersTab';

/**
 * ProjectDetailPage Container Component
 *
 * Orchestrates data fetching, state management, and composition of presentational components
 * for displaying project details. Handles loading, error, and empty states.
 *
 * @component
 * @returns Complete project detail page
 */
const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading, error, refetch } = useProjectDetail(projectId);

  const [currentModule, setCurrentModule] = useState<ModuleId>('overview');
  const calculations = useProjectCalculations(project);
  const actions = useProjectActions(projectId);
  const { hasRoleByName } = useAuth();

  const isModuleVisible = (moduleId: ModuleId) => {
    if (['procurement', 'production'].includes(moduleId)) {
      return hasRoleByName(['Producción', 'Compras', 'Admin']);
    }
    return true;
  };

  if (isLoading) return <ProjectLoadingSkeleton />;
  if (error) return <ProjectErrorState message={error.message} onBack={() => navigate(-1)} />;
  if (!project) return <ProjectNotFoundState onBack={() => navigate('/dashboard/projects')} />;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <ProjectDetailHeader
              projectname={project.projectname}
              projectNo={project.project_no}
              projectstatus={project.projectstatus || 'In Progress'}
              onBack={() => navigate(-1)}
            />

            <ProjectInfoCards
              accountName={project.account_name}
              accountId={project.linktoaccountscontacts}
              assignedUserName={calculations.assignedUserName}
              startDate={project.startdate}
              targetEndDate={project.targetenddate}
              formatDate={calculations.formatDate}
              getDaysRemaining={calculations.getDaysRemaining}
            />

            <ProjectFinancialSummary
              targetBudget={calculations.targetBudget}
              itbms={calculations.itbms}
              totalWithTax={calculations.totalWithTax}
              progress={project.progress || '0'}
              formatCurrency={calculations.formatCurrency}
            />
          </div>

          <div className="space-y-4 sm:space-y-6">
            <ProjectModuleNav
              currentModule={currentModule}
              onModuleChange={setCurrentModule}
              isModuleVisible={isModuleVisible}
            />

            <div className="min-h-[300px] sm:min-h-[400px]">
              {currentModule === 'overview' && (
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
              )}
              {currentModule === 'attachments' && (
                <ProjectAttachmentsTab
                  projectId={parseInt(projectId || '0')}
                  onFileClick={(url) => window.open(url, '_blank')}
                />
              )}
              {currentModule === 'procurement' && (
                <ProjectProcurementTab
                  projectId={parseInt(projectId || '0')}
                />
              )}
              {currentModule === 'purchases' && (
                <ProjectPurchaseOrdersTab
                  projectId={parseInt(projectId || '0')}
                />
              )}
              {!['overview', 'attachments', 'procurement', 'purchases'].includes(currentModule) && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Module "{currentModule}" under development</p>
                </div>
              )}
            </div>

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
import { ExpandableText } from '@/components/ExpandableText';
import { ProjectStatusBadge } from '../../../components/ProjectStatusBadge';
import { ListCheck, TrendingUp, Folder } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CommentsSection } from '@/features/comments/components/CommentsSection';
import { useAuth } from '@/features/auth/hooks/use-auth';

/**
 * Props for ProjectOverviewTab component
 */
export interface ProjectOverviewTabProps {
  projectid: number;
  /** Project description text */
  description?: string | null;
  /** Total tasks count */
  totalTasks?: number;
  /** Completed tasks count */
  completedTasks?: number;
  /** Project priority */
  projectpriority?: string;
  /** Project type */
  projecttype?: string;
  /** Project hits count */
  hits?: number;
  /** Project status */
  projectstatus: string;
  /** Actual end date */
  actualenddate?: string | null;
  /** Date formatter function */
  formatDate: (date: string | null) => string;
}

/**
 * ProjectOverviewTab Component
 * 
 * Displays the overview tab content: description, tasks summary, metrics, and current status.
 * Uses composition with Card components for organized layout.
 * 
 * @component
 * @param {ProjectOverviewTabProps} props - Component props
 * @param {string | null} [props.description] - Project description
 * @param {number} [props.totalTasks] - Total tasks count
 * @param {number} [props.completedTasks] - Completed tasks count
 * @param {string} [props.projectpriority] - Project priority
 * @param {string} [props.projecttype] - Project type
 * @param {number} [props.hits] - Hits count
 * @param {string} props.projectstatus - Project status
 * @param {string | null} [props.actualenddate] - Actual end date
 * @param {function} props.formatDate - Date formatter
 * 
 * @returns {JSX.Element} Overview tab content
 */
export const ProjectOverviewTab = ({
  projectid,
  description,
  totalTasks,
  completedTasks,
  projectpriority,
  projecttype,
  hits,
  projectstatus,
  actualenddate,
  formatDate,
}: ProjectOverviewTabProps) => {
  const { user, loading: authLoading } = useAuth();
  const pendingTasks = (totalTasks || 0) - (completedTasks || 0);
  const currentUserId = user?.id ?? 0;
  

  if (authLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Card className="p-6">
          <div className="h-6 w-32 bg-muted rounded mb-4" />
          <div className="h-4 w-full bg-muted rounded" />
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/4 bg-muted rounded" />
                    <div className="h-4 w-full bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Description */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Description</h2>
        <ExpandableText
          text={description || 'No description'}
          maxLines={3}
          className="text-lg"
          expandedClassName="text-lg whitespace-pre-line"
        />
      </Card>

      <Card>
        <CardContent className="p-6">
          <CommentsSection
            module="Project"
            relatedId={projectid}
            currentUserId={currentUserId}
            initialLimit={5} 
          />
        </CardContent>
      </Card>

      {/* Additional Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tasks Summary */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ListCheck className="h-5 w-5" />
            Tasks
          </h3>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Total tasks</p>
              <p className="text-2xl font-bold">{totalTasks || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {completedTasks || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {pendingTasks}
              </p>
            </div>
          </div>
        </Card>

        {/* Project Metrics */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Metrics
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Priority</p>
              <p className="text-lg font-semibold">
                {projectpriority || 'Medium'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="text-lg font-semibold">
                {projecttype || 'General'}
              </p>
            </div>
            {hits !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground">Hits</p>
                <p className="text-lg font-semibold">{hits}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Current Status */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Current status
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <ProjectStatusBadge status={projectstatus || 'in progress'} />
            </div>
            {actualenddate && (
              <div>
                <p className="text-sm text-muted-foreground">Completion date</p>
                <p className="text-lg font-semibold">
                  {formatDate(actualenddate)}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
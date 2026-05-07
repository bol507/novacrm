import { ExpandableText } from '@/components/ExpandableText';
import { ProjectStatusBadge } from '../../../components/ProjectStatusBadge';
import { ListCheck, TrendingUp, Folder } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CommentsSection } from '@/features/comments/components/CommentsSection';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { InfoRow } from '@/components/info-row';

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
    <div className="space-y-4 sm:space-y-6">

      {/* Description Card */}
      <Card className="p-4 sm:p-6 w-full">
        <h2 className="text-base sm:text-lg font-semibold mb-3 text-foreground">Description</h2>
        <ExpandableText
          text={description || 'No description available'}
          maxLines={3}
          className="text-sm sm:text-base leading-relaxed text-muted-foreground"
          expandedClassName="text-sm sm:text-base whitespace-pre-line leading-relaxed text-muted-foreground"
        />
      </Card>

      {/* Comments Section */}
      <Card className="p-4 sm:p-6 w-full">
        <CommentsSection
          module="Project"
          relatedId={projectid}
          currentUserId={currentUserId}
          initialLimit={5}
        />
      </Card>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">

        {/* Tasks Summary */}
        <Card className="p-4 sm:p-6 h-full flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-3 flex items-center gap-2 text-foreground">
              <ListCheck className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              Tasks
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <InfoRow label="Total" value={totalTasks || 0} />
              <InfoRow label="Completed" value={completedTasks || 0} valueClass="text-green-600" />
              <InfoRow label="Pending" value={pendingTasks || 0} valueClass="text-yellow-600" />
            </div>
          </div>
        </Card>

        {/* Project Metrics */}
        <Card className="p-4 sm:p-6 h-full flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-3 flex items-center gap-2 text-foreground">
              <TrendingUp className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              Metrics
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <InfoRow label="Priority" value={projectpriority || 'Medium'} />
              <InfoRow label="Type" value={projecttype || 'General'} />
              {hits !== undefined && <InfoRow label="Hits" value={hits} />}
            </div>
          </div>
        </Card>

        {/* Current Status */}
        <Card className="p-4 sm:p-6 h-full flex flex-col justify-between">
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2 text-foreground">
              <Folder className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              Current Status
            </h3>

            <div className="space-y-2 sm:space-y-3">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">Status</p>
                <div className="w-fit">
                  <ProjectStatusBadge status={projectstatus || 'in progress'} />
                </div>
              </div>

              {actualenddate && (
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground">Completion Date</p>
                  <p className="text-sm sm:text-base font-medium break-words">
                    {formatDate(actualenddate)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};
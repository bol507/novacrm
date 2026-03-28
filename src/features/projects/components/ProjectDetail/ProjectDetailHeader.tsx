import { Button } from '@/components/ui/button';
import { ProjectStatusBadge } from '../../components/ProjectStatusBadge';

/**
 * Props for ProjectDetailHeader component
 */
export interface ProjectDetailHeaderProps {
  /** Project name/title */
  projectname: string;
  /** Project number for display */
  projectNo: string;
  /** Project status for badge */
  projectstatus: string;
  /** Callback for back navigation */
  onBack: () => void;
}

/**
 * ProjectDetailHeader Component
 * 
 * Displays the project title, number, status badge, and back button.
 * 
 * @component
 * @param {ProjectDetailHeaderProps} props - Component props
 * @param {string} props.projectname - Project name/title
 * @param {string} props.projectNo - Project number
 * @param {string} props.projectstatus - Project status for badge
 * @param {function} props.onBack - Back navigation callback
 * 
 * @returns {JSX.Element} Project header section
 */
export const ProjectDetailHeader = ({ 
  projectname, 
  projectNo, 
  projectstatus, 
  onBack 
}: ProjectDetailHeaderProps) => {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-foreground line-clamp-1">
        {projectname}
      </h1>
      <p className="text-muted-foreground text-lg">
        Project #{projectNo}
      </p>

      <div className="flex flex-col sm:items-end gap-4">
        <div className="flex items-center gap-3">
          <ProjectStatusBadge status={projectstatus || 'in progress'} />
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            ← Back
          </Button>
        </div>
      </div>
    </div>
  );
};
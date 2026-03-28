import { Button } from '@/components/ui/button';

/**
 * Props for ProjectNotFoundState component
 */
export interface ProjectNotFoundStateProps {
  /** Callback for navigation back to projects list */
  onBack: () => void;
}

/**
 * ProjectNotFoundState Component
 * 
 * Displays message when project is not found or has been deleted.
 * 
 * @component
 * @param {ProjectNotFoundStateProps} props - Component props
 * @param {function} props.onBack - Back navigation callback
 * 
 * @returns {JSX.Element} Not found state display
 */
export const ProjectNotFoundState = ({ onBack }: ProjectNotFoundStateProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Project not found</h2>
        <p className="text-muted-foreground mb-4">The project you are looking for does not exist or has been deleted.</p>
        <Button onClick={onBack}>Back to projects</Button>
      </div>
    </div>
  );
};
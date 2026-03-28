import { Button } from '@/components/ui/button';

/**
 * Props for ProjectErrorState component
 */
export interface ProjectErrorStateProps {
  /** Error message to display */
  message: string;
  /** Callback for retry/back navigation */
  onBack: () => void;
}

/**
 * ProjectErrorState Component
 * 
 * Displays error message with retry button when data fetching fails.
 * 
 * @component
 * @param {ProjectErrorStateProps} props - Component props
 * @param {string} props.message - Error message
 * @param {function} props.onBack - Back navigation callback
 * 
 * @returns {JSX.Element} Error state display
 */
export const ProjectErrorState = ({ message, onBack }: ProjectErrorStateProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center max-w-md w-full">
        <h2 className="text-xl font-bold text-destructive mb-2">Error loading project</h2>
        <p className="text-muted-foreground mb-4">{message}</p>
        <Button onClick={onBack}>Back to projects</Button>
      </div>
    </div>
  );
};
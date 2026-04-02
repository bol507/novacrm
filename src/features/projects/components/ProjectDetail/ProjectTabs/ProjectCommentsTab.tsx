import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { CommentsSection } from '@/features/comments/components/CommentsSection';

/**
 * Props for ProjectCommentsTab component
 */
export interface ProjectCommentsTabProps {
  /** Project ID for API calls */
  projectId: number;
}

/**
 * ProjectCommentsTab Component
 * 
 * Displays the comments tab content using the shared CommentsSection component.
 * 
 * @component
 * @param {ProjectCommentsTabProps} props - Component props
 * @param {number} props.projectId - Project ID for API calls
 * 
 * @returns {JSX.Element} Comments tab content
 */
export const ProjectCommentsTab = ({ projectId }: ProjectCommentsTabProps) => {
  const { user, loading: authLoading } = useAuth();
  const currentUserId = user?.data?.id ?? 0;

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
    <CommentsSection 
      module="Project" 
      relatedId={projectId} 
      currentUserId={currentUserId}
      initialLimit={5}
    />
  );
};
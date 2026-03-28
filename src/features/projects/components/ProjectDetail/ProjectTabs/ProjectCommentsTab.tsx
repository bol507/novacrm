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
  return (
    <CommentsSection 
      module="Project" 
      relatedId={projectId} 
    />
  );
};
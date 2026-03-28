
import { AttachmentsList } from '@/features/attachments/components/AttachmentsList';
import { FileUploader } from '@/features/attachments/components/FileUploader';


/**
 * Props for ProjectAttachmentsTab component
 */
export interface ProjectAttachmentsTabProps {
  /** Project ID for API calls */
  projectId: number;
  /** Callback when file is clicked for preview */
  onFileClick?: (url: string) => void;
}

/**
 * ProjectAttachmentsTab Component
 * 
 * Displays the attachments tab content: file uploader and attachments list.
 * Uses composition with existing attachment components.
 * 
 * @component
 * @param {ProjectAttachmentsTabProps} props - Component props
 * @param {number} props.projectId - Project ID for API calls
 * @param {function} [props.onFileClick] - File click callback for preview
 * 
 * @returns {JSX.Element} Attachments tab content
 */
export const ProjectAttachmentsTab = ({ 
  projectId, 
  onFileClick 
}: ProjectAttachmentsTabProps) => {
  return (
    <div className="space-y-6">
      <FileUploader 
        module="Project" 
        recordId={projectId}
        maxFiles={10}
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
      />

      <AttachmentsList 
        module="Project" 
        recordId={projectId}
        onFileClick={onFileClick || ((url) => window.open(url, '_blank'))}
      />
    </div>
  );
};
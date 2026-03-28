import { Button } from "@/components/ui/button";
import { DownloadIcon, FileTextIcon, Loader2 } from "lucide-react";

/**
 * Props for QuotePdfActions component
 */
export interface QuotePdfActionsProps {
  /** Quote ID for PDF operations */
  quoteId: number;
  /** Quote number for PDF operations */
  quoteNo: string;
  /** Callback for PDF preview action */
  onPreview: (quoteId: number) => Promise<void>;
  /** Callback for PDF download action */
  onDownload: (quoteId: number, quoteNo: string) => Promise<void>;
  /** Loading state for PDF operations */
  isLoading: boolean;
}

/**
 * QuotePdfActions Component
 * 
 * Displays buttons for previewing and downloading the quote as PDF.
 * Buttons are disabled during async operations to prevent duplicate requests.
 * 
 * @component
 * @param {QuotePdfActionsProps} props - Component props
 * @param {number} props.quoteId - Quote identifier
 * @param {function} props.onPreview - PDF preview callback
 * @param {function} props.onDownload - PDF download callback
 * @param {boolean} props.isLoading - Loading state for buttons
 * 
 * @returns {JSX.Element} PDF action buttons
 * 
 * @example
 * <QuotePdfActions 
 *   quoteId={123}
 *   onPreview={handlePreviewPDF}
 *   onDownload={handleDownloadPDF}
 *   isLoading={isPdfLoading}
 * />
 */
export const QuotePdfActions = ({ 
  quoteId,
  quoteNo,
  onPreview, 
  onDownload, 
  isLoading 
}: QuotePdfActionsProps) => {
  return (
    <div className="flex gap-3 mb-6">
      <Button
        variant="outline"
        onClick={() => onPreview(quoteId)}
        disabled={isLoading}
        className="gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <FileTextIcon className="h-5 w-5" />
        )}
        Preview PDF
      </Button>
      <Button
        onClick={() => onDownload(quoteId, quoteNo)}
        disabled={isLoading}
        className="gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <DownloadIcon className="h-5 w-5" />
        )}
        Download PDF
      </Button>
    </div>
  );
};
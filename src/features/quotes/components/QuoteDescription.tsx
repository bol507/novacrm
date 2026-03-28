import { ExpandableText } from "@/components/ExpandableText";

/**
 * Props for QuoteDescription component
 */
export interface QuoteDescriptionProps {
  /** Quote description text (may be empty) */
  description: string;
}

/**
 * QuoteDescription Component
 * 
 * Displays the quote description with expandable text functionality.
 * Shows up to 3 lines initially, with option to expand for full content.
 * 
 * @component
 * @param {QuoteDescriptionProps} props - Component props
 * @param {string} props.description - Quote description text
 * 
 * @returns {JSX.Element} Description section with expandable text
 * 
 * @example
 * <QuoteDescription 
 *   description="This quote includes development of a responsive website with CMS integration..."
 * />
 */
export const QuoteDescription = ({ description }: QuoteDescriptionProps) => {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-2xl font-bold mb-4">Description</h2>
      <ExpandableText
        text={description || ''}
        maxLines={3}
        className="text-lg"
        expandedClassName="text-lg whitespace-pre-line"
      />
    </div>
  );
};
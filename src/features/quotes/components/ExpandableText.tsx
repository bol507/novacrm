import { useState } from "react";

interface ExpandableTextProps {
  text: string;
  maxLines?: number;
  className?: string;
  expandedClassName?: string;
}

export const ExpandableText = ({ 
  text, 
  maxLines = 2,
  className = "text-muted-foreground",
  expandedClassName = "text-muted-foreground"
}: ExpandableTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text || text.trim() === '') return null;

  return (
    <div 
      className={`cursor-pointer ${isExpanded ? expandedClassName : className}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {isExpanded ? (
        <div>{text}</div>
      ) : (
        <div 
          className="line-clamp-2"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: maxLines,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};
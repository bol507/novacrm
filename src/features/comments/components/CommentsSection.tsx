import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2, MessageSquare, Users, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import type { ProjectComment } from "@/features/comments/types/comment";
import { toast } from "sonner";
import { selectComments, useComments, useCreateComment } from "../hooks/use-comment";

interface CommentsSectionProps {
  /** Module name (e.g., 'project', 'task') */
  module: string;
  /** ID of the record to display comments for */
  relatedId: number;
  /** Initial number of comments to display before "Show All" button (default: 5) */
  initialLimit?: number;
}

/**
 * Component for displaying and adding comments on a record.
 *
 * Features:
 * - Displays comments in chronological order with user avatars
 * - Form for adding new comments with character limit (5000)
 * - Loading states with skeleton placeholders
 * - Error handling with retry option
 * - "Show All" / "Show Less" toggle for limiting initial display
 * - Special handling for "All Users" group (userId=2)
 * - Smooth height transition animations
 * - Responsive design with truncation for long content
 *
 * @component
 * @param props - Component props
 * @param props.module - Module name (e.g., 'project', 'task')
 * @param props.relatedId - ID of the record to display comments for
 * @param props.initialLimit - Initial number of comments to display before "Show All" button (default: 5)
 * @returns The rendered comments section
 *
 * @example
 * // Basic usage
 * <CommentsSection module="project" relatedId={123} />
 *
 * @example
 * // With custom initial limit
 * <CommentsSection
 *   module="project"
 *   relatedId={123}
 *   initialLimit={10}
 * />
 */
export const CommentsSection = ({ 
  module, 
  relatedId, 
  initialLimit = 5
}: CommentsSectionProps) => {
  const [commentContent, setCommentContent] = useState("");
  const [showAll, setShowAll] = useState(false);
  
  const { data, isLoading, error } = useComments(module, relatedId);
  const createCommentMutation = useCreateComment(module, relatedId);
  const comments: ProjectComment[] = selectComments(data);
  
  const MAX_LENGTH = 5000;

  const displayedComments = showAll ? comments : (comments?.slice(0, initialLimit) || []);
  const hasMoreComments = !showAll && (comments?.length || 0) > (initialLimit || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    if (commentContent.length > MAX_LENGTH) {
      toast.error(`Comment cannot exceed ${MAX_LENGTH} characters`);
      return;
    }

    try {
      await createCommentMutation.mutateAsync({
        content: commentContent.trim(),  
      });
      setCommentContent("");
    } catch (err) {
      console.error('Error creating comment:', err);
    }
  };

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
        <p className="text-destructive mb-2">Error loading comments</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_LENGTH) setCommentContent(value);
  };

  const getAuthorName = (comment: ProjectComment): string => {
    if (comment.userId === 2) return "All Users";
    return comment.userName || comment.authorName || 'User';
  };

  const getAvatarFallback = (comment: ProjectComment): string => {
    if (comment.userId === 2) return "A";
    const name = comment.userName || comment.authorName || '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments ({comments?.length || 0})
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Textarea
            placeholder="Write a comment..."
            value={commentContent}
            onChange={handleInputChange}
            className="min-h-[100px] resize-none"
            disabled={createCommentMutation.isPending}
          />
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            {commentContent.length}/{MAX_LENGTH}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCommentContent("")}
            disabled={!commentContent.trim() || createCommentMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createCommentMutation.isPending || !commentContent.trim()}
          >
            {createCommentMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
            ) : (
              <><Send className="h-4 w-4 mr-2" /> Send comment</>
            )}
          </Button>
        </div>
      </form>

      <div 
        className={`space-y-4 transition-all duration-300 ease-in-out ${
          showAll ? 'max-h-none opacity-100' : 'max-h-[800px] opacity-95'
        }`}
      >
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/4 bg-muted rounded" />
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-1/2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedComments.length === 0 ? (
          <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2 opacity-50" />
            <p className="text-muted-foreground">No comments yet</p>
          </div>
        ) : (
          <>
            {displayedComments.map((comment) => (
              <div 
                key={comment.id} 
                className="flex gap-4 p-4 bg-card rounded-lg border border-border"
              >
                <Avatar className="w-10 h-10">
                  <AvatarFallback className={comment.userId === 2 ? "bg-blue-100 text-blue-800" : ""}>
                    {comment.userId === 2 ? <Users className="h-4 w-4" /> : getAvatarFallback(comment)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">
                        {getAuthorName(comment)}
                        {comment.userId === 2 && <span className="ml-2 text-xs text-muted-foreground">(Group)</span>}
                      </p>
                      {comment.userEmail && (
                        <p className="text-xs text-muted-foreground truncate">{comment.userEmail}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {comment.createdAt ? format(new Date(comment.createdAt), 'MMM dd HH:mm', { locale: es }) : '-'}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words text-foreground/90">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}

            {hasMoreComments && (
              <Button
                variant="outline"
                onClick={() => setShowAll(true)}
                className="w-full mt-2"
              >
                View all comments ({comments?.length})
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            )}

            {showAll && comments && comments.length > initialLimit && (
              <Button
                variant="outline"
                onClick={() => setShowAll(false)}
                className="w-full mt-2"
              >
                Show only last {initialLimit}
                <ChevronUp className="h-4 w-4 ml-2" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
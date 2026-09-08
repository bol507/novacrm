import { useState, useCallback, useMemo } from "react";

import type { ProjectComment } from "@/features/comments/types/comment";
import { toast } from "sonner";
import { useUpdateComment } from "../hooks/use-update-comment";
import { useComments } from "../hooks/use-comments";
import { useCreateComment } from "../hooks/use-create-comment";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronUp, CornerDownRight, Info, Loader2, Loader2Icon, MessageSquare, PencilIcon, Send, Users, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface CommentsSectionProps {
  /** Module name (e.g., 'project', 'task') */
  module: string;
  /** ID of the record to display comments for */
  relatedId: number;
  /** ID of the currently authenticated user (for edit permissions) */
  currentUserId: number;
  /** Initial number of comments to display before "Show All" button (default: 5) */
  initialLimit?: number;
}

/**
 * Component for displaying and managing comments on a record.
 *
 * Features:
 * - Displays comments in reverse chronological order (newest first) with user avatars
 * - Form for adding new comments with character limit (5000)
 * - Threaded replies (1 level): each top-level comment has a Reply action
 *   with an inline form; replies are shown nested under their parent
 * - Inline editing for comment authors and admins with optional edit reason
 * - Loading states with skeleton placeholders
 * - Error handling with retry option
 * - "Show All" / "Show Less" toggle for limiting initial display
 * - Special handling for "All Users" group (userId=2)
 * - Responsive design with truncation for long content
 * - Audit trail display for edited comments
 *
 * @component
 * @param props - Component props
 * @param props.module - Module name (e.g., 'project', 'task')
 * @param props.relatedId - ID of the record to display comments for
 * @param props.currentUserId - ID of the currently authenticated user
 * @param props.initialLimit - Initial number of comments to display (default: 5)
 * @returns The rendered comments section
 *
 * @example
 * // Basic usage
 * <CommentsSection module="project" relatedId={123} currentUserId={5} />
 *
 * @example
 * // With custom initial limit
 * <CommentsSection
 *   module="project"
 *   relatedId={123}
 *   currentUserId={5}
 *   initialLimit={10}
 * />
 */
export const CommentsSection = ({
  module,
  relatedId,
  currentUserId,
  initialLimit = 5
}: CommentsSectionProps) => {
  const [commentContent, setCommentContent] = useState("");
  const [showAll, setShowAll] = useState(false);

  // Reply state (threading — replies can only target top-level comments)
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // Edit state management
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editReason, setEditReason] = useState("");

  // Fetch comments with newest first
  const { data: commentsResponse, isLoading, error } = useComments(module, relatedId, {
    perPage: 50,
    orderBy: 'createdtime',
    sortOrder: 'DESC',
  });

  const createCommentMutation = useCreateComment(module, relatedId);
  const updateCommentMutation = useUpdateComment(module, relatedId);

  const comments: ProjectComment[] = useMemo(() => {
    if (!commentsResponse) return [];
    if (Array.isArray(commentsResponse)) return commentsResponse;
    if (Array.isArray(commentsResponse.data)) return commentsResponse.data;
    return [];
  }, [commentsResponse]);


  const MAX_LENGTH = 5000;

  // Group comments into threads: top-level comments + their replies,
  // with orphan replies (parent not loaded on this page) kept flat.
  const threadGroups = useMemo(() => {
    const roots: ProjectComment[] = [];
    const replyMap = new Map<number, ProjectComment[]>();
    const orphans: ProjectComment[] = [];

    for (const comment of comments) {
      const parentId = comment.parentCommentId ?? null;
      if (parentId === null) {
        roots.push(comment);
        continue;
      }

      const parentExists = comments.some((c) => c.id === parentId);
      if (parentExists) {
        const replies = replyMap.get(parentId) ?? [];
        replies.push(comment);
        replyMap.set(parentId, replies);
      } else {
        orphans.push(comment);
      }
    }

    return { roots, replyMap, orphans };
  }, [comments]);

  const displayedRoots = useMemo(() => {
    const limit = initialLimit || 5;
    return showAll ? threadGroups.roots : threadGroups.roots.slice(0, limit);
  }, [showAll, threadGroups.roots, initialLimit]);

  const hasMoreComments = !showAll && (threadGroups.roots?.length || 0) > (initialLimit || 0);

  // Handle new comment submission
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

  // Handle reply submission (threaded reply to a top-level comment)
  const handleReplySubmit = async () => {
    if (!replyingToId && replyingToId !== 0) return;
    const content = replyContent.trim();
    if (!content) return;

    if (content.length > MAX_LENGTH) {
      toast.error(`Comment cannot exceed ${MAX_LENGTH} characters`);
      return;
    }

    try {
      await createCommentMutation.mutateAsync({
        content,
        parentCommentId: replyingToId,
      });
      setReplyingToId(null);
      setReplyContent("");
    } catch (err) {
      console.error('Error creating reply:', err);
    }
  };

  const handleEditClick = useCallback((comment: ProjectComment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
    setEditReason("");
  }, []);

  const handleEditCancel = useCallback(() => {
    setEditingCommentId(null);
    setEditContent("");
    setEditReason("");
  }, []);

  const handleEditSubmit = useCallback(async (commentId: number) => {
    if (!editContent.trim()) {
      toast.error('Comment content cannot be empty');
      return;
    }

    try {
      await updateCommentMutation.mutateAsync({
        commentId: commentId,
        data: {
          content: editContent.trim(),
          reasonToEdit: editReason.trim() || undefined,
        },
      });

      // Reset edit state on success
      setEditingCommentId(null);
      setEditContent("");
      setEditReason("");
    } catch (err) {
      console.error('Error updating comment:', err);
    }
  }, [editContent, editReason, updateCommentMutation]);

  // Error state handling
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

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_LENGTH) setCommentContent(value);
  }, []);

  // Helper to get author display name
  const getAuthorName = useCallback((comment: ProjectComment): string => {
    if (comment.userId === 2) return "All Users";
    return comment.userName || comment.authorName || 'User';
  }, []);

  // Helper to get avatar fallback letter
  const getAvatarFallback = useCallback((comment: ProjectComment): string => {
    if (comment.userId === 2) return "A";
    const name = comment.userName || comment.authorName || '?';
    return name.charAt(0).toUpperCase();
  }, []);

  // Permission check: only author or admin can edit
  const canEditComment = useCallback((comment: ProjectComment): boolean => {
    const ADMIN_USER_ID = 1;
    return comment.userId === currentUserId || currentUserId === ADMIN_USER_ID;
  }, [currentUserId]);

  const toDate = useCallback((dateString: string | null | undefined): Date | null => {
    if (!dateString) return null;
    try {
      const isoString = dateString.includes('T') || dateString.includes('Z')
        ? dateString
        : dateString.replace(' ', 'T') + 'Z';  // ← Agregar Z para indicar UTC

      const date = new Date(isoString);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }, []);

  const formatTimeAgo = useCallback((dateString: string | null | undefined): string => {
    const date = toDate(dateString);
    if (!date) return dateString ?? '-';

    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: es,
    });
  }, [toDate]);

  const formatCreatedDate = useCallback((dateString: string | null | undefined): string => {
    const date = toDate(dateString);
    if (!date) return '';

    return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
  }, [toDate]);

  // Toggle the inline reply form for a top-level comment
  const toggleReply = (commentId: number) => {
    setReplyingToId((current) => (current === commentId ? null : commentId));
    setReplyContent("");
  };

  // Render a single comment card (top-level or threaded reply)
  const renderCard = (comment: ProjectComment, isReply: boolean) => (
    <div
      key={comment.id}
      className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors"
    >
      {/* Avatar responsive */}
      <Avatar className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0">
        <AvatarFallback className={`${comment.userId === 2 ? "bg-blue-100 text-blue-800" : ""} text-xs sm:text-sm`}>
          {comment.userId === 2 ? (
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            getAvatarFallback(comment)
          )}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        {/* Header: autor + timestamp + edit */}
        <div className="flex flex-wrap items-center justify-between gap-1 sm:gap-2 mb-1">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate">
              {isReply && (
                <span className="mr-1 text-[10px] font-semibold text-primary inline-flex items-center gap-0.5">
                  <CornerDownRight className="h-3 w-3" />Reply
                </span>
              )}
              {getAuthorName(comment)}
              {comment.userId === 2 && (
                <span className="ml-1 text-[10px] text-muted-foreground font-normal">(Group)</span>
              )}
            </p>
            {comment.userEmail && (
              <p className="text-[10px] text-muted-foreground truncate">
                {comment.userEmail}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-1 shrink-0">
            <span
              className="text-[10px] text-muted-foreground whitespace-nowrap"
              title={comment.createdAt ? `Created: ${formatCreatedDate(comment.createdAt)}` : undefined}
            >
              {formatTimeAgo(comment.createdAt)}
              {comment.createdAt && (
                <>
                  <span className="mx-1 opacity-50">·</span>
                  {formatCreatedDate(comment.createdAt)}
                </>
              )}
            </span>
            {!isReply && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => toggleReply(comment.id)}
                title="Reply"
                disabled={createCommentMutation.isPending}
              >
                <CornerDownRight className="h-3.5 w-3.5" />
              </Button>
            )}
            {canEditComment(comment) && editingCommentId !== comment.id && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => handleEditClick(comment)}
                title="Edit comment"
                disabled={updateCommentMutation.isPending}
              >
                <PencilIcon className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* ===== EDIT MODE ===== */}
        {editingCommentId === comment.id ? (
          <div className="mt-2 space-y-3">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[70px] sm:min-h-[80px] resize-none text-sm"
              autoFocus
              disabled={updateCommentMutation.isPending}
            />

            {/* Reason for editing */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Info className="h-3 w-3 flex-shrink-0" />
                <span>Reason (optional):</span>
              </div>
              <Textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="e.g., Fixed typo..."
                className="min-h-[50px] resize-none text-xs"
                maxLength={255}
                disabled={updateCommentMutation.isPending}
              />
              <div className="text-[10px] text-muted-foreground text-right">
                {editReason.length}/255
              </div>
            </div>

            {/* Action buttons - apilados en móvil */}
            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full sm:w-auto h-10"
                onClick={handleEditCancel}
                disabled={updateCommentMutation.isPending}
              >
                <X className="h-3.5 w-3.5 mr-1" /> Cancel
              </Button>
              <Button
                size="sm"
                className="w-full sm:w-auto h-10"
                onClick={() => handleEditSubmit(comment.id)}
                disabled={updateCommentMutation.isPending || !editContent.trim()}
              >
                {updateCommentMutation.isPending ? (
                  <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Saving...</>
                ) : (
                  <><Check className="h-3.5 w-3.5 mr-1" /> Save</>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* ===== VIEW MODE ===== */
          <>
            <p className="text-sm whitespace-pre-wrap break-words text-foreground/90 leading-relaxed">
              {comment.content}
            </p>
            {comment.reasonToEdit && (
              <p className="mt-2 text-[10px] text-muted-foreground italic flex items-start gap-1">
                <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>Edited: {comment.reasonToEdit}</span>
              </p>
            )}
          </>
        )}

        {/* ===== INLINE REPLY FORM (top-level comments only) ===== */}
        {!isReply && replyingToId === comment.id && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-[10px] text-muted-foreground mb-1.5 flex items-center gap-1">
              <CornerDownRight className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">Reply to {getAuthorName(comment)}</span>
            </p>
            <Textarea
              value={replyContent}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= MAX_LENGTH) setReplyContent(value);
              }}
              placeholder="Write a reply..."
              className="min-h-[60px] sm:min-h-[70px] resize-none text-sm"
              autoFocus
              disabled={createCommentMutation.isPending}
            />
            <div className="flex items-center justify-between gap-2 mt-2">
              <span className="text-[10px] text-muted-foreground">
                {replyContent.length}/{MAX_LENGTH}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8"
                  onClick={() => setReplyingToId(null)}
                  disabled={createCommentMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-8"
                  onClick={handleReplySubmit}
                  disabled={createCommentMutation.isPending || !replyContent.trim()}
                >
                  {createCommentMutation.isPending ? (
                    <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="h-3.5 w-3.5 mr-1" /> Reply</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
  <div className="space-y-4 sm:space-y-6">
    
    {/* ===== HEADER ===== */}
    <div className="px-1 sm:px-0">
      <h3 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
        <span className="truncate">
          Comments ({comments?.length || 0})
        </span>
      </h3>
    </div>

    {/* ===== NEW COMMENT FORM ===== */}
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <div className="relative">
        <Textarea
          placeholder="Write a comment..."
          value={commentContent}
          onChange={handleInputChange}
          className="min-h-[80px] sm:min-h-[100px] resize-none text-sm pr-14"
          disabled={createCommentMutation.isPending}
        />
        {/* Character counter con fondo para mejor legibilidad */}
        <div className="absolute bottom-2 right-2 text-[10px] sm:text-xs text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded">
          {commentContent.length}/{MAX_LENGTH}
        </div>
      </div>
      
      {/* Botones apilados en móvil, en fila en desktop */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto h-10"
          onClick={() => setCommentContent("")}
          disabled={!commentContent.trim() || createCommentMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          className="w-full sm:w-auto h-10"
          disabled={createCommentMutation.isPending || !commentContent.trim()}
        >
          {createCommentMutation.isPending ? (
            <><Loader2Icon className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
          ) : (
            <><Send className="h-4 w-4 mr-2" /> Send</>
          )}
        </Button>
      </div>
    </form>

    {/* ===== COMMENTS LIST ===== */}
    <div className="space-y-3 sm:space-y-4">
      {isLoading ? (
        <div className="space-y-3 sm:space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 sm:gap-4 animate-pulse">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 sm:h-4 w-1/3 bg-muted rounded" />
                <div className="h-3.5 sm:h-4 w-full bg-muted rounded" />
                <div className="h-3.5 sm:h-4 w-2/3 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-6 sm:py-8 bg-muted/30 rounded-lg border border-dashed px-4">
          <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">No comments yet</p>
        </div>
      ) : (
        <>
          {displayedRoots.map((root) => {
            const replies = threadGroups.replyMap.get(root.id) ?? [];
            return (
              <div key={`thread-${root.id}`} className="space-y-2">
                {renderCard(root, false)}
                {replies.length > 0 && (
                  <div className="ml-6 sm:ml-8 pl-3 sm:pl-4 border-l-2 border-muted space-y-2">
                    {replies.map((reply) => renderCard(reply, true))}
                  </div>
                )}
              </div>
            );
          })}

          {threadGroups.orphans.map((orphan) => renderCard(orphan, true))}

          {/* ===== TOGGLE BUTTONS ===== */}
          {hasMoreComments && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(true)}
              className="w-full mt-1 sm:mt-2 h-10 text-xs"
            >
              View all comments ({comments?.length})
              <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
            </Button>
          )}

          {showAll && comments && comments.length > initialLimit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(false)}
              className="w-full mt-1 sm:mt-2 h-10 text-xs"
            >
              Show only last {initialLimit}
              <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
            </Button>
          )}
        </>
      )}
    </div>
  </div>
);
};
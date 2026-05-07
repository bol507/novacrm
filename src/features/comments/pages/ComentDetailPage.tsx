import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  MessageSquare,
  User,
  Calendar,
  Link,
  Paperclip,
  Lock,
  Globe,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useCommentDetail } from '../hooks/use-comment-detail';

/**
 * CommentDetailPage component for displaying a single comment's details.
 *
 * Features:
 * - Fetches and displays comment details by ID from URL parameters
 * - Shows loading skeleton while fetching data
 * - Displays error state when comment not found
 * - Shows comment content, author info, metadata, and related entity link
 * - Displays edit reason if comment was modified
 * - Navigation back to previous page
 *
 * @component
 * @returns The rendered comment detail page
 */
const CommentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const commentId = id ? parseInt(id, 10) : null;

  const { comment, isLoading, isError } = useCommentDetail({
    commentId: commentId,
    enabled: commentId !== null,
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !comment) {
    return (
      <div className="p-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h2 className="text-lg font-semibold mb-2">Comment not found</h2>
              <p className="text-sm text-muted-foreground mb-4">
                The comment you are looking for does not exist or has been deleted
              </p>
              <Button onClick={() => navigate(-1)}>Go back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRelatedEntityRoute = () => {
    if (!comment) return null;
    
    const routes: Record<string, string> = {
      'Project': `/dashboard/projects/${comment.relatedToId}`,
      'Calendar': `/dashboard/tasks/${comment.relatedToId}`,
      'Tasks': `/dashboard/tasks/${comment.relatedToId}`,
      'Quotes': `/dashboard/quotes/${comment.relatedToId}`,
      'Accounts': `/dashboard/clients/${comment.relatedToId}`,
      'Contacts': `/dashboard/contacts/${comment.relatedToId}`,
      'Potentials': `/dashboard/opportunities/${comment.relatedToId}`,
      'HelpDesk': `/dashboard/tickets/${comment.relatedToId}`,
    };

    return routes[comment.relatedModule || ''] || null;
  };

  const handleRelatedEntityClick = () => {
    const route = getRelatedEntityRoute();
    if (route) {
      navigate(route);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-destructive">
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comment Details
            </CardTitle>
            <div className="flex items-center gap-2">
              {comment.isPrivate ? (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="w-3 h-3" />
                  Private
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <Globe className="w-3 h-3" />
                  Public
                </Badge>
              )}
              {comment.isReply && (
                <Badge variant="secondary">Reply</Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-start gap-4 pb-4 border-b">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {comment.authorName?.charAt(0).toUpperCase() ?? '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{comment.authorName}</h3>
                {comment.userId && (
                  <span className="text-xs text-muted-foreground">
                    (ID: {comment.userId})
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {comment.userEmail || 'No email'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {comment.formattedCreatedAt || comment.createdAt}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Content
            </h4>
            <div className="p-6 bg-muted/50 rounded-lg border">
              <p className="text-base text-foreground whitespace-pre-wrap leading-relaxed">
                {comment.content}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Link className="w-4 h-4" />
                Related to
              </h4>
              <div 
                className="p-3 bg-muted/50 rounded-lg flex items-center justify-between cursor-pointer hover:bg-muted transition-colors"
                onClick={handleRelatedEntityClick}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {comment?.relatedEntityIcon || '🔗'}
                  </span>
                  <span className="text-sm text-foreground">
                    {comment?.relatedEntityType || 'Entity'} #{comment?.relatedToId}
                  </span>
                </div>
                <Eye className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Click to view {comment?.relatedEntityType?.toLowerCase() || 'the entity'}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Status</h4>
              <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  {comment.isReply ? (
                    <Badge variant="secondary" className="text-xs">
                      Reply
                    </Badge>
                  ) : (
                    <Badge variant="default" className="text-xs">
                      Main
                    </Badge>
                  )}
                </div>
                {comment.parentCommentId && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Parent:</span>
                    <span className="text-foreground">
                      #{comment.parentCommentId}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Privacy:</span>
                  <span className="text-foreground">
                    {comment.isPrivate ? 'Private' : 'Public'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {comment.hasAttachment && comment.attachment && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Attachment
              </h4>
              <div className="p-4 bg-muted/50 rounded-lg border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Paperclip className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {comment.attachment}
                  </span>
                </div>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
            </div>
          )}

          {comment.reasonToEdit && (
            <div className="space-y-2 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <h4 className="text-sm font-medium text-yellow-700 dark:text-yellow-500">
                Edited
              </h4>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                {comment.reasonToEdit}
              </p>
              <p className="text-xs text-yellow-500 dark:text-yellow-600">
                Last updated: {comment.updatedAt}
              </p>
            </div>
          )}

          <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
            <p>Created: {comment.createdAt}</p>
            {comment.updatedAt !== comment.createdAt && (
              <p>Updated: {comment.updatedAt}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommentDetailPage;
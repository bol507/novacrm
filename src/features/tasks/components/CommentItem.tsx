import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { MessageSquare, Lock, Paperclip } from "lucide-react";
import type { Comment } from "../types/task";

interface CommentItemProps {
  comment: Comment;
  isReply?: boolean;
  onReply?: (commentId: number) => void;
}

const CommentItem = ({ comment, isReply = false, onReply }: CommentItemProps) => {
  const getInitials = (name: string | null | undefined) => {
    if (!name || typeof name !== 'string') {
    return '?';
  }

    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
      
  };

  return (
    <div
      className={cn(
        "flex gap-3 py-3",
        isReply && "ml-8 border-l-2 border-muted pl-4"
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8">
        <AvatarImage src="" alt={comment.userName} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {getInitials(comment.userName) || 'U'}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{comment.userName}</span>
          <span className="text-xs text-muted-foreground">
            {comment.formattedCreatedAt}
          </span>
          {comment.isPrivate && (
            <Badge variant="outline" className="text-xs gap-1">
              <Lock className="w-3 h-3" />
              Privado
            </Badge>
          )}
          {comment.attachment && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Paperclip className="w-3 h-3" />
              Adjunto
            </Badge>
          )}
        </div>

        {/* Comment text */}
        <p className="text-sm mt-1 text-foreground break-words">
          {comment.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-2">
          {!isReply && onReply && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => onReply(comment.id)}
            >
              <MessageSquare className="w-3 h-3 mr-1" />
              Responder
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
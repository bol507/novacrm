import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTaskComments } from "../hooks/useTaskComments";
import CommentItem from "./CommentItem";
import type { Comment } from "../types/task";

interface CommentListProps {
  taskId: number;
  onReply?: (commentId: number) => void;
}

const CommentList = ({ taskId, onReply }: CommentListProps) => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useTaskComments(taskId, page);

  const comments = data?.data || [];
  const meta = data?.meta;

  const loadMore = () => {
    if (meta && page < meta.last_page) {
      setPage((p) => p + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No hay comentarios aún</p>
        <p className="text-xs mt-1">Sé el primero en comentar esta tarea</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Comments */}
      <div className="space-y-4">
        {comments.map((comment: Comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            isReply={comment.isReply}
            onReply={onReply}
          />
        ))}
      </div>

      {/* Load more */}
      {meta && meta.has_more && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMore}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Cargar más comentarios
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommentList;
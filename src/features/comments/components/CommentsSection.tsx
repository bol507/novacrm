import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useComments, useCreateComment } from "../hooks/use-comment";
import type { Comment } from "../types/comment";
import { toast } from "sonner";

interface CommentsSectionProps {
  module: string;
  relatedId: number;
}

export const CommentsSection = ({ module, relatedId }: CommentsSectionProps) => {
  const [commentContent, setCommentContent] = useState("");
  const { data, isLoading, error } = useComments(module, relatedId);
  const createCommentMutation = useCreateComment(module, relatedId);

  const comments: Comment[] = data?.data || [];
  const MAX_LENGTH = 5000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    if (commentContent.length > MAX_LENGTH) {
      toast.error(`El comentario no puede exceder los ${MAX_LENGTH} caracteres`);
      return;
    }

    await createCommentMutation.mutateAsync({
      commentcontent: commentContent.trim(),
    });

    setCommentContent("");
  };

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
        <p className="text-destructive">Error al cargar comentarios</p>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_LENGTH) {
      setCommentContent(value);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comentarios ({comments.length})
        </h3>
      </div>

      {/* Formulario de nuevo comentario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Textarea
            placeholder="Escribe un comentario..."
            value={commentContent}
            onChange={handleInputChange}
            className="min-h-[100px]"
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
            disabled={!commentContent.trim()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createCommentMutation.isPending || !commentContent.trim()}
          >
            {createCommentMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar comentario
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 bg-muted/30 rounded-lg">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No hay comentarios aún</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.commentid} className="flex gap-4 p-4 bg-card rounded-lg border border-border">
              <Avatar>
                <AvatarFallback>
                  {comment.assigned_user_id === 2
                    ? "T"
                    : (comment.assigned_user_name || '?').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold">{comment.assigned_user_name || 'Usuario'}</p>
                    {comment.assigned_user_email && (
                      <p className="text-xs text-muted-foreground">{comment.assigned_user_email}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {comment.createdtime
                      ? format(new Date(comment.createdtime), 'dd MMM yyyy HH:mm', { locale: es })
                      : '-'}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.commentcontent}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
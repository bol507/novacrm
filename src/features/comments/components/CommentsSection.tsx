import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2, MessageSquare, Users } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import type { ProjectComment } from "@/features/comments/types/comment";
import { toast } from "sonner";
import { selectComments, useComments, useCreateComment } from "../hooks/use-comment";

interface CommentsSectionProps {
  module: string;
  relatedId: number;
}

export const CommentsSection = ({ module, relatedId }: CommentsSectionProps) => {
  const [commentContent, setCommentContent] = useState("");
  
  // ✅ CORRECCIÓN: Usar 'data' en lugar de 'commentsResponse'
  const {  data, isLoading, error } = useComments(module, relatedId);
  const createCommentMutation = useCreateComment(module, relatedId);

  // ✅ Usar selector con 'data' (que es CommentResponse | undefined)
  const comments: ProjectComment[] = selectComments(data);
  const MAX_LENGTH = 5000;

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!commentContent.trim()) return;

  if (commentContent.length > MAX_LENGTH) {
    toast.error(`El comentario no puede exceder los ${MAX_LENGTH} caracteres`);
    return;
  }

  try {
    await createCommentMutation.mutateAsync({
      content: commentContent.trim(),  // ✅ Cambiar aquí también
    });
    setCommentContent("");
  } catch (err) {
    console.error('Error al crear comentario:', err);
  }
};

  // ✅ Manejo de error
  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
        <p className="text-destructive mb-2">Error al cargar comentarios</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_LENGTH) setCommentContent(value);
  };

  // ✅ Helpers
  const getAuthorName = (comment: ProjectComment): string => {
    if (comment.userId === 2) return "Todos los usuarios";
    return comment.userName || comment.authorName || 'Usuario';
  };

  const getAvatarFallback = (comment: ProjectComment): string => {
    if (comment.userId === 2) return "T";
    const name = comment.userName || comment.authorName || '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comentarios ({comments.length})
        </h3>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Textarea
            placeholder="Escribe un comentario..."
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
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createCommentMutation.isPending || !commentContent.trim()}
          >
            {createCommentMutation.isPending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</>
            ) : (
              <><Send className="h-4 w-4 mr-2" /> Enviar comentario</>
            )}
          </Button>
        </div>
      </form>

      {/* Lista de comentarios */}
      <div className="space-y-4">
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
        ) : comments.length === 0 ? (
          <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2 opacity-50" />
            <p className="text-muted-foreground">No hay comentarios aún</p>
          </div>
        ) : (
          comments.map((comment) => (
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
                      {comment.userId === 2 && <span className="ml-2 text-xs text-muted-foreground">(Grupo)</span>}
                    </p>
                    {comment.userEmail && (
                      <p className="text-xs text-muted-foreground truncate">{comment.userEmail}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {comment.createdAt ? format(new Date(comment.createdAt), 'dd MMM HH:mm', { locale: es }) : '-'}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap break-words text-foreground/90">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
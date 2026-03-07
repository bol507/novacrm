import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAddComment } from "../hooks/useTaskComments";
import { Loader2, Lock } from "lucide-react";
import type { CreateCommentPayload } from "../types/task";

interface CommentFormProps {
    taskId: number;
    parentCommentId?: number | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const CommentForm = ({ taskId, parentCommentId = null, onSuccess, onCancel }: CommentFormProps) => {
    const [content, setContent] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const addComment = useAddComment(taskId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) return;

        try {
            const payload: CreateCommentPayload = {
                content: content.trim(),
                parent_comment_id: parentCommentId,
            };

            // Solo agregar is_private si está marcado (evitar enviar false por defecto)
            if (isPrivate) {
                payload.is_private = true;
            }

            // Solo agregar attachment si existe (para futura implementación)
            // if (attachment) {
            //   payload.attachment = attachment;
            // }

            await addComment.mutateAsync(payload);

            // Reset form
            setContent("");
            setIsPrivate(false);
            onSuccess?.();
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const isSubmitting = addComment.isPending;

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
                placeholder={parentCommentId ? "Escribe una respuesta..." : "Agrega un comentario..."}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={isSubmitting}
            />

            {/* Options */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                            checked={isPrivate}
                            onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
                            disabled={isSubmitting}
                        />
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <Lock className="w-3 h-3" />
                            Privado
                        </span>
                    </label>
                </div>

                <div className="flex items-center gap-2">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onCancel}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                    )}
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!content.trim() || isSubmitting}
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : null}
                        {parentCommentId ? "Responder" : "Comentar"}
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default CommentForm;
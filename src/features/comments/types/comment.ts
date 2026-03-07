
export interface ProjectComment {
  id: number;
  taskId: number;
  content: string;
  authorName?: string;
  userName?: string;
  userEmail?: string;
  userId: number;
  createdAt: string;
  updatedAt?: string;
  formattedCreatedAt?: string;
  isPrivate: boolean;
  isReply: boolean;
  parentCommentId: number | null;
  attachment: string | null;
}

export interface CommentResponse {
  data: ProjectComment[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_more: boolean;
  };
}

export interface CreateCommentData {
  content: string;  
  parent_commentid?: number;
  is_private?: boolean;
  attachment?: File | null;
}

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

export interface CommentDetail {
  id: number;
  taskId: number;
  relatedToId: number;  
  relatedModule: string | null;  
  relatedEntityType: string;  
  relatedEntityIcon: string; 
  content: string;
  userId: number | null;
  userName: string | null;
  userEmail: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  parentCommentId: number | null;
  isPrivate: boolean;
  attachment: string | null;
  hasAttachment: boolean;
  isReply: boolean;
  authorName: string;
  formattedCreatedAt: string | null;
  reasonToEdit: string | null;
}
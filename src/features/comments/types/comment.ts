
export interface ProjectComment {
  id: number;
   relatedToId: number;
  relatedModule: string | null;
  taskId: number;
  content: string;
  authorName?: string; 
  userName: string | null;  
  userEmail: string | null; 
  userId: number;
  createdAt: string | null; 
  updatedAt: string | null; 
  formattedCreatedAt: string | null; 
  isPrivate: boolean;
  isReply: boolean;
  parentCommentId: number | null;
  attachment: string | null;
  reasonToEdit: string | null; 
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

export interface CommentDetail extends ProjectComment  {
  relatedEntityType: string;
  relatedEntityIcon: string;
  hasAttachment: boolean;
}
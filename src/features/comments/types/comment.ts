export interface Comment {
  commentid: number;
  commentcontent: string;
  related_to: number;
  parent_comments?: number;        
  customer?: number;                
  userid?: number;                  
  reasontoedit?: string;
  is_private?: number;
  filename?: string;
  related_email_id?: number;
  createdtime?: string;
  modifiedtime?: string;
  assigned_user_name?: string;
  assigned_user_id?: number;
  assigned_user_email?: string;
}

export interface CreateCommentData {
  commentcontent: string;
  parent_commentid?: number;
  customer?: number;               
  is_private?: number;
  filename?: string;
}
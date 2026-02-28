export interface Attachment {
  id: number;
  name: string;
  description?: string | null;
  mimeType: string;
  size: number;
  googleDriveId: string;
  url: string;
  viewUrl: string;
  relatedRecordId: number;
  module: string;
  createdAt: string;
}

export interface CreateAttachmentData {
  file: File;
  description?: string;
}
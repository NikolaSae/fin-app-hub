import { Claim, ClaimStatus, ClaimNote, User } from './claims';

export interface ClaimCardProps {
  claim: Claim;
  onSelect?: (claim: Claim) => void;
}

export interface StatusUpdateFormProps {
  currentStatus: ClaimStatus;
  onSubmit: (newStatus: ClaimStatus, comment: string) => Promise<void>;
}

export interface NoteListProps {
  notes: ClaimNote[];
  currentUser: User;
  onDelete?: (noteId: string) => void;
}

export interface PriorityIndicatorProps {
  priority: number;
  size?: 'sm' | 'md' | 'lg';
}

export interface ClaimAttachmentProps {
  attachments: Array<{
    id: string;
    fileName: string;
    fileType: string;
    url: string;
  }>;
  onUpload: (files: File[]) => Promise<void>;
  onDelete: (attachmentId: string) => Promise<void>;
}
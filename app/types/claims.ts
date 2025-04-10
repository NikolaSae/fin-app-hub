export enum ClaimStatus {
    DRAFT = "DRAFT",
    NEW = "NEW",
    PROCESSING = "PROCESSING",
    WAITING_FOR_INFO = "WAITING_FOR_INFO",
    RESOLVED = "RESOLVED",
    REJECTED = "REJECTED",
    CLOSED = "CLOSED",
  }
  
  export enum ClaimType {
    PRODUCT_DEFECT = "PRODUCT_DEFECT",
    SHIPPING_DAMAGE = "SHIPPING_DAMAGE",
    WRONG_ITEM = "WRONG_ITEM",
    MISSING_ITEM = "MISSING_ITEM",
    RETURN_REFUND = "RETURN_REFUND",
    SERVICE_COMPLAINT = "SERVICE_COMPLAINT",
    WARRANTY = "WARRANTY",
    OTHER = "OTHER",
  }
  
  export interface User {
    id: string;
    name?: string;
    email?: string;
    role: string;
  }
  
  export interface Attachment {
    id: string;
    fileName: string;
    fileType: string;
    path: string;
  }
  
  export interface ClaimNote {
    id: string;
    content: string;
    isInternal: boolean;
    createdAt: string;
    author: User;
  }
  
  export interface Claim {
    id: string;
    claimNumber: string;
    status: ClaimStatus;
    type: ClaimType;
    priority: number;
    subject: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    submitter: User;
    assignedTo?: User;
    attachments: Attachment[];
    notes: ClaimNote[];
  }
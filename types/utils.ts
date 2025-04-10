export interface ApiResponse<T> {
    data?: T;
    error?: string;
    success: boolean;
  }
  
  export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
  }
  
  export type FileUploadResponse = {
    url: string;
    fileName: string;
    fileType: string;
    size: number;
  }[];
import { ApiResponse } from '@/types/utils';

export async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json();
  if (!response.ok) {
    return {
      success: false,
      error: data.error || `HTTP error! status: ${response.status}`,
    };
  }
  return { success: true, data };
}

export const apiRoutes = {
  claims: {
    getAll: '/api/claims',
    getById: (id: string) => `/api/claims/${id}`,
    updateStatus: (id: string) => `/api/claims/${id}/status`,
    createNote: (id: string) => `/api/claims/${id}/notes`,
    uploadAttachment: (id: string) => `/api/claims/${id}/attachments`,
  },
  users: {
    getAll: '/api/users',
  },
};
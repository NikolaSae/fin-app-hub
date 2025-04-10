import { Claim, ClaimStatus, ClaimType, User, ClaimNote } from './claims';

export interface ClaimsContextType {
  claims: Claim[];
  selectedClaim: Claim | null;
  filters: ClaimFilters;
  actions: {
    updateStatus: (claimId: string, status: ClaimStatus, comment: string) => Promise<void>;
    assignClaim: (claimId: string, userId: string) => Promise<void>;
    addNote: (claimId: string, note: Omit<ClaimNote, 'id' | 'createdAt' | 'author'>) => Promise<void>;
    updateFilters: (newFilters: ClaimFilters) => void;
  };
}

export interface ClaimFilters {
  status?: ClaimStatus;
  type?: ClaimType;
  priority?: number;
  search?: string;
  assignedTo?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
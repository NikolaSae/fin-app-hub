// Dodajte ove tipove u postojeći claims.ts fajl
export interface ClaimsFilterParams {
    status?: ClaimStatus;
    type?: ClaimType;
    priority?: number;
    search?: string;
    assignedTo?: string;
    startDate?: Date;
    endDate?: Date;
  }
  
  export interface ClaimsFilterOptions {
    statuses: ClaimStatus[];
    types: ClaimType[];
    priorities: number[];
    users: Array<{ id: string; name: string }>;
  }
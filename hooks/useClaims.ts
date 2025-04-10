'use client';

import { useEffect, useReducer } from 'react';
import { Claim, ClaimFilters, ClaimNote } from '@/types/claims';
import { ApiResponse } from '@/types/utils';

type State = {
  claims: Claim[];
  selectedClaim: Claim | null;
  isLoading: boolean;
  error: string | null;
};

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Claim[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'SELECT_CLAIM'; payload: Claim }
  | { type: 'UPDATE_CLAIM'; payload: Claim };

const initialState: State = {
  claims: [],
  selectedClaim: null,
  isLoading: false,
  error: null,
};

function claimsReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, isLoading: false, claims: action.payload };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'SELECT_CLAIM':
      return { ...state, selectedClaim: action.payload };
    case 'UPDATE_CLAIM':
      return {
        ...state,
        claims: state.claims.map(claim => 
          claim.id === action.payload.id ? action.payload : claim
        ),
        selectedClaim: action.payload,
      };
    default:
      return state;
  }
}

export function useClaims() {
  const [state, dispatch] = useReducer(claimsReducer, initialState);

  const fetchClaims = async (filters?: ClaimFilters) => {
    try {
      dispatch({ type: 'FETCH_START' });
      const query = new URLSearchParams(filters as Record<string, string>);
      const res = await fetch(`/api/claims?${query}`);
      const data: ApiResponse<Claim[]> = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch claims');
      
      dispatch({ type: 'FETCH_SUCCESS', payload: data.data || [] });
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: (err as Error).message });
    }
  };

  const updateClaimStatus = async (claimId: string, status: ClaimStatus, comment: string) => {
    try {
      const res = await fetch(`/api/claims/${claimId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, comment }),
      });
      
      const data: ApiResponse<Claim> = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');
      
      dispatch({ type: 'UPDATE_CLAIM', payload: data.data! });
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  return {
    ...state,
    fetchClaims,
    updateClaimStatus,
    selectClaim: (claim: Claim) => dispatch({ type: 'SELECT_CLAIM', payload: claim }),
  };
}
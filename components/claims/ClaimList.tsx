'use client';

import { Claim } from '@/types/claims';
import ClaimsFilters from './ClaimsFilters';
import ClaimCard from './ClaimCard';
import LoadingSkeleton from './LoadingSkeleton';

interface ClaimListProps {
  claims: Claim[];
  isLoading: boolean;
}

export default function ClaimList({ claims, isLoading }: ClaimListProps) {
  return (
    <div className="space-y-4">
      <ClaimFilters />
      
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {claims.map(claim => (
            <ClaimCard key={claim.id} claim={claim} />
          ))}
        </div>
      )}
    </div>
  );
}
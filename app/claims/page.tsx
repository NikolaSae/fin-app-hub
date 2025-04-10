'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ClaimList from '@/components/claims/ClaimList';
import { Claim, ClaimStatus, ClaimType } from '@/types/claims';

export default function ClaimsPage() {
  const searchParams = useSearchParams();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const params = new URLSearchParams(searchParams.toString());
        const res = await fetch(`/api/claims?${params}`);
        const data = await res.json();
        setClaims(data);
      } catch (error) {
        console.error('Error fetching claims:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClaims();
  }, [searchParams]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Claims Management</h1>
      <ClaimList claims={claims} isLoading={isLoading} />
    </div>
  );
}
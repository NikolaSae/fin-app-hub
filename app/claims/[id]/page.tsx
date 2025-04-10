'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ClaimDetail from '@/components/claims/ClaimDetail';
import { Claim } from '@/types/claims';

export default function ClaimDetailPage() {
  const { id } = useParams();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        const res = await fetch(`/api/claims/${id}`);
        const data = await res.json();
        setClaim(data);
      } catch (error) {
        console.error('Error fetching claim:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClaim();
  }, [id]);

  if (isLoading) return <div>Loading claim...</div>;
  if (!claim) return <div>Claim not found</div>;

  return (
    <div className="container mx-auto p-4">
      <ClaimDetail claim={claim} />
    </div>
  );
}
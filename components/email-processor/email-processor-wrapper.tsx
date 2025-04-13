// components/email-processor/email-processor-wrapper.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import to avoid server-side rendering for the component
// that uses browser-only APIs
const EmailProcessor = dynamic(() => import('./email-processor'), {
  ssr: false,
  loading: () => <p className="text-center py-8">Loading email processor...</p>
});

export function EmailProcessorWrapper() {
  return (
    <div className="mt-2">
      <EmailProcessor />
    </div>
  );
}
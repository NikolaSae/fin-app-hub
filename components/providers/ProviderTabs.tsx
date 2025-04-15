// components/providers/ProviderTabs.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Provider } from './ProviderList';

interface ProviderTabsProps {
  provider: Provider;
}

export default function ProviderTabs({ provider }: ProviderTabsProps) {
  const pathname = usePathname();
  const baseUrl = `/providers/${provider.id}`;
  
  const tabs = [
    { 
      name: 'Opšte informacije', 
      href: baseUrl,
      active: pathname === baseUrl
    },
    { 
      name: 'Servisi', 
      href: `${baseUrl}/services`,
      active: pathname.includes(`${baseUrl}/services`)
    },
    { 
      name: 'Reklamacije', 
      href: `${baseUrl}/complaints`,
      active: pathname.includes(`${baseUrl}/complaints`)
    },
    { 
      name: 'Analitika', 
      href: `${baseUrl}/analytics`,
      active: pathname.includes(`${baseUrl}/analytics`)
    },
    { 
      name: 'Ugovori', 
      href: `${baseUrl}/contracts`,
      active: pathname.includes(`${baseUrl}/contracts`),
      disabled: true, // As mentioned in the requirements (to be added later)
      tooltip: 'Biće dostupno uskoro'
    },
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            href={tab.disabled ? '#' : tab.href}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${tab.active
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={(e) => {
              if (tab.disabled) {
                e.preventDefault();
              }
            }}
            title={tab.disabled ? tab.tooltip : ''}
          >
            {tab.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
// components/ServiceDetailsModal.tsx


"use client";

import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export const ServiceDetailsModal = ({
  service,
  isOpen,
  onClose,
}: {
  service: any;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!service) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl rounded bg-white p-6">
          <div className="flex justify-between items-start mb-4">
            <Dialog.Title className="text-lg font-medium">{service.name || service.proizvod}</Dialog.Title>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            {Object.entries(service).map(([key, value]) => (
              key !== 'id' && (
                <div key={key} className="flex justify-between border-b pb-2">
                  <span className="font-medium capitalize">{key}</span>
                  <span className="text-gray-600">{String(value)}</span>
                </div>
              )
            ))}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
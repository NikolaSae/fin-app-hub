// components/services/ServiceDetails.tsx
import React, { useState } from 'react';
import { ServiceComplaints } from './ServiceComplaints';

type ComplaintType = {
  id: string;
  subject: string;
  body: string;
  createdAt: Date;
  status: string;
};

type ServiceType = {
  id: string;
  name: string;
  type?: string;
  code?: string;
  description?: string;
  providerName: string;
  complaints?: ComplaintType[];
  [key: string]: any;
};

type ServiceDetailsProps = {
  service: ServiceType;
  onClose: () => void;
};

export function ServiceDetails({ service, onClose }: ServiceDetailsProps) {
  // Proveravamo da li servis ima reklamacije, ako ne dodajemo prazan niz
  const complaints = service.complaints || [];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-semibold">{service.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Osnovne informacije</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <span className="text-sm font-medium">ID:</span>
                <span className="text-sm ml-2">{service.id}</span>
              </div>
              <div>
                <span className="text-sm font-medium">Provajder:</span>
                <span className="text-sm ml-2">{service.providerName}</span>
              </div>
              {service.type && (
                <div>
                  <span className="text-sm font-medium">Tip:</span>
                  <span className="text-sm ml-2">{service.type}</span>
                </div>
              )}
              {service.code && (
                <div>
                  <span className="text-sm font-medium">Kod:</span>
                  <span className="text-sm ml-2">{service.code}</span>
                </div>
              )}
            </div>
          </div>
          
          {service.description && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Opis</h4>
              <p className="text-sm text-gray-700">{service.description}</p>
            </div>
          )}
          
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Reklamacije</h4>
            <ServiceComplaints complaints={complaints} />
          </div>
        </div>
        
        <div className="flex justify-end p-4 border-t">
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
          >
            Zatvori
          </button>
        </div>
      </div>
    </div>
  );
}
// app/(protected)/services/page.tsx

"use client";

import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { Provider, VasService, BulkService, ParkingService, HumanService, VasType, HumanType } from '@prisma/client';

// Definišemo tipove za podatke koje primamo
type ServiceDashboardProps = {
  providers: (Provider & {
    vasServices: VasService[];
    bulkServices: BulkService[];
    parkingServices: ParkingService[];
    humanServices: HumanService[];
  })[];
}

export default function ServiceDashboard({ providers }: ServiceDashboardProps) {
  const [vasTypeFilter, setVasTypeFilter] = useState<VasType | 'all'>('all');
  const [humanTypeFilter, setHumanTypeFilter] = useState<HumanType | 'all'>('all');
  
  // Lista tabova za različite tipove servisa
  const tabs = [
    { name: 'VAS', key: 'vas' },
    { name: 'Bulk', key: 'bulk' },
    { name: 'Parking', key: 'parking' },
    { name: 'HumanServi', key: 'humanservi' },
  ];

  // Filtriranje VAS servisa prema tipu
  const filteredVasServices = providers?.flatMap(provider => 
    provider.vasServices.filter(service => 
      vasTypeFilter === 'all' || service.type === vasTypeFilter
    ).map(service => ({
      ...service,
      providerName: provider.name
    }))
  ) || [];

  // Filtriranje Human servisa prema tipu
  const filteredHumanServices = providers?.flatMap(provider => 
    provider.humanServices.filter(service => 
      humanTypeFilter === 'all' || service.type === humanTypeFilter
    ).map(service => ({
      ...service,
      providerName: provider.name
    }))
  ) || [];

  // Bulk servisi
  const bulkServices = providers?.flatMap(provider => 
    provider.bulkServices.map(service => ({
      ...service,
      providerName: provider.name
    }))
  ) || [];

  // Parking servisi
  const parkingServices = providers?.flatMap(provider => 
    provider.parkingServices.map(service => ({
      ...service,
      providerName: provider.name
    }))
  ) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Pregled servisa</h1>
      
      <Tab.Group>
        <Tab.List className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          {tabs.map((tab) => (
            <Tab
              key={tab.key}
              className={({ selected }) =>
                `py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none flex-1 text-center
                ${selected 
                  ? 'bg-white shadow text-blue-600' 
                  : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                }`
              }
            >
              {tab.name}
            </Tab>
          ))}
        </Tab.List>
        
        <Tab.Panels className="mt-2">
          {/* VAS Tab Panel */}
          <Tab.Panel>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <h2 className="font-medium">VAS Servisi</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setVasTypeFilter('all')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      vasTypeFilter === 'all' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Svi
                  </button>
                  <button 
                    onClick={() => setVasTypeFilter('prepaid')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      vasTypeFilter === 'prepaid' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Prepaid
                  </button>
                  <button 
                    onClick={() => setVasTypeFilter('postpaid')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      vasTypeFilter === 'postpaid' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Postpaid
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proizvod</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provajder</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tip</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mesec</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cena</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transakcije</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Naplaćeno</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredVasServices.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.proizvod}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.providerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            service.type === 'prepaid' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {service.type === 'prepaid' ? 'Prepaid' : 'Postpaid'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(service.mesec_pruzanja_usluge).toLocaleDateString('sr-RS', { year: 'numeric', month: 'long' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.jedinicna_cena} RSD</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.broj_transakcija}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.naplacen_iznos} RSD</td>
                      </tr>
                    ))}
                    {filteredVasServices.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">Nema podataka za prikaz</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Tab.Panel>
          
          {/* Bulk Tab Panel */}
          <Tab.Panel>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="font-medium">Bulk Servisi</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agreement Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Step Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requests</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message Parts</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bulkServices.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.provider_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.agreement_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.service_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.step_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.sender_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.requests}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.message_parts}</td>
                      </tr>
                    ))}
                    {bulkServices.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">Nema podataka za prikaz</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Tab.Panel>
          
          {/* Parking Tab Panel */}
          <Tab.Panel>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="font-medium">Parking Servisi</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Naziv</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provajder</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opis</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parkingServices.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.providerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.description || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {service.isActive ? 'Aktivan' : 'Neaktivan'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {parkingServices.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Nema podataka za prikaz</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Tab.Panel>
          
          {/* HumanServi Tab Panel */}
          <Tab.Panel>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <h2 className="font-medium">Humanitarni Servisi</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setHumanTypeFilter('all')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      humanTypeFilter === 'all' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Svi
                  </button>
                  <button 
                    onClick={() => setHumanTypeFilter('prepaid')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      humanTypeFilter === 'prepaid' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Prepaid
                  </button>
                  <button 
                    onClick={() => setHumanTypeFilter('postpaid')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      humanTypeFilter === 'postpaid' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Postpaid
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Naziv</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provajder</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tip</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organizacija</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredHumanServices.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.providerName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            service.type === 'prepaid' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {service.type === 'prepaid' ? 'Prepaid' : 'Postpaid'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.humanOrgId || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {service.isActive ? 'Aktivan' : 'Neaktivan'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredHumanServices.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Nema podataka za prikaz</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
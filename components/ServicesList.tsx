// components/ServicesList.tsx
import { useState, useMemo, useEffect } from 'react';
import { getTableHeaders, getTableRow } from './TableHelper';
import { 
  Search, 
  ArrowUpDown, 
  Download, 
  Info, 
  ChevronLeft, 
  ChevronRight,
  X
} from 'lucide-react';
import { VasService, BulkService, HumanService, Provider, SortConfig, ServicesListProps } from '../types/services';
import {
  renderVasRow,
  renderBulkRow,
  renderHumanServiceRow,
} from '../utils/renderServiceRows';
import { renderHeaders } from '../utils/renderServiceHeaders';

// Napomena: Uklonio sam CSVLink i motion import jer možda nisu instalirani
// Dodaj nazad nakon instalacije paketa
type Service = VasService | BulkService | HumanService;

const ServicesList = ({ 
  providers, 
  title = 'Spisak usluga',
  itemsPerPage = 10 
}: ServicesListProps) => {
  const [activeType, setActiveType] = useState<'vas' | 'bulk' | 'parking' | 'human'>('vas');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Debug logging
  useEffect(() => {
    console.log("[ServicesList] Initialized with providers:", providers.length);
    console.log("[ServicesList] VAS services count:", providers.reduce((acc, p) => acc + p.vasServices.length, 0));
    console.log("[ServicesList] Currently selected type:", activeType);
  }, [providers, activeType]);

  // Spajanje svih servisa iz svih providera po aktivnom tipu
  const allServices = useMemo(() => {
  const services: Service[] = [];
  providers.forEach(provider => {
    const serviceArray = provider[`${activeType}Services`];
    if (Array.isArray(serviceArray)) {
      services.push(...serviceArray);
    } else {
      console.warn(`[ServicesList] Provider ${provider.id} is missing ${activeType}Services array.`);
    }
  });
  return services;
}, [providers, activeType]);

const filteredServices = useMemo(() => {
  if (searchTerm.trim() === '') {
    return allServices; // Prikaz svih servisa kada nema aktivne pretrage
  }
  return allServices.filter(service =>
    service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
}, [allServices, searchTerm]);

const sortedServices = useMemo(() => {
  if (!sortConfig.key) return filteredServices;

  return [...filteredServices].sort((a, b) => {
    if (a[sortConfig.key]! < b[sortConfig.key]!) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key]! > b[sortConfig.key]!) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
}, [filteredServices, sortConfig]);

const paginatedServices = useMemo(() => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  return sortedServices.slice(startIndex, startIndex + itemsPerPage);
}, [sortedServices, currentPage, itemsPerPage]);

const totalPages = Math.ceil(sortedServices.length / itemsPerPage);

const handleSort = (key: keyof Service) => {
  setSortConfig(prevConfig => ({
    key,
    direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
  }));
};

const getProviderForService = (serviceId: string): Provider | undefined => {
  return providers.find(p =>
    p.vasServices?.some(s => s.id === serviceId) ||
    p.bulkServices?.some(s => s.id === serviceId) ||
    p.parkingServices?.some(s => s.id === serviceId) ||
    p.humanServices?.some(s => s.id === serviceId)
  );
};

const hasAnyServices = providers.some(p =>
  (p.vasServices && p.vasServices.length > 0) ||
  (p.bulkServices && p.bulkServices.length > 0) ||
  (p.parkingServices && p.parkingServices.length > 0) ||
  (p.humanServices && p.humanServices.length > 0)
);

useEffect(() => {
  if (!hasAnyServices) {
    console.warn("No services available in the system.");
  }
}, [hasAnyServices]);

  const ProvidersList = () => {
  return (
    <div className="bg-gray-100 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Spisak svih provajdera</h2>
      {providers.map((provider, index) => (
        <div key={provider.id} className="border-b pb-4 mb-4">
          <h3 className="text-lg font-semibold">
            {index + 1}. {provider.name}
          </h3>
          <p className="text-sm">
            <strong>Adresa:</strong> {provider.address || "Nije dostupno"}
          </p>
          <p className="text-sm">
            <strong>Kontakt:</strong> {provider.contactInfo || "Nije dostupno"}
          </p>
          <p className="text-sm">
            <strong>Broj servisa:</strong> 
            VAS: {provider.vasServices.length}, BULK: {provider.bulkServices.length}, PARKING: {provider.parkingServices.length}, HUMAN: {provider.humanServices.length}
          </p>
        </div>
      ))}
    </div>
  );
};

  return (
  <div className="w-full bg-white rounded-lg shadow-md p-6">
    <ProvidersList />
    <h2 className="text-2xl font-bold mb-6">{title}</h2>
    
    {/* Tabs za izbor tipa servisa */}
    <div className="mb-6 border-b border-gray-200">
      <ul className="flex flex-wrap -mb-px">
        {(['vas', 'bulk', 'parking', 'human'] as const).map((type) => (
          <li key={type} className="mr-2">
            <button
              onClick={() => {
                setActiveType(type);
                setCurrentPage(1); // Reset na prvu stranicu pri promeni tipa
              }}
              className={`inline-block p-4 rounded-t-lg ${
                activeType === type
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-600 hover:border-gray-300'
              }`}
            >
              {type.toUpperCase()} usluge
              <span className="ml-2 text-xs text-gray-500">
                ({providers.reduce((acc, p) => acc + (p[`${type}Services`]?.length || 0), 0)})
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>

    {/* Pretraga */}
    <div className="flex justify-between mb-4">
      <div className="relative w-64">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
          placeholder="Pretraži usluge..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset na prvu stranicu pri pretrazi
          }}
        />
      </div>
      
      {sortedServices.length > 0 && (
        <button
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download className="w-5 h-5 mr-2" />
          Export CSV
        </button>
      )}
    </div>

    {/* Poruka o nedostatku podataka */}
    {allServices.length === 0 && (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        Trenutno nema dostupnih {activeType.toUpperCase()} usluga.
      </div>
    )}

    {/* Tabela sa servisima */}
    {allServices.length > 0 && (
      <div className="relative overflow-x-auto rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          {renderHeaders(activeType)} {/* Dinamičko generisanje headers-a */}
          <tbody>
            {paginatedServices.map((service) => {
              const provider = getProviderForService(service.id)?.name || null;

              if ('mesec_pruzanja_usluge' in service) {
                return renderVasRow(service, provider);
              } else if ('agreement_name' in service) {
                return renderBulkRow(service);
              } else if ('type' in service && service.type === 'HumanType') {
                return renderHumanServiceRow(service);
              } else {
                notifyError('Nepoznat tip servisa! Molimo proverite podatke.');
                return (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-red-500">
                      Nepoznat tip servisa!
                    </td>
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
      </div>
    )}

    {/* Paginacija */}
    {totalPages > 1 && (
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-700">
          Prikazuje se {(currentPage - 1) * itemsPerPage + 1} do {Math.min(currentPage * itemsPerPage, sortedServices.length)} od ukupno {sortedServices.length} usluga
        </div>
        <div className="flex space-x-2">
          <button
            className="px-3 py-1 border rounded-md disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
            const pageNum = Math.min(Math.max(1, currentPage - 2 + idx), totalPages);
            return (
              <button
                key={idx}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 border rounded-md ${
                  currentPage === pageNum ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            className="px-3 py-1 border rounded-md disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    )}
  </div>
);
};

export default ServicesList;
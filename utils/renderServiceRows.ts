// utils/renderServiceRows.ts
import { VasService, BulkService, HumanService } from '../types/services';

export const renderVasRow = (service: VasService, providerName: string | null) => {
  return (
    <tr key={service.id} className="bg-white border-b hover:bg-gray-50">
      <td className="px-6 py-4">{service.name}</td>
      <td className="px-6 py-4">{new Date(service.mesec_pruzanja_usluge).toLocaleDateString('sr-RS')}</td>
      <td className="px-6 py-4">{service.jedinicna_cena} RSD</td>
      <td className="px-6 py-4">{service.broj_transakcija}</td>
      <td className="px-6 py-4">{service.fakturisan_iznos} RSD</td>
      <td className="px-6 py-4">{service.kumulativ_naplacenih_iznosa} RSD</td>
      <td className="px-6 py-4">{providerName || 'N/A'}</td>
      <td className="px-6 py-4">{service.isActive ? 'Aktivan' : 'Neaktivan'}</td>
    </tr>
  );
};


export const renderBulkRow = (service: BulkService) => {
  return (
    <tr key={service.service_name} className="bg-white border-b hover:bg-gray-50">
      <td className="px-6 py-4">{service.provider_name}</td>
      <td className="px-6 py-4">{service.agreement_name}</td>
      <td className="px-6 py-4">{service.service_name}</td>
      <td className="px-6 py-4">{service.requests}</td>
      <td className="px-6 py-4">{service.message_parts}</td>
      <td className="px-6 py-4">{service.isActive ? 'Aktivan' : 'Neaktivan'}</td>
    </tr>
  );
};

export const renderHumanServiceRow = (service: HumanService) => (
  <tr key={service.name} className="bg-white border-b hover:bg-gray-50">
    <td className="px-6 py-4">{service.name}</td>
    <td className="px-6 py-4">{service.description || '-'}</td>
    <td className="px-6 py-4">{service.type}</td>
    <td className="px-6 py-4">{service.isActive ? 'Aktivan' : 'Neaktivan'}</td>
  </tr>
);

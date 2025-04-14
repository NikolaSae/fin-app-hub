// types/services.ts
export type VasService = {
  id: string;
  name: string;
  mesec_pruzanja_usluge: Date;
  jedinicna_cena: number;
  broj_transakcija: number;
  fakturisan_iznos: number;
  fakturisan_korigovan_iznos: number;
  naplacen_iznos: number;
  kumulativ_naplacenih_iznosa: number;
  nenaplacen_iznos: number;
  nenaplacen_korigovan_iznos: number;
  storniran_iznos: number;
  otkazan_iznos: number;
  kumulativ_otkazanih_iznosa: number;
  iznos_za_prenos_sredstava: number;
  type: 'VAS';
  provajderId: string;
  isActive: boolean;
  created_at: Date;
  updated_at: Date;
  kpi?: string;
  remarks?: string;
  status?: string;
};

export type BulkService = {
  provider_name: string;
  agreement_name: string;
  service_name: string;
  step_name: string;
  sender_name: string;
  requests: number;
  message_parts: number;
  provajderId: string;
  isActive: boolean;
  created_at: Date;
  updated_at: Date;
  kpi?: string;
  remarks?: string;
  status?: string;
};

export type HumanService = {
  name: string;
  description?: string;
  type: 'HumanType';
  provajderId: string;
  isActive: boolean;
  created_at: Date;
  updated_at: Date;
  kpi?: string;
  remarks?: string;
  status?: string;
};

export type Provider = {
  id: string;
  name: string;
  address?: string;
  contactInfo?: string;
  vasServices: VasService[];
  bulkServices: BulkService[];
  parkingServices: Service[]; // Update this if Parking has a specific type
  humanServices: HumanService[];
};

export type SortConfig = {
  key: keyof Service | null;
  direction: 'asc' | 'desc';
};

export type ServicesListProps = {
  providers: Provider[];
  title?: string;
  itemsPerPage?: number;
};
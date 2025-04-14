// utils/renderServiceHeaders.ts
import React from 'react';

/**
 * Renderovanje zaglavlja tabele na osnovu tipa servisa.
 * @param serviceType Tip servisa ('VAS', 'Bulk', 'HumanType')
 * @returns JSX.Element za zaglavlje tabele
 */
export const renderHeaders = (serviceType: 'VAS' | 'Bulk' | 'HumanType'): JSX.Element | null => {
  switch (serviceType) {
    case 'VAS':
      return (
        <thead>
          <tr>
            <th>Proizvod</th>
            <th>Mesec pružanja usluge</th>
            <th>Jedinična cena</th>
            <th>Broj transakcija</th>
            <th>Fakturisan iznos</th>
            <th>Fakturisan korigovan iznos</th>
            <th>Naplaćen iznos</th>
            <th>Kumulativ naplaćenih iznosa</th>
            <th>Nenaplaćen iznos</th>
            <th>Nenaplaćen korigovan iznos</th>
            <th>Storniran iznos</th>
            <th>Otkazan iznos</th>
            <th>Kumulativ otkazanih iznosa</th>
            <th>Iznos za prenos sredstava</th>
            <th>Tip</th>
            <th>Provajder ID</th>
            <th>Status</th>
            <th>KPI</th>
            <th>Napomene</th>
            <th>Kreirano</th>
            <th>Ažurirano</th>
          </tr>
        </thead>
      );
    case 'Bulk':
      return (
        <thead>
          <tr>
            <th>Naziv provajdera</th>
            <th>Naziv ugovora</th>
            <th>Naziv servisa</th>
            <th>Koraci</th>
            <th>Pošiljalac</th>
            <th>Broj zahteva</th>
            <th>Delovi poruke</th>
            <th>Provajder ID</th>
            <th>Status</th>
            <th>KPI</th>
            <th>Napomene</th>
            <th>Kreirano</th>
            <th>Ažurirano</th>
          </tr>
        </thead>
      );
    case 'HumanType':
      return (
        <thead>
          <tr>
            <th>Naziv</th>
            <th>Opis</th>
            <th>Tip</th>
            <th>Provajder ID</th>
            <th>Status</th>
            <th>KPI</th>
            <th>Napomene</th>
            <th>Kreirano</th>
            <th>Ažurirano</th>
          </tr>
        </thead>
      );
    default:
      return null;
  }
};

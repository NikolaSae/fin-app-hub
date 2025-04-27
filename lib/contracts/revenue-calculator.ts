// /lib/contracts/revenue-calculator.ts

import { db } from '@/lib/db'; // Pretpostavljena putanja do vašeg Prisma klijenta
import { Contract, ServiceContract, VASService, BulkService, ServiceType } from '@prisma/client'; // Prisma modeli i enumi
import { startOfMonth, endOfMonth, max, min } from 'date-fns'; // Utility za datume

// Tipovi za uključene relacije
type ContractWithServices = Contract & {
    services: (ServiceContract & { service: { id: string, type: ServiceType } })[];
};

// Pretpostavljene stope prihoda za Bulk servise (NISU U BAZI, ovo je primer!)
// U realnoj aplikaciji, ovo bi se verovatno dohvatalo iz baze ili konfiguracije.
const BULK_REVENUE_RATES = {
    // Primer: prihod po zahtevu ili po delu poruke za različite tipove servisa
    // 'SMS_MT': { per_request: 0.01, per_message_part: 0.01 },
    // 'SMS_MO': { per_request: 0.005 },
    // ... druge stope za druge Bulk service_name ili step_name
};


/**
 * Kalkuliše prihod za specifičan ugovor u datom vremenskom periodu.
 * Prihod se zasniva na podacima iz povezanih VASService i BulkService modela
 * i revenuePercentage-u ugovora.
 * @param contractId - ID ugovora za koji se kalkuliše prihod.
 * @param calculationStartDate - Početni datum perioda za kalkulaciju (podrazumevano početak ugovora).
 * @param calculationEndDate - Krajnji datum perioda za kalkulaciju (podrazumevano kraj ugovora).
 * @returns Ukupan prihod za ugovor u definisanom periodu.
 */
export const calculateContractRevenue = async (
    contractId: string,
    calculationStartDate?: Date,
    calculationEndDate?: Date
): Promise<number> => {
    try {
        // 1. Dohvatanje ugovora sa potrebnim relacijama
        const contract = await db.contract.findUnique({
            where: { id: contractId },
            include: {
                services: {
                    include: {
                        service: {
                             select: { id: true, type: true, name: true } // Potrebni tip i ime servisa
                        }
                    },
                },
                 provider: { select: { id: true } }, // Potreban ID provajdera za filtriranje VAS/Bulk podataka
                 humanitarianOrg: { select: { id: true } }, // Potrebni ID-jevi zavisno od tipa ugovora
                 parkingService: { select: { id: true } },
            },
        });

        if (!contract) {
            console.warn(`Contract with ID ${contractId} not found for revenue calculation.`);
            return 0; // Vrati 0 ako ugovor ne postoji
        }

        // 2. Definisanje perioda kalkulacije
        // Period kalkulacije je presek perioda ugovora i traženog perioda
        const periodStart = calculationStartDate ? max([contract.startDate, calculationStartDate]) : contract.startDate;
        const periodEnd = calculationEndDate ? min([contract.endDate, calculationEndDate]) : contract.endDate;

        if (periodStart > periodEnd) {
             return 0; // Periodi se ne preklapaju
        }


        let totalGrossRevenue = 0; // Ukupan bruto prihod pre primene revenuePercentage

        // 3. Iteracija kroz povezane servise i dohvatanje relevantnih podataka
        for (const serviceLink of contract.services) {
            const serviceId = serviceLink.serviceId;
            const serviceType = serviceLink.service.type;
            const serviceName = serviceLink.service.name;

            if (serviceType === ServiceType.VAS) {
                // Dohvatanje VASService podataka za ovaj servis, provajdera i period
                 // Napomena: Filtriranje po mesecu_pruzanja_usluge zahteva da periodStart/End budu početak/kraj meseca
                 // Ovo je pojednostavljenje, realna logika može biti složenija.
                 // Pretpostavljamo da mesec_pruzanja_usluge označava prvi dan meseca.
                 const vasData = await db.vASService.findMany({
                     where: {
                         serviceId: serviceId,
                         provajderId: contract.providerId, // VAS je vezan za provajdera
                         mesec_pruzanja_usluge: {
                            gte: startOfMonth(periodStart),
                            lte: endOfMonth(periodEnd),
                         },
                     },
                     select: {
                         naplacen_iznos: true, // Pretpostavljamo da je ovo relevantan iznos za kalkulaciju
                         fakturisan_korigovan_iznos: true, // Možda i ovo zavisno od logike
                     },
                 });

                 // Sumiranje relevantnog iznosa iz VAS podataka
                 const vasRevenue = vasData.reduce((sum, data) => sum + (data.naplacen_iznos || 0), 0);
                 totalGrossRevenue += vasRevenue;

            } else if (serviceType === ServiceType.BULK) {
                 // Dohvatanje BulkService podataka za ovaj servis, provajdera i period (BulkService nema polje za mesec, ovo je problem)
                 // BulkService model je baziran na CSV-u bez datuma transakcije, samo "mesec_pruzanja_usluge" u VASu.
                 // Ovo je problem sa dizajnom baze ako želite preciznu vremensku kalkulaciju prihoda za Bulk.
                 // Za ovu generaciju, preskočićemo preciznu Bulk kalkulaciju prihoda na osnovu vremenskog perioda.
                 // U realnosti, morali biste da:
                 // a) Imate datum na BulkService modelu
                 // b) Imate definisane stope prihoda po zahtevu/poruci (BulkService nema iznos polja)
                 console.warn(`Bulk service "${serviceName}" attached to contract ${contract.contractNumber}. Revenue calculation for Bulk services over a period is not supported with the current schema.`);
                 // Primer kako bi izgledalo sa stopama i datumom:
                 /*
                 const bulkData = await db.bulkService.findMany({
                     where: {
                          serviceId: serviceId,
                          providerId: contract.providerId, // Bulk je vezan za provajdera
                          // OVDJE BI TREBALO BITI POLJE DATUM: date: { gte: periodStart, lte: periodEnd }
                     },
                     select: {
                         requests: true,
                         message_parts: true,
                         // step_name: true // Možda stopa zavisi od step_name
                     },
                 });

                 const rate = BULK_REVENUE_RATES[serviceName]?.per_request || 0; // Pronađi stopu

                 const bulkRevenue = bulkData.reduce((sum, data) => sum + (data.requests * rate), 0);
                 totalGrossRevenue += bulkRevenue;
                 */

            }
            // Dodajte logiku za druge ServiceType ako postoje
        }

        // 4. Primena revenuePercentage ugovora
        const contractRevenue = totalGrossRevenue * (contract.revenuePercentage / 100);

        return contractRevenue;

    } catch (error) {
        console.error(`Error calculating revenue for contract ${contractId}:`, error);
        // Vraćanje 0 u slučaju greške
        return 0;
    }
};

/**
 * Kalkuliše ukupan prihod za platformu u datom vremenskom periodu
 * na osnovu svih relevantnih ugovora.
 * @param calculationStartDate - Početni datum perioda za kalkulaciju.
 * @param calculationEndDate - Krajnji datum perioda za kalkulaciju.
 * @returns Ukupan prihod platforme u definisanom periodu.
 */
export const calculateTotalPlatformRevenue = async (
     calculationStartDate?: Date,
    calculationEndDate?: Date
): Promise<number> => {
    try {
        // 1. Dohvatanje svih ugovora koji su relevantni za kalkulaciju prihoda
        // Ovo može uključivati ACTIVE ugovore, ili EXPIRED ugovore
        // koji su još uvek imali aktivnost prihoda u traženom periodu.
        const relevantContracts = await db.contract.findMany({
             where: {
                 OR: [
                     { status: 'ACTIVE' },
                     // Ugovori koji su istekli, ali njihov period pokriva deo traženog perioda
                     {
                         status: 'EXPIRED',
                          endDate: { gte: calculationStartDate } // Kraj ugovora je unutar ili nakon početka perioda
                          // Možda dodati i startDate check: startDate: { lte: calculationEndDate }
                     },
                 ],
                 // Možda isključiti PENDING ugovore?
             },
              include: {
                services: {
                    include: {
                        service: {
                             select: { id: true, type: true, name: true }
                        }
                    },
                },
                 provider: { select: { id: true } },
                 humanitarianOrg: { select: { id: true } },
                 parkingService: { select: { id: true } },
             }
        });

        let totalPlatformRevenue = 0;

        // 2. Iteracija kroz ugovore i sumiranje prihoda koristeći (delimično) logiku iz calculateContractRevenue
        // Optimizovanije bi bilo izvršiti agregirane upite na VASService umesto iteriranja kroz ugovore,
        // ali za sada ćemo reći da poziva logiku po ugovoru.
        for (const contract of relevantContracts) {
            // Replikacija logike iz calculateContractRevenue za ovaj ugovor i period
             const contractGrossRevenue = await (async () => {
                let gross = 0;
                 const periodStart = calculationStartDate ? max([contract.startDate, calculationStartDate]) : contract.startDate;
                 const periodEnd = calculationEndDate ? min([contract.endDate, calculationEndDate]) : contract.endDate;

                  if (periodStart > periodEnd) {
                       return 0;
                  }

                 for (const serviceLink of contract.services) {
                     const serviceId = serviceLink.serviceId;
                     const serviceType = serviceLink.service.type;

                     if (serviceType === ServiceType.VAS && contract.providerId) {
                          const vasData = await db.vASService.findMany({
                             where: {
                                 serviceId: serviceId,
                                 provajderId: contract.providerId,
                                  mesec_pruzanja_usluge: {
                                    gte: startOfMonth(periodStart),
                                    lte: endOfMonth(periodEnd),
                                 },
                              },
                             select: { naplacen_iznos: true },
                          });
                          gross += vasData.reduce((sum, data) => sum + (data.naplacen_iznos || 0), 0);
                     }
                      // Napomena: BulkService kalkulacija prihoda preko perioda sa trenutnom šemom je netrivijalna
                     // i zahtevala bi definisanje stopa i rešavanje vremenskog obuhvata.
                 }
                 return gross;
             })();


            totalPlatformRevenue += grossRevenue * (contract.revenuePercentage / 100);
        }


        return totalPlatformRevenue;

    } catch (error) {
        console.error("Error calculating total platform revenue:", error);
        return 0; // Vraćanje 0 u slučaju greške
    }
};

// Napomena: Kalkulacija prihoda, posebno za BulkService, može biti vrlo složena
// i zavisi od tačne definicije "prihoda" u vašem poslovnom kontekstu,
// kao i od toga kako se tačno mapiraju podaci iz CSV-a u bazu.
// Trenutna implementacija za BulkService je placeholder.
// Agregirani upiti u Prisma (ili direktni SQL) bili bi znatno efikasniji
// za calculateTotalPlatformRevenue funkciju umesto iteriranja kroz ugovore.
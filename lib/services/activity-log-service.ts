// lib/services/activity-log-service.ts

import { db } from "@/lib/db"; // Uvoz tvoje Prisma klijent instance
import { LogSeverity } from "@prisma/client"; // Uvoz LogSeverity enum-a iz Prisma klijenta
import { getCurrentUser } from "@/lib/session"; // Uvoz funkcije za dobijanje trenutnog korisnika

// Definicija opcija koje log metoda prihvata
interface LogOptions {
  entityType: string; // Tip entiteta na koji se akcija odnosi (npr. 'BULK_SERVICE', 'USER', 'CONTRACT')
  entityId?: string; // ID entiteta (opciono)
  details?: string; // Dodatni detalji o akciji (opciono)
  severity?: LogSeverity; // Nivo ozbiljnosti loga (INFO, WARNING, ERROR, itd.), podrazumevano INFO
  userId?: string; // Opciono: ID korisnika koji je izvršio akciju. Ako nije naveden, pokušaće da dobije ulogovanog korisnika.
}

/**
 * Servis za logovanje aktivnosti korisnika i sistema.
 * Pruža statičku metodu `log` za kreiranje zapisa u `ActivityLog` tabeli.
 */
export const ActivityLogService = {
  /**
   * Kreira novi zapis u tabeli `ActivityLog`.
   *
   * @param action - Naziv akcije koja se loguje (npr. 'CREATE_BULK_SERVICE', 'USER_LOGIN', 'UPDATE_CONTRACT').
   * @param options - Objekat sa detaljima o logu (entityType, entityId, details, severity, userId).
   */
  async log(action: string, options: LogOptions) {
    let userId = options.userId;

    // Ako userId nije eksplicitno prosleđen, pokušaj da dobiješ ID trenutno ulogovanog korisnika
    // Ovo radi samo na server-strani gde getCurrentUser() funkcioniše.
    if (!userId) {
      const user = await getCurrentUser();
      if (user?.id) { // Proveri da li je korisnik pronađen i ima ID
        userId = user.id;
      } else {
        // Ako nema ni prosleđenog userId-a ni ulogovanog korisnika, loguj grešku
        console.error(`ActivityLogService: Cannot log action "${action}". No user ID provided or found.`);
        // Možeš odlučiti da baciš grešku ovde, ili samo da preskočiš logovanje
        return; // Prekida izvršenje logovanja ako nema korisnika
      }
    }

    // Izdvajanje ostalih opcija sa podrazumevanom vrednošću za severity
    const { entityType, entityId, details, severity = LogSeverity.INFO } = options;

    try {
      // Koristi tvoju 'db' instancu Prisma klijenta za kreiranje zapisa
      return await db.activityLog.create({
        data: {
          action,
          entityType,
          entityId,
          details,
          severity,
          // userId: userId, // Ovo je ekvivalentno samo userId
          userId, // userId će biti non-nullable ako je tako definisano u Prisma šemi
          createdAt: new Date(), // Dodaj createdAt polje, pretpostavljajući da postoji
        }
      });
    } catch (error) {
      // Logovanje greške ako upis u bazu ne uspe
      console.error(`ActivityLogService: Failed to create log entry for action "${action}":`, error);
      // Ovde ne bi trebalo bacati grešku dalje u aplikaciju, jer ne želimo da logovanje obori glavnu akciju.
    }
  }
};
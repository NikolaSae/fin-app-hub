// Path: app/(protected)/providers/page.tsx

// Uklanjamo import Metadata jer se više ne eksportuje iz ovog fajla
// import { Metadata } from "next";
// Importirajte auth samo ako vam treba na klijentskoj strani preko useSession
// import { auth } from "@/auth";

"use client";
import { ProviderList } from "@/components/providers/ProviderList";
import { UserRole } from "@prisma/client";
import { ProviderFilters } from "@/components/providers/ProviderFilters";
import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";
import { useProviders } from "@/hooks/use-providers";
// Uvezite useSession ako vam je potrebna sesija na klijentskoj strani
import { useSession } from "next-auth/react";


// !!! UKLONJEN metadata export - ne može postojati u "use client" komponenti !!!
// export const metadata: Metadata = {
//   title: "Providers | Management Dashboard",
//   description: "View and manage all providers in the system",
// };




export default function ProvidersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // Pribavite sesiju na klijentskoj strani koristeći useSession hook
  const { data: session, status } = useSession();
  const currentUser = session?.user;
  const userRole = currentUser?.role as UserRole | undefined; // Pretpostavljajući da je uloga string ili enum


  // Pribavite filtere iz URL search parametara
  const search = searchParams.get("search") || "";
  const isActiveParam = searchParams.get("isActive");
  const isActive = isActiveParam === null ? null : isActiveParam === 'true'; // Konvertujte string u boolean ili null

  // Pribavite parametre za paginaciju iz URL search parametara
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10); // Podesite podrazumevanu veličinu stranice

  // Pribavite podatke o provajderima koristeći useProviders hook sa filterima i paginacijom
  // Morate imati useProviders hook koji prima ove parametre i fetchuje podatke sa servera
  const { providers, totalProviders, isLoading, error, mutate } = useProviders({
      search: search === '' ? undefined : search, // Prosledite undefined ako je prazno
      isActive: isActive,
      page,
      pageSize,
  });


  // Wrapujte handleFilterChange u useCallback
  // Ova funkcija se poziva iz ProviderFilters kada se filteri promene
  const handleFilterChange = useCallback((filterOptions: ProviderFilterOptions) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      // Ažurirajte search parametar
      if (filterOptions.search) {
          newSearchParams.set("search", filterOptions.search);
      } else {
          newSearchParams.delete("search");
      }

      // Ažurirajte isActive parametar
      if (filterOptions.isActive !== null && filterOptions.isActive !== undefined) {
          newSearchParams.set("isActive", filterOptions.isActive.toString());
      } else {
          newSearchParams.delete("isActive");
      }

      // Resetujte stranicu na 1 kada se filteri promene
      newSearchParams.set("page", "1");


      // Ažurirajte URL
      router.push(`?${newSearchParams.toString()}`);
      // router.replace(`?${newSearchParams.toString()}`); // Možete koristiti i replace ako ne želite da dodajete u istoriju pregledača

  }, [searchParams, router]); // Zavisnosti: searchParams (da reaguje na promene URL-a) i router

  // Handler za promenu stranice
  const handlePageChange = useCallback((newPage: number) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set("page", newPage.toString());
      router.push(`?${newSearchParams.toString()}`);
  }, [searchParams, router]);


  // Prikazivanje stanja učitavanja ili greške
  if (isLoading || status === 'loading') { // Dodajte proveru statusa sesije
      return <div className="container mx-auto p-6">Loading providers...</div>;
  }

  if (error) {
      return <div className="container mx-auto p-6 text-red-500">Error loading providers: {error.message}</div>;
  }

  // Provera autorizacije nakon učitavanja sesije i podataka
   if (status === 'unauthenticated' || (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER)) {
       // Preusmerite ili prikažite poruku o nedostatku dozvola ako korisnik nije autorizovan
       router.push('/unauthorized'); // Primer preusmeravanja na /unauthorized stranicu
       return null; // Vratite null dok se ne izvrši preusmeravanje
   }


  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Providers</h1>
          <p className="text-gray-500">
            View and manage all providers in the system
          </p>
        </div>
        <div className="flex items-center gap-4">
           {/* Uslovno prikažite dugme "Create Provider" na osnovu uloge */}
           {(userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) && (
              <a
                href="/providers/new"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
              >
                Create Provider
              </a>
           )}
        </div>
      </div>

      {/* Renderujte ProviderFilters komponentu i prosledite joj inicijalne filtere i handler */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <ProviderFilters
              initialFilters={{ search, isActive }} // Prosledite inicijalne filtere iz URL-a
              onFilterChange={handleFilterChange} // Prosledite useCallback wrapovanu funkciju
          />
      </div>


      {/* Renderujte ProviderList komponentu i prosledite joj podatke, paginaciju i ulogu */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <ProviderList
              providers={providers || []} // Prosledite pribavljene provajdere
              totalProviders={totalProviders || 0} // Prosledite ukupan broj
              page={page}
              pageSize={pageSize}
              onPageChange={handlePageChange} // Prosledite handler za promenu stranice
              userRole={userRole} // Prosledite ulogu (sada iz useSession)
              onDeleteSuccess={mutate} // Prosledite mutate funkciju za osvežavanje nakon brisanja
          />
      </div>

    </div>
  );
}

// app/(protected)/organizations/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { sr } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Calendar, 
  CreditCard, 
  Edit, 
  FileText, 
  Loader2, 
  Clock, 
  Trash2,
  Building,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { OrganizationHistory } from "@/components/organizations/OrganizationHistory";
import { toast } from "sonner";
import { HumanitarnaOrganizacija, OrganizationStatus, IstorijaPromena } from "@prisma/client";
import { getStatusColor } from "@/utils/organizationStatus";

export default function OrganizationDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [organization, setOrganization] = useState<(HumanitarnaOrganizacija & { status: OrganizationStatus }) | null>(null);
  const [history, setHistory] = useState<IstorijaPromena[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Učitaj params id ako je potrebno čekati
        const id = await params.id;

        // Učitavamo podatke o organizaciji
        const orgResponse = await fetch(`/api/organizations/${id}`);
        
        if (!orgResponse.ok) {
          throw new Error("Failed to fetch organization");
        }
        
        const orgData = await orgResponse.json();
        setOrganization(orgData);
        
        // Učitavamo istoriju promena
        const historyResponse = await fetch(`/api/organizations/${id}/history`);
        
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setHistory(historyData);
        }
      } catch (error) {
        console.error("Error:", error);
        setError("Greška pri učitavanju podataka o organizaciji");
      } finally {
        setLoading(false);
        setHistoryLoading(false);
      }
    }

    fetchData();
  }, [params]); 

  async function handleDelete() {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/organizations/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Greška pri brisanju organizacije");
      }

      toast.success("Humanitarna organizacija je uspešno obrisana");
      router.push("/organizations");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
      console.error("Error:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Učitavanje...</span>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="container mx-auto py-6">
        <div className="p-4 bg-red-50 text-red-800 rounded-md">
          <p>{error || "Organizacija nije pronađena"}</p>
          <Link href="/organizations">
            <Button variant="outline" className="mt-4">
              Povratak na listu organizacija
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusColor = getStatusColor(organization.status);
  const formatDate = (date: Date) => format(new Date(date), "dd.MM.yyyy", { locale: sr });
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/organizations">
          <Button variant="ghost" className="p-0 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Nazad na listu organizacija
          </Button>
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold">{organization.naziv}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{organization.kratkiBroj}</Badge>
              <Badge 
                className={`bg-${statusColor}-100 text-${statusColor}-800 border-${statusColor}-200`}
              >
                {organization.status === 'URGENT' && 'Hitno'}
                {organization.status === 'HIGH' && 'Visok prioritet'}
                {organization.status === 'MEDIUM' && 'Srednji prioritet'}
                {organization.status === 'LOW' && 'Nizak prioritet'}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link href={`/organizations/${params.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Izmeni
              </Button>
            </Link>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Obriši
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ova akcija će trajno obrisati humanitarnu organizaciju "{organization.naziv}" i ne može se poništiti.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Otkaži</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Brisanje...' : 'Obriši'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Osnovni podaci
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Broj ugovora</p>
                <p>{organization.ugovor}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kratki broj</p>
                <p>{organization.kratkiBroj}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">PIB</p>
                <p>{organization.pib}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Matični broj</p>
                <p>{organization.mb}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Ugovor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Datum početka</p>
                <p className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                  {formatDate(organization.datumPocetka)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Datum isteka</p>
                <p className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                  {formatDate(organization.datumIsteka)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Finansijski podaci
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Banka</p>
                <p>{organization.banka || "Nije navedeno"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Broj računa</p>
                <p>{organization.racun || "Nije navedeno"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Poziv na broj</p>
                <p>{organization.pozivNaBroj || "Nije navedeno"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Kontakt informacije
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Adresa</p>
                <p className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                  {organization.adresa || "Nije navedeno"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kontakt osoba</p>
                <p>{organization.kontaktOsoba || "Nije navedeno"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Telefon</p>
                <p className="flex items-center">
                  <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                  {organization.telefon || "Nije navedeno"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="flex items-center">
                  <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                  {organization.email || "Nije navedeno"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Dodatne informacije
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            {organization.namena ? (
              <div dangerouslySetInnerHTML={{ __html: organization.namena }} />
            ) : (
              <p className="text-muted-foreground italic">Nema dodatnih informacija o ovoj organizaciji.</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Istorija promjena
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="ml-2">Učitavanje istorije...</span>
            </div>
          ) : history.length > 0 ? (
            <OrganizationHistory history={history} />
          ) : (
            <p className="text-muted-foreground italic">Nema zabilježenih promjena.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
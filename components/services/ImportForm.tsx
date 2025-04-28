// /components/services/ImportForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Uvozimo AŽURIRANU Server Akciju za import servisa
import { importServices } from '@/actions/services/import'; // Akcija je ažurirana
// Uvozimo tip rezultata importa
import { CsvImportResult, CsvRowValidationResult } from '@/lib/types/csv-types'; // Tipovi su ažurirani
// Uvozimo UI komponente iz Shadcn UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area"; // Za prikaz liste grešaka ako je dugačka


// Zod šema za validaciju inputa fajla (jednostavno, samo da fajl postoji)
const formSchema = z.object({
    csvFile: z.instanceof(File).refine(file => file.size > 0, "CSV file is required."),
});

type ImportFormValues = z.infer<typeof formSchema>;


/**
 * Component for handling service CSV import form.
 * Allows user to select a CSV file and triggers the importServices action.
 * Displays import results, including errors.
 * Usklađena sa importServices action i CsvImportResult tipom.
 */
export function ImportForm() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    // Stanje za prikaz rezultata importa
    const [importResult, setImportResult] = useState<CsvImportResult<any> | null>(null);


    // Definisanje forme sa zodResolver-om
    const form = useForm<ImportFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            csvFile: undefined, // Input tip 'file' počinje kao undefined
        },
    });

    // Rukovalac slanja forme
    const onSubmit = async (values: ImportFormValues) => {
        setIsLoading(true);
        setImportResult(null); // Resetuj prethodne rezultate

        const file = values.csvFile;

        // Čitanje sadržaja fajla kao teksta
        const reader = new FileReader();

        reader.onload = async (event) => {
            const csvContent = event.target?.result as string;

            if (!csvContent) {
                 toast({
                     title: 'Error',
                     description: 'Could not read CSV file content.',
                     variant: 'destructive',
                 });
                 setIsLoading(false);
                 return;
            }

            // Pozivanje AŽURIRANE Server Akcije za import
            const result = await importServices(csvContent); // Akcija vraća CsvImportResult + error string

            setIsLoading(false);
            setImportResult(result); // Postavi rezultat importa

            if (result?.error) {
                // Prikaz opšte greške ili grešaka na nivou fajla
                toast({
                    title: 'Import Failed or Completed with Errors',
                    description: result.error || 'An error occurred during import.',
                    variant: 'destructive',
                });
            } else {
                // Prikaz uspeha (čak i ako ima neuspelih redova validacije)
                toast({
                    title: 'Import Processed',
                    description: `Import finished. ${result?.validRows.length ?? 0} valid rows, ${result?.invalidRows.length ?? 0} invalid rows.`,
                    // variant: result?.invalidRows.length > 0 ? 'warning' : 'success', // Može biti warning ako ima nevalidnih redova
                });
            }
        };

        reader.onerror = () => {
            setIsLoading(false);
            toast({
                 title: 'Error',
                 description: 'Failed to read file.',
                 variant: 'destructive',
             });
        };

        reader.readAsText(file); // Čitanje fajla kao teksta (za CSV)
    };


    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Import Services from CSV</CardTitle>
                <p className="text-sm text-muted-foreground">Upload a CSV file to import service data.</p>
                 {/* Opciono: Link za preuzimanje template CSV fajla */}
                 {/* <Button variant="link" className="p-0 mt-2 h-auto" asChild>
                      <a href="/templates/service_import_template.csv" download>Download CSV Template</a>
                 </Button> */}
            </CardHeader>
            <CardContent className="space-y-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Polje za odabir fajla */}
                        <FormField
                            control={form.control}
                            name="csvFile"
                            render={({ field: { value, onChange, ...fieldProps } }) => (
                                <FormItem>
                                    <FormLabel>CSV File</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...fieldProps}
                                            type="file"
                                            accept=".csv" // Prihvati samo CSV fajlove
                                            onChange={event => {
                                                // Setujemo fajl u formu
                                                onChange(event.target.files && event.target.files.length > 0 ? event.target.files[0] : undefined);
                                            }}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Dugme za slanje forme */}
                        <Button type="submit" disabled={isLoading || !form.formState.isValid}>
                            {isLoading ? 'Importing...' : 'Import CSV'}
                        </Button>
                    </form>
                </Form>

                {/* Prikaz rezultata importa */}
                {importResult && (
                    <div className="mt-6 space-y-4">
                        <h3 className="text-lg font-semibold">Import Results</h3>
                        <p className="text-sm text-muted-foreground">
                            Total rows processed: {importResult.totalRows}
                        </p>
                        <p className="text-sm text-green-600">
                            Valid rows for import: {importResult.validRows.length}
                        </p>
                         {importResult.createdCount !== undefined && ( // Prikaz broja kreiranih ako je akcija vratila createdCount
                              <p className="text-sm text-blue-600">
                                   Actually created: {importResult.createdCount}
                               </p>
                         )}
                        <p className="text-sm text-red-600">
                            Invalid rows: {importResult.invalidRows.length}
                        </p>
                        {importResult.importErrors.length > 0 && (
                            <p className="text-sm text-red-600">
                                File processing errors: {importResult.importErrors.length}
                            </p>
                        )}

                        {/* Prikaz detalja neuspelih redova validacije */}
                        {importResult.invalidRows.length > 0 && (
                             <div className="space-y-2">
                                 <h4 className="font-medium">Invalid Row Details ({importResult.invalidRows.length})</h4>
                                  {/* Koristimo ScrollArea ako je lista dugačka */}
                                 <ScrollArea className="h-48 border rounded-md">
                                     <Table>
                                         <TableHeader>
                                             <TableRow>
                                                 <TableHead className="w-[50px]">Row #</TableHead>
                                                 <TableHead>Original Data</TableHead>
                                                 <TableHead>Errors</TableHead>
                                             </TableRow>
                                         </TableHeader>
                                         <TableBody>
                                             {importResult.invalidRows.map((rowDetail, index) => (
                                                 <TableRow key={index}>
                                                     <TableCell>{rowDetail.rowIndex + 1}</TableCell>
                                                     <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                                                         {/* Prikaz originalnih podataka - konvertujte objekat u string */}
                                                         {JSON.stringify(rowDetail.originalRow)}
                                                     </TableCell>
                                                     <TableCell className="text-xs text-red-600 max-w-xs">
                                                         {/* Prikaz grešaka */}
                                                         {rowDetail.errors.join('; ')}
                                                     </TableCell>
                                                 </TableRow>
                                             ))}
                                         </TableBody>
                                     </Table>
                                 </ScrollArea>
                             </div>
                        )}

                         {/* Prikaz detalja grešaka na nivou fajla */}
                         {importResult.importErrors.length > 0 && (
                             <div className="space-y-2">
                                  <h4 className="font-medium">File Processing Errors ({importResult.importErrors.length})</h4>
                                   <ScrollArea className="h-24 border rounded-md p-2 text-sm text-red-600">
                                       <ul>
                                            {importResult.importErrors.map((err, index) => (
                                                 <li key={index}>{err}</li>
                                            ))}
                                        </ul>
                                   </ScrollArea>
                             </div>
                         )}
                    </div>
                )}

            </CardContent>
             {/* Opciono: CardFooter */}
             {/* <CardFooter>
                  <p className="text-xs text-muted-foreground">Make sure your CSV header matches the template.</p>
             </CardFooter> */}
        </Card>
    );
}
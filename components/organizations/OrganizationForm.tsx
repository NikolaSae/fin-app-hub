// components/organizations/OrganizationForm.tsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { HumanitarnaOrganizacija } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { sr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Validaciona šema za formu
const formSchema = z.object({
  naziv: z.string().min(2, { message: 'Naziv mora imati najmanje 2 karaktera' }),
  kratkiBroj: z.string().min(1, { message: 'Kratki broj je obavezan' }),
  ugovor: z.string().min(1, { message: 'Broj ugovora je obavezan' }),
  datumPocetka: z.date({ required_error: 'Datum početka je obavezan' }),
  datumIsteka: z.date({ required_error: 'Datum isteka je obavezan' }),
  racun: z.string().min(1, { message: 'Račun je obavezan' }),
  banka: z.string().min(1, { message: 'Banka je obavezna' }),
  pib: z.string().min(9, { message: 'PIB mora imati 9 cifara' }).max(9),
  mb: z.string().min(8, { message: 'Matični broj mora imati 8 cifara' }).max(8),
  namena: z.string().min(1, { message: 'Namena je obavezna' }),
});

type FormData = z.infer<typeof formSchema>;

interface OrganizationFormProps {
  organization?: HumanitarnaOrganizacija;
  onSubmit: (data: FormData) => void;
  isSubmitting: boolean;
}

export function OrganizationForm({ 
  organization, 
  onSubmit, 
  isSubmitting 
}: OrganizationFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: organization 
      ? {
          ...organization,
          datumPocetka: new Date(organization.datumPocetka),
          datumIsteka: new Date(organization.datumIsteka),
        }
      : {
          naziv: '',
          kratkiBroj: '',
          ugovor: '',
          datumPocetka: new Date(),
          datumIsteka: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          racun: '',
          banka: '',
          pib: '',
          mb: '',
          namena: '',
        },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="naziv"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Naziv organizacije</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="kratkiBroj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kratki broj</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="ugovor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Broj ugovora</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="datumPocetka"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Datum početka</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: sr })
                        ) : (
                          <span>Izaberite datum</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date("2000-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="datumIsteka"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Datum isteka</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: sr })
                        ) : (
                          <span>Izaberite datum</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="racun"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Račun</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="banka"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banka</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="pib"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PIB</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={9} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="mb"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matični broj</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={8} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="namena"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Namena</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline">
            Otkaži
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Čuvanje...' : organization ? 'Sačuvaj izmene' : 'Kreiraj organizaciju'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
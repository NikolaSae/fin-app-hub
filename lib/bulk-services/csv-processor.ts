///lib/bulk-services/csv-processor.ts


import { z } from "zod";
import { bulkServiceCSVRowSchema } from "@/schemas/bulk-service";
import { BulkServiceCSVData, BulkServiceImportResult } from "@/lib/types/bulk-service-types";
import Papa from "papaparse";

/**
 * Parse a CSV file containing bulk service data
 * @param file The CSV file to parse
 * @returns Promise with the parsed data and validation results
 */
export async function parseBulkServiceCSV(file: File): Promise<{
  data: BulkServiceCSVData[];
  errors: { row: number; error: string; data?: Record<string, any> }[];
}> {
  return new Promise((resolve, reject) => {
    // The results array will hold our validated data
    const validData: BulkServiceCSVData[] = [];
    const errorRows: { row: number; error: string; data?: Record<string, any> }[] = [];
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // Keep as strings for validation
      transformHeader: (header) => {
        // Normalize headers by trimming whitespace and converting to lowercase
        return header.trim().toLowerCase();
      },
      step: (results, parser) => {
        // Process each row as it's parsed
        const rowIndex = results.meta.cursor;
        
        try {
          // Attempt to validate the row using our schema
          const validatedRow = bulkServiceCSVRowSchema.parse(results.data);
          validData.push(validatedRow);
        } catch (error) {
          // If validation fails, record the error
          if (error instanceof z.ZodError) {
            // Format the error message
            const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
            errorRows.push({
              row: rowIndex,
              error: errorMessage,
              data: results.data as Record<string, any>
            });
          } else {
            // Unknown error
            errorRows.push({
              row: rowIndex,
              error: error instanceof Error ? error.message : 'Unknown error',
              data: results.data as Record<string, any>
            });
          }
        }
      },
      complete: () => {
        resolve({
          data: validData,
          errors: errorRows
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
}

/**
 * Format bulk service data for CSV export
 * @param data The bulk service data to format
 * @returns CSV string
 */
export function formatBulkServiceCSV(data: BulkServiceCSVData[]): string {
  return Papa.unparse(data, {
    header: true,
    delimiter: ",",
    newline: "\r\n"
  });
}

/**
 * Map bulk service data to database format
 * @param data The CSV data to map
 * @param providerMap Map of provider names to IDs
 * @param serviceMap Map of service names to IDs
 * @returns Mapped data ready for database insertion
 */
export function mapBulkServiceData(
  data: BulkServiceCSVData[],
  providerMap: Map<string, string>,
  serviceMap: Map<string, string>
): { data: any[]; unmappedProviders: Set<string>; unmappedServices: Set<string> } {
  const unmappedProviders = new Set<string>();
  const unmappedServices = new Set<string>();
  
  const mappedData = data.map(row => {
    // Look up provider ID
    const providerId = providerMap.get(row.provider_name.toLowerCase());
    if (!providerId) {
      unmappedProviders.add(row.provider_name);
    }
    
    // Look up service ID (based on service_name)
    const serviceId = serviceMap.get(row.service_name.toLowerCase());
    if (!serviceId) {
      unmappedServices.add(row.service_name);
    }
    
    return {
      provider_name: row.provider_name,
      agreement_name: row.agreement_name,
      service_name: row.service_name,
      step_name: row.step_name,
      sender_name: row.sender_name,
      requests: row.requests,
      message_parts: row.message_parts,
      providerId: providerId || "",
      serviceId: serviceId || ""
    };
  });
  
  return {
    data: mappedData.filter(item => item.providerId && item.serviceId),
    unmappedProviders,
    unmappedServices
  };
}

/**
 * Process bulk service import and return results
 * @param file The CSV file to import
 * @param providerMap Map of provider names to IDs
 * @param serviceMap Map of service names to IDs
 * @returns Import results
 */
export async function processBulkServiceImport(
  file: File,
  providerMap: Map<string, string>,
  serviceMap: Map<string, string>
): Promise<BulkServiceImportResult> {
  try {
    // Parse the CSV file
    const { data, errors: parseErrors } = await parseBulkServiceCSV(file);
    
    // Map the data to database format
    const { data: mappedData, unmappedProviders, unmappedServices } = mapBulkServiceData(
      data,
      providerMap,
      serviceMap
    );
    
    // Generate error details for unmapped entities
    const mappingErrors = [];
    
    for (const provider of unmappedProviders) {
      mappingErrors.push({
        row: -1, // No specific row
        error: `Provider not found: ${provider}`
      });
    }
    
    for (const service of unmappedServices) {
      mappingErrors.push({
        row: -1, // No specific row
        error: `Service not found: ${service}`
      });
    }
    
    // Combine all errors
    const allErrors = [...parseErrors, ...mappingErrors];
    
    return {
      imported: mappedData.length,
      errors: allErrors.length,
      errorDetails: allErrors.length > 0 ? allErrors : undefined
    };
  } catch (error) {
    return {
      imported: 0,
      errors: 1,
      errorDetails: [{
        row: -1,
        error: error instanceof Error ? error.message : "Unknown error occurred during import"
      }]
    };
  }
}

/**
 * Validate a single bulk service row
 * @param data The data to validate
 * @returns Validated data or throws an error
 */
export function validateBulkServiceRow(data: unknown): BulkServiceCSVData {
  return bulkServiceCSVRowSchema.parse(data);
}
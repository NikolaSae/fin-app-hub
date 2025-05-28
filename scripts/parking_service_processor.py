import pandas as pd
import csv
import glob
import os
import re
import logging
import psycopg2
import shutil
import sys
from datetime import datetime
sys.stdout.reconfigure(encoding='utf-8')

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

# Supabase DB parameters for PostgreSQL connection
DB_PARAMS = {
    "host": "aws-0-eu-central-1.pooler.supabase.com",
    "port": "6543",
    "dbname": "postgres",
    "user": "postgres.srrdkqjfynsdoqlxsohi",
    "password": os.getenv("SUPABASE_PASSWORD"),
}

# GitHub Codespace folder paths
PROJECT_ROOT = os.getcwd()
FOLDER_PATH = os.path.join(PROJECT_ROOT, "input/")
PROCESSED_FOLDER = os.path.join(PROJECT_ROOT, "processed/")
ERROR_FOLDER = os.path.join(PROJECT_ROOT, "errors/")
OUTPUT_FILE = os.path.join(PROJECT_ROOT, "data/parking_output.csv")

# Create folders if they don't exist
os.makedirs(FOLDER_PATH, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)
os.makedirs(ERROR_FOLDER, exist_ok=True)
os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

def test_database_connection():
    """Test connection to Supabase database"""
    try:
        logging.info("Testing database connection...")
        conn = psycopg2.connect(**DB_PARAMS)
        cur = conn.cursor()
        cur.execute("SELECT version();")
        version = cur.fetchone()
        logging.info(f"Connected to: {version[0]}")
        cur.close()
        conn.close()
        return True
    except Exception as e:
        logging.error(f"Database connection failed: {e}")
        logging.error("Please check your SUPABASE_PASSWORD environment variable")
        return False

def log_to_database(conn, entity_type, entity_id, action, subject, description=None, status='IN_PROGRESS', user_id=None):
    """Log actions to the database LogEntry table with proper error handling"""
    try:
        cur = conn.cursor()
        
        # If no user_id provided, use a default system user
        if not user_id:
            user_id = "system_user_id"
        
        # **FIX 1: Dodaj gen_random_uuid() za ID generaciju**
        log_sql = """
        INSERT INTO "LogEntry" (
            "id", "entityType", "entityId", "action", "subject", "description", 
            "status", "createdById", "createdAt", "updatedAt"
        ) VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        now = datetime.now()
        cur.execute(log_sql, (
            entity_type, entity_id, action, subject, description,
            status, user_id, now, now
        ))
        
        # **FIX 2: Separate commit za log entry**
        conn.commit()
        cur.close()
        logging.info(f"Log entry created: {subject}")
        
    except Exception as e:
        logging.error(f"Failed to create log entry: {e}")
        # **FIX 3: Rollback transaction ako je greška**
        try:
            conn.rollback()
        except:
            pass

def convert_to_float(val):
    """Konvertuje vrednost u float uklanjajući hiljadarske zareze, ako je moguće."""
    if isinstance(val, str):
        val = val.replace(",", "").strip()
        try:
            return float(val)
        except ValueError:
            logging.warning(f"Could not convert {val} to float.")
            return None
    try:
        return float(val)
    except:
        logging.warning(f"Could not convert {val} to float.")
        return None

def extract_parking_provider(filename):
    """Izvlači naziv parking provajdera iz naziva fajla."""
    try:
        match = re.search(r"_mParking_(.+?)_\d+__\d+_", filename)
        if match:
            provider_part = match.group(1)
            return provider_part.replace("_", " ")
        else:
            match = re.search(r"Servis__MicropaymentMerchantReport_(.+?)__\d+_", filename)
            if match:
                parts = match.group(1).split("_")
                if len(parts) >= 3:
                    return "_".join(parts[-3:-1]).replace("_", " ")
            
            logging.warning(f"Could not extract provider from filename: {filename}")
            return "unknown"
    except Exception as e:
        logging.error(f"Error extracting provider from {filename}: {e}")
        return "unknown"

def clean_date(date_val):
    """Popravlja format datuma: uklanja nevidljive znakove i prelamanje redova."""
    if isinstance(date_val, str):
        date_val = date_val.strip()
        date_val = re.sub(r'\s+', ' ', date_val)
        date_val = date_val.replace(" ", "")
        date_val = date_val.rstrip('.')
    return date_val

def get_or_create_parking_service(conn, provider_name):
    """Pronalazi ili kreira ParkingService na osnovu naziva provajdera"""
    try:
        cur = conn.cursor()
        
        # Pokušaj da pronađeš postojeći parking service
        cur.execute('SELECT "id" FROM "ParkingService" WHERE "name" = %s', (provider_name,))
        result = cur.fetchone()
        
        if result:
            parking_service_id = result[0]
            logging.info(f"Found existing parking service: {provider_name} (ID: {parking_service_id})")
            cur.close()
            return parking_service_id
        
        # **FIX 4: Kreiraj novi parking service u separate transaction**
        cur.execute('''
            INSERT INTO "ParkingService" ("id", "name", "isActive", "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), %s, true, %s, %s)
            RETURNING "id"
        ''', (provider_name, datetime.now(), datetime.now()))
        
        parking_service_id = cur.fetchone()[0]
        conn.commit()  # Commit immediately
        logging.info(f"Created new parking service: {provider_name} (ID: {parking_service_id})")
        cur.close()
        
        # **FIX 5: Log creation sa novom konekcijom da izbegnemo transaction conflicts**
        try:
            log_conn = psycopg2.connect(**DB_PARAMS)
            log_to_database(log_conn, 'PARKING_SERVICE', parking_service_id, 'ACTIVATION', 
                          f'Created parking service: {provider_name}', 
                          f'Automatically created during data import', 'FINISHED')
            log_conn.close()
        except Exception as log_e:
            logging.error(f"Failed to log parking service creation: {log_e}")
        
        return parking_service_id
        
    except Exception as e:
        logging.error(f"Error getting/creating parking service {provider_name}: {e}")
        try:
            conn.rollback()
        except:
            pass
        return None

def process_excel(input_file, conn):
    """Processes a single Excel file and returns a list of records for CSV."""
    try:
        df = pd.read_excel(input_file, sheet_name=3, header=None)
        rows = df.fillna("").values.tolist()
        
        if not rows:
            logging.warning(f"File {input_file} is empty.")
            return []

        header = [str(x).strip() for x in rows[0]]
        date_cols = header[3:-1] if header[-1].upper() == "TOTAL" else header[3:]

        current_group = "prepaid"
        output_records = []
        
        # Extract the provider from the filename
        provider_name = extract_parking_provider(os.path.basename(input_file))
        logging.info(f"Extracted provider: {provider_name}")
        
        # Get or create parking service
        parking_service_id = get_or_create_parking_service(conn, provider_name)
        if not parking_service_id:
            raise Exception(f"Could not get/create parking service for {provider_name}")

        i = 1
        while i < len(rows):
            row = [str(x).strip() for x in rows[i]]
            if not any(row):
                i += 1
                continue

            # Skip rows where the second column contains "total" (case-insensitive)
            if len(row) > 1 and "total" in row[1].lower():
                logging.debug(f"Skipping row due to 'total' in column B: {row}")
                i += 1
                continue

            # Skip header-like rows
            if i == 1 and ("servis" in row[0].lower() or "izveštaj" in row[0].lower()):
                i += 1
                continue

            # Check for group indicators
            for kw in ["prepaid", "postpaid", "total"]:
                if kw in row[0].lower():
                    current_group = kw
                    i += 1
                    break
            else:
                if row[0]:
                    service_name = row[0]
                    price = convert_to_float(row[1])

                    quantity_values = row[3:-1] if header[-1].upper() == "TOTAL" else row[3:]

                    if i + 1 < len(rows):
                        next_row = [str(x).strip() for x in rows[i+1]]
                        amount_values = next_row[3:-1] if header[-1].upper() == "TOTAL" else next_row[3:]
                    else:
                        amount_values = ["" for _ in range(len(date_cols))]

                    for j, date_val in enumerate(date_cols):
                        cleaned_date = clean_date(date_val)
                        quantity = convert_to_float(quantity_values[j]) if j < len(quantity_values) else None
                        amount = convert_to_float(amount_values[j]) if j < len(amount_values) else None
                        
                        # Only add records with meaningful data AND only prepaid
                        if quantity is not None and quantity > 0 and current_group == "prepaid":
                            record = {
                                "parkingServiceId": parking_service_id,
                                "group": current_group,
                                "serviceName": service_name,
                                "price": price,
                                "date": cleaned_date,
                                "quantity": quantity,
                                "amount": amount
                            }
                            logging.debug(f"Adding prepaid record: {record}")
                            output_records.append(record)
                    i += 2
                else:
                    i += 1

        logging.info(f"Processed {input_file}: {len(output_records)} prepaid records")
        return output_records
        
    except Exception as e:
        logging.error(f"Error processing file {input_file}: {e}")
        raise

def sanitize_parking_record(row):
    """Sanitize and validate the parking transaction record."""
    
    # Sanitize and format the date (dd.mm.yyyy) -> yyyy-mm-dd
    sanitized_date = row.get('date', '').replace('"', '').replace('\n', '').replace('\r', '') if row.get('date') else None
    
    # Convert date format
    if sanitized_date and len(sanitized_date) == 10:
        try:
            formatted_date = "-".join(sanitized_date.split(".")[::-1])
        except Exception as e:
            logging.warning(f"Error formatting date {sanitized_date}: {e}")
            formatted_date = None
    else:
        formatted_date = None

    # Validate numeric fields
    try:
        price = float(row.get('price', 0)) if row.get('price') is not None else 0.0
    except (ValueError, TypeError):
        price = 0.0

    try:
        quantity = float(row.get('quantity', 0)) if row.get('quantity') is not None else 0.0
    except (ValueError, TypeError):
        quantity = 0.0

    try:
        amount = float(row.get('amount', 0)) if row.get('amount') is not None else 0.0
    except (ValueError, TypeError):
        amount = 0.0

    return {
        "parkingServiceId": row.get("parkingServiceId"),
        'group': row.get('group', 'prepaid'),
        "serviceName": row.get("serviceName", ""),
        'price': price,
        'date': formatted_date,
        "quantity": quantity,
        'amount': amount
    }

def save_to_csv(data, output_file):
    """Save data to CSV file"""
    if not data:
        logging.warning("No data to save to CSV.")
        return

    fieldnames = ["parkingServiceId", "group", "serviceName", "price", "date", "quantity", "amount"]
    try:
        with open(output_file, "w", newline="", encoding="utf-8-sig") as fout:
            writer = csv.DictWriter(fout, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
            logging.info(f"Data saved to {output_file}")
    except Exception as e:
        logging.error(f"Error saving CSV: {e}")
        raise

def import_to_postgresql(csv_path, conn):
    """Import parking transactions to PostgreSQL with better error handling"""
    try:
        logging.info("Loading parking transactions from CSV...")
        
        # Read and process CSV data
        df = pd.read_csv(csv_path)
        
        # Sanitize each row - only prepaid records
        sanitized_data = []
        for _, row in df.iterrows():
            sanitized_row = sanitize_parking_record(row)
            # Only add rows with valid dates, positive quantities, and prepaid group
            if (sanitized_row['date'] and 
                sanitized_row['quantity'] > 0 and 
                sanitized_row['group'] == 'prepaid'):
                sanitized_data.append(sanitized_row)

        if not sanitized_data:
            logging.warning("No valid prepaid data to import.")
            return

        logging.info(f"Importing {len(sanitized_data)} prepaid parking transactions...")

        # **FIX 6: Process in batches and better error handling**
        cur = conn.cursor()
        inserted_count = 0
        updated_count = 0
        error_count = 0
        
        for i, record in enumerate(sanitized_data):
            try:
                upsert_sql = """
                INSERT INTO "ParkingTransaction" (
                    "id", "parkingServiceId", "date", "group", "serviceName", 
                    "price", "quantity", "amount", "createdAt"
                )
                VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT ("parkingServiceId", "date", "serviceName", "group")
                DO UPDATE SET
                    "price" = EXCLUDED."price",
                    "quantity" = EXCLUDED."quantity",
                    "amount" = EXCLUDED."amount"
                RETURNING (xmax = 0) AS inserted;
                """
                
                cur.execute(upsert_sql, (
                    record['parkingServiceId'],
                    record['date'],
                    record['group'],
                    record['serviceName'],
                    record['price'],
                    record['quantity'],
                    record['amount'],
                    datetime.now()
                ))
                
                result = cur.fetchone()
                if result and result[0]:  # xmax = 0 means INSERT
                    inserted_count += 1
                else:  # UPDATE
                    updated_count += 1
                
                # Commit every 50 records to avoid large transactions
                if (i + 1) % 50 == 0:
                    conn.commit()
                    logging.info(f"Processed {i + 1}/{len(sanitized_data)} records...")
                    
            except Exception as e:
                logging.error(f"Error inserting record {i+1}/{len(sanitized_data)}: {e}")
                error_count += 1
                # Rollback and continue with next record
                try:
                    conn.rollback()
                    cur = conn.cursor()  # Get new cursor after rollback
                except:
                    pass
                continue

        # Final commit
        try:
            conn.commit()
        except Exception as e:
            logging.error(f"Final commit failed: {e}")
            
        cur.close()
        
        logging.info(f"Import completed: {inserted_count} inserted, {updated_count} updated, {error_count} errors (prepaid only)")
        
        # **FIX 7: Log with separate connection**
        try:
            log_conn = psycopg2.connect(**DB_PARAMS)
            log_to_database(log_conn, 'PARKING_SERVICE', 'bulk_import', 'NOTE', 
                           f'Prepaid parking transactions import completed',
                           f'Imported {inserted_count} new prepaid records, updated {updated_count} records, {error_count} errors',
                           'FINISHED')
            log_conn.close()
        except Exception as log_e:
            logging.error(f"Failed to log import completion: {log_e}")

    except Exception as e:
        logging.error(f"Error importing to PostgreSQL: {e}")
        raise

def move_file(source_path, destination_folder, success=True):
    """Move processed file to appropriate folder"""
    try:
        filename = os.path.basename(source_path)
        if success:
            destination_path = os.path.join(destination_folder, filename)
            folder_name = "processed"
        else:
            destination_path = os.path.join(destination_folder, filename)
            folder_name = "errors"
        
        shutil.move(source_path, destination_path)
        logging.info(f"File moved to {folder_name}: {filename}")
    except Exception as e:
        logging.error(f"Error moving file {source_path}: {e}")

def process_all_files():
    """Main function to process all parking service files"""
    
    # First test database connection
    if not test_database_connection():
        logging.error("Cannot proceed without database connection. Please set SUPABASE_PASSWORD environment variable.")
        return
    
    file_pattern = os.path.join(FOLDER_PATH, "Servis__MicropaymentMerchantReport_*mParking*.xls*")
    files = glob.glob(file_pattern)
    
    if not files:
        logging.info(f"No parking service files found in: {FOLDER_PATH}")
        logging.info("Please place your Excel files in the scripts/input/ folder")
        return

    logging.info(f"Found {len(files)} parking service files to process")
    
    all_data = []
    processed_files = []
    error_files = []

    for file_path in files:
        # **FIX 8: Koristi separate konekcije za svaki fajl**
        conn = None
        try:
            conn = psycopg2.connect(**DB_PARAMS)
            logging.info(f"Processing: {file_path}")
            
            # Process the Excel file
            file_data = process_excel(file_path, conn)
            all_data.extend(file_data)
            processed_files.append(file_path)
            
            # Log successful processing with separate connection
            try:
                log_conn = psycopg2.connect(**DB_PARAMS)
                filename = os.path.basename(file_path)
                log_to_database(log_conn, 'PARKING_SERVICE', filename, 'NOTE',
                              f'Successfully processed file: {filename}',
                              f'Extracted {len(file_data)} prepaid parking transaction records',
                              'FINISHED')
                log_conn.close()
            except Exception as log_e:
                logging.error(f"Failed to log file processing: {log_e}")
            
        except Exception as e:
            logging.error(f"Failed to process {file_path}: {e}")
            error_files.append(file_path)
            
            # Log error with separate connection
            try:
                log_conn = psycopg2.connect(**DB_PARAMS)
                filename = os.path.basename(file_path)
                log_to_database(log_conn, 'PARKING_SERVICE', filename, 'NOTE',
                              f'Failed to process file: {filename}',
                              f'Error: {str(e)}', 'FINISHED')
                log_conn.close()
            except Exception as log_e:
                logging.error(f"Failed to log file error: {log_e}")
        
        finally:
            if conn:
                conn.close()

    # Save all data to CSV and import
    if all_data:
        import_conn = None
        try:
            save_to_csv(all_data, OUTPUT_FILE)
            
            # Import to database with fresh connection
            import_conn = psycopg2.connect(**DB_PARAMS)
            import_to_postgresql(OUTPUT_FILE, import_conn)
            
            # Move successfully processed files
            for file_path in processed_files:
                move_file(file_path, PROCESSED_FOLDER, success=True)
            
        except Exception as e:
            logging.error(f"Error in data processing/import: {e}")
            # Move all files to error folder if import fails
            for file_path in processed_files:
                move_file(file_path, ERROR_FOLDER, success=False)
        finally:
            if import_conn:
                import_conn.close()
    
    # Move error files
    for file_path in error_files:
        move_file(file_path, ERROR_FOLDER, success=False)
    
    # Final summary
    logging.info(f"Processing completed:")
    logging.info(f"  - Successfully processed: {len(processed_files)} files")
    logging.info(f"  - Failed: {len(error_files)} files")
    logging.info(f"  - Total records: {len(all_data)}")

if __name__ == "__main__":
    # Print current working directory and folder structure
    print(f"Current working directory: {os.getcwd()}")
    print(f"Input folder: {FOLDER_PATH}")
    print(f"Expected folder structure:")
    print(f"  - scripts/python/input/     (place Excel files here)")
    print(f"  - scripts/python/processed/ (processed files)")
    print(f"  - scripts/python/errors/    (error files)")
    print(f"  - scripts/python/data/      (output CSV)")
    print(f"Make sure to set SUPABASE_PASSWORD environment variable!")
    print("=" * 50)
    
    process_all_files()
    print("✅ Parking service data processing completed!")
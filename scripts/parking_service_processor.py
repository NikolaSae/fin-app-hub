import uuid
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
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    stream=sys.stdout
)


def get_db_params():
    """Get database parameters with environment variable read at runtime"""
    # Supabase connection (commented out)
    # password = os.getenv("SUPABASE_PASSWORD")
    # if not password:
    #     raise ValueError("SUPABASE_PASSWORD environment variable is not set")
    # 
    # return {
    #     "host": "aws-0-eu-central-1.pooler.supabase.com",
    #     "port": "6543",
    #     "dbname": "postgres",
    #     "user": "postgres.srrdkqjfynsdoqlxsohi",
    #     "password": password,
    # }

    # Local PostgreSQL connection
    return {
        "host": "localhost",
        "port": "5432",
        "dbname": "findatbas-copy",
        "user": "postgres",
        "password": "postgres"  # Use your actual local password
    }

# GitHub Codespace folder paths
PROJECT_ROOT = os.getcwd()
FOLDER_PATH = os.path.join(PROJECT_ROOT, "scripts/input/")
PROCESSED_FOLDER = os.path.join(PROJECT_ROOT, "scripts/processed/")
ERROR_FOLDER = os.path.join(PROJECT_ROOT, "scripts/errors/")
OUTPUT_FILE = os.path.join(PROJECT_ROOT, "scripts/data/parking_output.csv")

# Create folders if they don't exist
os.makedirs(FOLDER_PATH, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)
os.makedirs(ERROR_FOLDER, exist_ok=True)
os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

def extract_service_code(service_name):
    """Extract first four digits from serviceName - finds ANY 4 consecutive digits"""
    if not service_name:
        return service_name
    
    # Pattern to find any 4 consecutive digits
    pattern = r'\d{4}'
    match = re.search(pattern, str(service_name))
    
    if match:
        extracted_code = match.group()
        logging.debug(f"Extracted service code '{extracted_code}' from '{service_name}'")
        return extracted_code
    else:
        logging.warning(f"Could not extract 4-digit code from: {service_name}")
        return str(service_name)  # Return original if no 4 digits found

def test_database_connection():
    """Test connection to Supabase database"""
    try:
        logging.info("Testing database connection...")
        db_params = get_db_params()
        conn = psycopg2.connect(**db_params)
        cur = conn.cursor()
        cur.execute("SELECT version();")
        version = cur.fetchone()
        logging.info(f"Connected to: {version[0]}")
        cur.close()
        conn.close()
        return True
    except ValueError as e:
        logging.error(f"Configuration error: {e}")
        return False
    except Exception as e:
        logging.error(f"Database connection failed: {e}")
        logging.error("Please check your SUPABASE_PASSWORD environment variable")
        return False

def get_current_user():
    """Dobavi user ID iz argumenata komandne linije ili sistema"""
    if len(sys.argv) > 1:
        user_id = sys.argv[1]
        logging.info(f"Using authenticated user ID: {user_id}")
        return user_id
    
    logging.warning("No user ID provided, falling back to system user")
    return get_or_create_system_user()

def get_or_create_system_user():
    """Get or create system user for logging purposes - fallback only"""
    try:
        db_params = get_db_params()
        conn = psycopg2.connect(**db_params)
        cur = conn.cursor()
        
        # Try to find existing system user
        cur.execute('SELECT "id" FROM "User" WHERE "email" = %s', ('system@internal.app',))
        result = cur.fetchone()
        
        if result:
            user_id = result[0]
            logging.debug(f"Found existing system user: {user_id}")
            cur.close()
            conn.close()
            return user_id
        
        # Create system user if it doesn't exist
        cur.execute('''
            INSERT INTO "User" ("id", "name", "email", "role", "isActive", "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), 'System User', 'system@internal.app', 'ADMIN', true, %s, %s)
            RETURNING "id"
        ''', (datetime.now(), datetime.now()))
        
        user_id = cur.fetchone()[0]
        conn.commit()
        logging.info(f"Created system user: {user_id}")
        cur.close()
        conn.close()
        return user_id
        
    except Exception as e:
        logging.error(f"Error getting/creating system user: {e}")
        return None

def log_to_database(conn, entity_type, entity_id, action, subject, description=None, severity='INFO', user_id=None):
    """Log actions to the ActivityLog table"""
    try:
        cur = conn.cursor()
        
        # Get current user if not provided
        if not user_id:
            user_id = get_current_user()
            if not user_id:
                logging.error("Cannot create log entry without valid user ID")
                return
        
        # Prepare details
        details = f"{subject}"
        if description:
            details += f": {description}"
        
        # Generate a new UUID for the log entry
        log_id = str(uuid.uuid4())
        
        log_sql = """
        INSERT INTO "ActivityLog" (
            "id", "action", "entityType", "entityId", "details", 
            "severity", "userId", "createdAt"
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        now = datetime.now()
        cur.execute(log_sql, (
            log_id,
            action,
            entity_type,
            entity_id,
            details,
            severity,
            user_id,
            now
        ))
        
        conn.commit()
        logging.info(f"ActivityLog created: {log_id} - {action} - {entity_type}")
        return log_id
        
    except Exception as e:
        logging.error(f"Failed to create ActivityLog: {e}")
        try:
            conn.rollback()
        except:
            pass
        return None

def get_or_create_service(conn, service_code, service_type='PARKING', billing_type='PREPAID'):
    """Find or create Service based on extracted 4-digit code with proper billing type"""
    try:
        cur = conn.cursor()
        created = False
        
        # Try to find existing service by name (4-digit code)
        cur.execute('SELECT "id" FROM "Service" WHERE "name" = %s', (service_code,))
        result = cur.fetchone()
        
        if result:
            service_id = result[0]
            logging.info(f"Found existing service: {service_code} (ID: {service_id})")
            cur.close()
            return service_id, created
        
        # Create new service with proper billing type
        created = True
        cur.execute('''
            INSERT INTO "Service" ("id", "name", "type", "billingType", "description", "isActive", "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), %s, %s, %s, %s, true, %s, %s)
            RETURNING "id"
        ''', (service_code, service_type, billing_type, f'Auto-created parking service: {service_code}', datetime.now(), datetime.now()))
        
        service_id = cur.fetchone()[0]
        conn.commit()
        logging.info(f"Created new service: {service_code} (ID: {service_id}) with billing type: {billing_type}")
        cur.close()
        
        return service_id, created
        
    except Exception as e:
        logging.error(f"Error getting/creating service {service_code}: {e}")
        try:
            conn.rollback()
        except:
            pass
        return None, False

def get_or_create_parking_service(conn, provider_name):
    """Find or create ParkingService based on provider name"""
    try:
        cur = conn.cursor()
        created = False
        
        # Try to find existing parking service
        cur.execute('SELECT "id" FROM "ParkingService" WHERE "name" = %s', (provider_name,))
        result = cur.fetchone()
        
        if result:
            parking_service_id = result[0]
            logging.info(f"Found existing parking service: {provider_name} (ID: {parking_service_id})")
            cur.close()
            return parking_service_id, created
        
        # Create new parking service
        created = True
        cur.execute('''
            INSERT INTO "ParkingService" ("id", "name", "isActive", "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), %s, true, %s, %s)
            RETURNING "id"
        ''', (provider_name, datetime.now(), datetime.now()))
        
        parking_service_id = cur.fetchone()[0]
        conn.commit()
        logging.info(f"Created new parking service: {provider_name} (ID: {parking_service_id})")
        cur.close()
        
        return parking_service_id, created
        
    except Exception as e:
        logging.error(f"Error getting/creating parking service {provider_name}: {e}")
        try:
            conn.rollback()
        except:
            pass
        return None, False

def get_or_create_service_contract(conn, service_id, parking_service_id):
    """Create connection between Service and ParkingService via Contract table"""
    try:
        cur = conn.cursor()
        created = False
        
        # Get current user for contract creation
        current_user_id = get_current_user()
        if not current_user_id:
            logging.error("Cannot create contract without current user")
            return None, created
        
        # Check if active contract already exists for this parking service
        cur.execute('''
            SELECT "id" FROM "Contract" 
            WHERE "parkingServiceId" = %s AND "type" = 'PARKING' AND "status" = 'ACTIVE'
        ''', (parking_service_id,))
        
        result = cur.fetchone()
        if result:
            contract_id = result[0]
            logging.info(f"Found existing contract for parking service: {contract_id}")
            
            # Check if ServiceContract already exists for this service
            cur.execute('''
                SELECT "id" FROM "ServiceContract" 
                WHERE "contractId" = %s AND "serviceId" = %s
            ''', (contract_id, service_id))
            
            service_contract_result = cur.fetchone()
            if service_contract_result:
                service_contract_id = service_contract_result[0]
                logging.info(f"ServiceContract already exists: {service_contract_id}")
                cur.close()
                return service_contract_id, created
            
            # Create ServiceContract if it doesn't exist
            created = True
            cur.execute('''
                INSERT INTO "ServiceContract" ("id", "contractId", "serviceId", "createdAt", "updatedAt")
                VALUES (gen_random_uuid(), %s, %s, %s, %s)
                RETURNING "id"
            ''', (contract_id, service_id, datetime.now(), datetime.now()))
            
            service_contract_id = cur.fetchone()[0]
            conn.commit()
            logging.info(f"Created ServiceContract: {service_contract_id}")
            cur.close()
            return service_contract_id, created
        
        # If no contract exists, create it
        created = True
        # First create basic contract
        cur.execute('''
            INSERT INTO "Contract" (
                "id", "name", "contractNumber", "type", "status", "startDate", "endDate", 
                "revenuePercentage", "parkingServiceId", "createdAt", "updatedAt", "createdById"
            )
            VALUES (gen_random_uuid(), %s, %s, 'PARKING', 'ACTIVE', %s, %s, %s, %s, %s, %s, %s)
            RETURNING "id"
        ''', (
            f'Auto-generated contract for parking service',
            f'AUTO-PARKING-{parking_service_id[:8]}-{datetime.now().strftime("%Y%m%d")}',
            datetime.now(),
            datetime.now().replace(year=datetime.now().year + 1),
            10.0,
            parking_service_id,
            datetime.now(),
            datetime.now(),
            current_user_id
        ))
        
        contract_id = cur.fetchone()[0]
        
        # Then create ServiceContract
        cur.execute('''
            INSERT INTO "ServiceContract" ("id", "contractId", "serviceId", "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), %s, %s, %s, %s)
            RETURNING "id"
        ''', (contract_id, service_id, datetime.now(), datetime.now()))
        
        service_contract_id = cur.fetchone()[0]
        conn.commit()
        
        logging.info(f"Created new contract: {contract_id} and ServiceContract: {service_contract_id}")
        cur.close()
        
        return service_contract_id, created
        
    except Exception as e:
        logging.error(f"Error creating service contract: {e}")
        try:
            conn.rollback()
        except:
            pass
        return None, False

def convert_to_float(val):
    """Convert value to float removing thousand separators if possible."""
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
    """Extract parking provider name from filename."""
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
    """Fix date format: remove invisible characters and line breaks."""
    if isinstance(date_val, str):
        date_val = date_val.strip()
        date_val = re.sub(r'\s+', ' ', date_val)
        date_val = date_val.replace(" ", "")
        date_val = date_val.rstrip('.')
    return date_val

def convert_date_format(date_str):
    """Convert DD.MM.YYYY to YYYY-MM-DD format for PostgreSQL"""
    if not date_str:
        return None
    
    try:
        # Clean the date string
        cleaned_date = clean_date(str(date_str))
        
        # Try to parse DD.MM.YYYY format
        if '.' in cleaned_date:
            parts = cleaned_date.split('.')
            if len(parts) == 3:
                day, month, year = parts
                # Return in YYYY-MM-DD format
                formatted_date = f"{year}-{month.zfill(2)}-{day.zfill(2)}"
                logging.debug(f"Converted date {cleaned_date} to {formatted_date}")
                return formatted_date
        
        logging.warning(f"Could not convert date format: {cleaned_date}")
        return None
        
    except Exception as e:
        logging.error(f"Error converting date {date_str}: {e}")
        return None

def sanitize_parking_record(row):
    """Sanitizes a parking record for database insertion"""
    try:
        # Extract service code from serviceName
        original_service_name = str(row.get('serviceName', ''))
        service_code = extract_service_code(original_service_name)
        
        return {
            'parkingServiceId': row.get('parkingServiceId', ''),
            'serviceId': row.get('serviceId', ''),
            'date': convert_date_format(row.get('date', '')),
            'group': str(row.get('group', '')),
            'serviceName': service_code,  # Use extracted 4-digit code
            'originalServiceName': original_service_name,  # Keep original for reference
            'price': convert_to_float(row.get('price', 0)) or 0,
            'quantity': convert_to_float(row.get('quantity', 0)) or 0,
            'amount': convert_to_float(row.get('amount', 0)) or 0
        }
    except Exception as e:
        logging.error(f"Error sanitizing record: {e}")
        return None

def process_excel(input_file, conn):
    """Processes a single Excel file and returns a list of records for CSV."""
    try:
        # Get current user for logging
        current_user_id = get_current_user()
        if not current_user_id:
            logging.error("No valid user ID available for logging")
            return []
        
        # Log start of processing
        log_to_database(
            conn,
            entity_type="System",
            entity_id="start",
            action="PROCESS_START",
            subject=f"Started processing {os.path.basename(input_file)}",
            user_id=current_user_id
        )
        
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
        parking_service_id, ps_created = get_or_create_parking_service(conn, provider_name)
        if not parking_service_id:
            raise Exception(f"Could not get/create parking service for {provider_name}")

        # Log parking service creation (only if created)
        if ps_created:
            log_to_database(
                conn,
                entity_type="ParkingService",
                entity_id=parking_service_id,
                action="CREATE",
                subject=f"Created parking service for {provider_name}",
                user_id=current_user_id
            )
        else:
            logging.info(f"Using existing parking service: {parking_service_id}")

        # Track unique service codes for this file
        service_codes_in_file = set()

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
                    # Extract service code for Service creation
                    service_code = extract_service_code(service_name)
                    service_codes_in_file.add(service_code)
                    
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
                                "serviceId": None,  # Will be set later
                                "group": current_group,
                                "serviceName": service_name,
                                "serviceCode": service_code,  # Add service code
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

        # Create Service records for each unique service code found in this file
        service_id_mapping = {}
        for service_code in service_codes_in_file:
            service_id, service_created = get_or_create_service(conn, service_code, 'PARKING', 'PREPAID')
            if service_id:
                service_id_mapping[service_code] = service_id
                
                # Log service creation (only if created)
                if service_created:
                    log_to_database(
                        conn,
                        entity_type="Service",
                        entity_id=service_id,
                        action="CREATE",
                        subject=f"Created service {service_code}",
                        user_id=current_user_id
                    )
                else:
                    logging.info(f"Using existing service: {service_code} (ID: {service_id})")
                
                # Create connection between Service and ParkingService via Contract
                service_contract_id, contract_created = get_or_create_service_contract(conn, service_id, parking_service_id)
                if service_contract_id:
                    # Log service contract creation/link (only if created)
                    if contract_created:
                        action = "CREATE"
                        subject = f"Created service contract for {service_code}"
                        log_to_database(
                            conn,
                            entity_type="ServiceContract",
                            entity_id=service_contract_id,
                            action=action,
                            subject=subject,
                            user_id=current_user_id
                        )
                    else:
                        logging.info(f"Service contract already exists for service: {service_code}")
                else:
                    logging.warning(f"Could not create service contract for {service_code}")

        # Update records with correct serviceId
        for record in output_records:
            service_code = record.get('serviceCode')
            if service_code in service_id_mapping:
                record['serviceId'] = service_id_mapping[service_code]
            # Remove serviceCode as it's not needed in final output
            record.pop('serviceCode', None)

        logging.info(f"Processed {input_file}: {len(output_records)} prepaid records, {len(service_codes_in_file)} unique services")
        
        # Log successful completion
        log_to_database(
            conn,
            entity_type="System",
            entity_id="complete",
            action="PROCESS_COMPLETE",
            subject=f"Successfully processed {os.path.basename(input_file)}",
            description=f"Created {len(output_records)} parking records",
            user_id=current_user_id
        )
        
        return output_records
        
    except Exception as e:
        logging.error(f"Error processing file {input_file}: {e}")
        # Log error to database
        log_to_database(
            conn,
            entity_type="System",
            entity_id="error",
            action="PROCESS_ERROR",
            subject=f"Error processing {os.path.basename(input_file)}",
            description=str(e),
            severity="ERROR",
            user_id=current_user_id
        )
        raise

def save_to_csv(data, output_file):
    """Save data to CSV file"""
    if not data:
        logging.warning("No data to save to CSV.")
        return

    fieldnames = ["parkingServiceId", "serviceId", "group", "serviceName", "price", "date", "quantity", "amount"]
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
            if (sanitized_row and sanitized_row['date'] and 
                sanitized_row['quantity'] > 0 and 
                sanitized_row['group'] == 'prepaid'):
                sanitized_data.append(sanitized_row)

        if not sanitized_data:
            logging.warning("No valid prepaid data to import.")
            return

        logging.info(f"Importing {len(sanitized_data)} prepaid parking transactions...")

        # Process in batches and better error handling
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
                    record['serviceName'],  # Now contains 4-digit code
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
    
    # Ensure current user exists
    current_user_id = get_current_user()
    if not current_user_id:
        logging.error("Cannot proceed without current user.")
        return
    
    file_pattern = os.path.join(FOLDER_PATH, "Servis__MicropaymentMerchantReport_*mParking*.xls*")
    files = glob.glob(file_pattern)
    
    if not files:
        logging.info(f"No parking service files found in: {FOLDER_PATH}")
        logging.info("Please place your Excel files in the input/ folder")
        return

    logging.info(f"Found {len(files)} parking service files to process")
    
    all_data = []
    processed_files = []
    error_files = []

    for file_path in files:
        # Use separate connections for each file
        conn = None
        try:
            db_params = get_db_params()
            conn = psycopg2.connect(**db_params)
            logging.info(f"Processing: {file_path}")
            
            # Process the Excel file
            file_data = process_excel(file_path, conn)
            all_data.extend(file_data)
            processed_files.append(file_path)
            
        except Exception as e:
            logging.error(f"Failed to process {file_path}: {e}")
            error_files.append(file_path)
            
        finally:
            if conn:
                conn.close()

    # Save all data to CSV and import
    if all_data:
        import_conn = None
        try:
            save_to_csv(all_data, OUTPUT_FILE)
            
            # Import to database with fresh connection
            db_params = get_db_params()
            import_conn = psycopg2.connect(**db_params)
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
    print(f"  - input/     (place Excel files here)")
    print(f"  - processed/ (processed files)")
    print(f"  - errors/    (error files)")
    print(f"  - data/      (output CSV)")
    print(f"Make sure to set SUPABASE_PASSWORD environment variable!")
    print(f"Set CURRENT_USER_ID")
    print("=" * 50)
    
    process_all_files()   
    print("✅ Skripta pokrenuta!", flush=True)
    print("✅ Parking service data processing completed!")
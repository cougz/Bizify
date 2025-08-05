import json
import csv
import io
import zipfile
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from pydantic import ValidationError

from app import models, schemas, crud
from app.auth import get_password_hash


class ImportService:
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id
        self.errors = []
        self.warnings = []
        self.import_stats = schemas.ImportStats()
    
    def preview_import(self, file_data: bytes, format: str, filename: str) -> schemas.ImportPreview:
        """Preview import without making changes"""
        try:
            # Parse the file
            data = self._parse_file(file_data, format, filename)
            
            # Validate data structure
            validation_errors = self._validate_data_structure(data)
            
            # Check for conflicts and issues
            conflicts = []
            warnings = []
            
            # Check customers
            total_customers = 0
            if "customers" in data:
                total_customers = len(data["customers"])
                for customer in data["customers"]:
                    if not customer.get("email"):
                        validation_errors.append(f"Customer '{customer.get('name', 'Unknown')}' missing email")
                        continue
                    
                    existing = self.db.query(models.Customer).filter(
                        models.Customer.email == customer["email"],
                        models.Customer.user_id == self.user_id
                    ).first()
                    
                    if existing:
                        conflicts.append({
                            "type": "customer",
                            "identifier": customer["email"],
                            "existing_name": existing.name,
                            "new_name": customer.get("name", ""),
                            "action": "update"
                        })
            
            # Check invoices
            total_invoices = 0
            if "invoices" in data:
                total_invoices = len(data["invoices"])
                for invoice in data["invoices"]:
                    if not invoice.get("invoice_number"):
                        validation_errors.append(f"Invoice missing invoice_number")
                        continue
                    
                    existing = self.db.query(models.Invoice).filter(
                        models.Invoice.invoice_number == invoice["invoice_number"],
                        models.Invoice.user_id == self.user_id
                    ).first()
                    
                    if existing:
                        conflicts.append({
                            "type": "invoice",
                            "identifier": invoice["invoice_number"],
                            "existing_status": existing.status.value,
                            "new_status": invoice.get("status", ""),
                            "action": "skip or update"
                        })
                    
                    # Check if customer exists
                    customer_email = invoice.get("customer_email")
                    if customer_email:
                        customer_in_import = any(
                            c.get("email") == customer_email 
                            for c in data.get("customers", [])
                        )
                        customer_in_db = self.db.query(models.Customer).filter(
                            models.Customer.email == customer_email,
                            models.Customer.user_id == self.user_id
                        ).first()
                        
                        if not customer_in_import and not customer_in_db:
                            warnings.append(
                                f"Invoice {invoice['invoice_number']} references "
                                f"customer {customer_email} which doesn't exist"
                            )
            
            # Check settings
            has_settings = "settings" in data and data["settings"] is not None
            if has_settings:
                existing_settings = crud.get_settings(self.db, self.user_id)
                if existing_settings:
                    conflicts.append({
                        "type": "settings",
                        "identifier": "company_settings",
                        "existing_company": existing_settings.company_name,
                        "new_company": data["settings"].get("company_name", ""),
                        "action": "replace"
                    })
            
            return schemas.ImportPreview(
                total_customers=total_customers,
                total_invoices=total_invoices,
                has_settings=has_settings,
                conflicts=conflicts,
                validation_errors=validation_errors,
                warnings=warnings
            )
            
        except Exception as e:
            return schemas.ImportPreview(
                total_customers=0,
                total_invoices=0,
                has_settings=False,
                conflicts=[],
                validation_errors=[f"Failed to parse file: {str(e)}"],
                warnings=[]
            )
    
    def import_data(self, file_data: bytes, format: str, filename: str, options: schemas.ImportOptions) -> schemas.ImportResult:
        """Import data with transaction support"""
        try:
            # Reset stats and errors
            self.errors = []
            self.warnings = []
            self.import_stats = schemas.ImportStats()
            
            # Parse the file
            data = self._parse_file(file_data, format, filename)
            
            # Validate version compatibility
            if "export_version" in data:
                self._validate_version(data["export_version"])
            
            # Start transaction
            # Import settings first
            if "settings" in data and options.import_settings and data["settings"]:
                self._import_settings(data["settings"])
            
            # Import customers (invoices depend on them)
            customer_map = {}
            if "customers" in data and options.import_customers:
                customer_map = self._import_customers(
                    data["customers"], 
                    options.update_existing
                )
            
            # Import invoices
            if "invoices" in data and options.import_invoices:
                self._import_invoices(
                    data["invoices"], 
                    customer_map,
                    options.skip_duplicates,
                    options.update_existing
                )
            
            # Commit transaction
            self.db.commit()
            
            # Create success message
            message_parts = []
            if self.import_stats.customers_created > 0:
                message_parts.append(f"{self.import_stats.customers_created} customers created")
            if self.import_stats.customers_updated > 0:
                message_parts.append(f"{self.import_stats.customers_updated} customers updated")
            if self.import_stats.invoices_created > 0:
                message_parts.append(f"{self.import_stats.invoices_created} invoices created")
            if self.import_stats.settings_updated:
                message_parts.append("company settings updated")
            
            message = "Successfully imported: " + ", ".join(message_parts) if message_parts else "No data imported"
            
            return schemas.ImportResult(
                success=True,
                message=message,
                stats=self.import_stats,
                errors=self.errors,
                warnings=self.warnings
            )
            
        except Exception as e:
            self.db.rollback()
            return schemas.ImportResult(
                success=False,
                message=f"Import failed: {str(e)}",
                stats=self.import_stats,
                errors=self.errors + [str(e)],
                warnings=self.warnings
            )
    
    def _parse_file(self, file_data: bytes, format: str, filename: str) -> Dict[str, Any]:
        """Parse uploaded file based on format"""
        if format.lower() == "json" or filename.endswith('.json'):
            return json.loads(file_data.decode('utf-8'))
        elif format.lower() == "zip" or filename.endswith('.zip'):
            return self._parse_zip_file(file_data)
        else:
            raise ValueError(f"Unsupported file format: {format}")
    
    def _parse_zip_file(self, file_data: bytes) -> Dict[str, Any]:
        """Parse ZIP file (backup format)"""
        with zipfile.ZipFile(io.BytesIO(file_data), 'r') as zip_file:
            # Look for main data file
            data_file = None
            for filename in zip_file.namelist():
                if filename.endswith('.json') and 'data' in filename.lower():
                    data_file = filename
                    break
            
            if not data_file:
                # Fallback to any JSON file
                json_files = [f for f in zip_file.namelist() if f.endswith('.json')]
                if json_files:
                    data_file = json_files[0]
            
            if not data_file:
                raise ValueError("No JSON data file found in ZIP archive")
            
            with zip_file.open(data_file) as f:
                return json.loads(f.read().decode('utf-8'))
    
    def _validate_version(self, version: str):
        """Validate export version compatibility"""
        supported_versions = ["1.0"]
        if version not in supported_versions:
            raise ValueError(f"Unsupported export version: {version}. Supported versions: {supported_versions}")
    
    def _validate_data_structure(self, data: Dict[str, Any]) -> List[str]:
        """Validate the basic structure of import data"""
        errors = []
        
        if not isinstance(data, dict):
            errors.append("Invalid data format: expected JSON object")
            return errors
        
        # Check for required fields in customers
        if "customers" in data:
            if not isinstance(data["customers"], list):
                errors.append("Customers data must be a list")
            else:
                for i, customer in enumerate(data["customers"]):
                    if not isinstance(customer, dict):
                        errors.append(f"Customer {i+1} must be an object")
                        continue
                    if not customer.get("name"):
                        errors.append(f"Customer {i+1} missing required field: name")
                    if not customer.get("email"):
                        errors.append(f"Customer {i+1} missing required field: email")
        
        # Check for required fields in invoices
        if "invoices" in data:
            if not isinstance(data["invoices"], list):
                errors.append("Invoices data must be a list")
            else:
                for i, invoice in enumerate(data["invoices"]):
                    if not isinstance(invoice, dict):
                        errors.append(f"Invoice {i+1} must be an object")
                        continue
                    if not invoice.get("invoice_number"):
                        errors.append(f"Invoice {i+1} missing required field: invoice_number")
                    if not invoice.get("customer_email"):
                        errors.append(f"Invoice {i+1} missing required field: customer_email")
                    if "items" in invoice and not isinstance(invoice["items"], list):
                        errors.append(f"Invoice {i+1} items must be a list")
        
        return errors
    
    def _import_settings(self, settings_data: Dict[str, Any]):
        """Import company settings"""
        try:
            # Delete existing settings
            existing_settings = self.db.query(models.Settings).filter(
                models.Settings.user_id == self.user_id
            ).all()
            for setting in existing_settings:
                self.db.delete(setting)
            
            # Create new settings
            new_settings = models.Settings(
                user_id=self.user_id,
                company_name=settings_data.get("company_name"),
                company_address=settings_data.get("company_address"),
                company_city=settings_data.get("company_city"),
                company_state=settings_data.get("company_state"),
                company_zip=settings_data.get("company_zip"),
                company_country=settings_data.get("company_country"),
                company_phone=settings_data.get("company_phone"),
                company_email=settings_data.get("company_email"),
                company_website=settings_data.get("company_website"),
                tax_rate=settings_data.get("tax_rate", 0.0),
                currency=settings_data.get("currency", "USD"),
                invoice_prefix=settings_data.get("invoice_prefix", "INV-"),
                invoice_footer=settings_data.get("invoice_footer"),
                bank_name=settings_data.get("bank_name"),
                bank_iban=settings_data.get("bank_iban"),
                bank_bic=settings_data.get("bank_bic"),
                language=settings_data.get("language", "en")
            )
            self.db.add(new_settings)
            self.db.flush()
            
            self.import_stats.settings_updated = True
            
        except Exception as e:
            self.errors.append(f"Failed to import settings: {str(e)}")
    
    def _import_customers(self, customers_data: List[Dict[str, Any]], update_existing: bool) -> Dict[str, int]:
        """Import customers and return email->id mapping"""
        customer_map = {}
        
        for customer_data in customers_data:
            try:
                email = customer_data.get("email")
                if not email:
                    self.errors.append(f"Customer '{customer_data.get('name', 'Unknown')}' missing email")
                    continue
                
                # Check if customer exists
                existing = self.db.query(models.Customer).filter(
                    models.Customer.email == email,
                    models.Customer.user_id == self.user_id
                ).first()
                
                if existing:
                    if update_existing:
                        # Update existing customer
                        existing.name = customer_data.get("name", existing.name)
                        existing.phone = customer_data.get("phone", existing.phone)
                        existing.address = customer_data.get("address", existing.address)
                        existing.city = customer_data.get("city", existing.city)
                        existing.state = customer_data.get("state", existing.state)
                        existing.zip_code = customer_data.get("zip_code", existing.zip_code)
                        existing.country = customer_data.get("country", existing.country)
                        existing.company = customer_data.get("company", existing.company)
                        existing.notes = customer_data.get("notes", existing.notes)
                        
                        self.import_stats.customers_updated += 1
                    
                    customer_map[email] = existing.id
                else:
                    # Create new customer
                    new_customer = models.Customer(
                        user_id=self.user_id,
                        name=customer_data.get("name", ""),
                        email=email,
                        phone=customer_data.get("phone"),
                        address=customer_data.get("address"),
                        city=customer_data.get("city"),
                        state=customer_data.get("state"),
                        zip_code=customer_data.get("zip_code"),
                        country=customer_data.get("country"),
                        company=customer_data.get("company"),
                        notes=customer_data.get("notes")
                    )
                    self.db.add(new_customer)
                    self.db.flush()
                    customer_map[email] = new_customer.id
                    self.import_stats.customers_created += 1
                    
            except Exception as e:
                self.errors.append(f"Error importing customer {customer_data.get('email', 'unknown')}: {str(e)}")
        
        return customer_map
    
    def _import_invoices(self, invoices_data: List[Dict[str, Any]], customer_map: Dict[str, int], 
                        skip_duplicates: bool, update_existing: bool):
        """Import invoices"""
        for invoice_data in invoices_data:
            try:
                invoice_number = invoice_data.get("invoice_number")
                customer_email = invoice_data.get("customer_email")
                
                if not invoice_number:
                    self.errors.append("Invoice missing invoice_number")
                    continue
                
                if not customer_email:
                    self.errors.append(f"Invoice {invoice_number} missing customer_email")
                    continue
                
                # Check if invoice already exists
                existing_invoice = self.db.query(models.Invoice).filter(
                    models.Invoice.invoice_number == invoice_number,
                    models.Invoice.user_id == self.user_id
                ).first()
                
                if existing_invoice:
                    if skip_duplicates:
                        self.warnings.append(f"Skipped duplicate invoice: {invoice_number}")
                        continue
                    elif not update_existing:
                        self.errors.append(f"Invoice {invoice_number} already exists")
                        continue
                
                # Find customer
                customer_id = customer_map.get(customer_email)
                if not customer_id:
                    # Try to find in database
                    customer = self.db.query(models.Customer).filter(
                        models.Customer.email == customer_email,
                        models.Customer.user_id == self.user_id
                    ).first()
                    if customer:
                        customer_id = customer.id
                    else:
                        self.errors.append(f"Customer not found for invoice {invoice_number}: {customer_email}")
                        continue
                
                # Parse dates
                issue_date = None
                due_date = None
                
                if invoice_data.get("issue_date"):
                    try:
                        issue_date = datetime.fromisoformat(invoice_data["issue_date"].replace('Z', '+00:00'))
                    except ValueError:
                        self.warnings.append(f"Invalid issue_date for invoice {invoice_number}")
                
                if invoice_data.get("due_date"):
                    try:
                        due_date = datetime.fromisoformat(invoice_data["due_date"].replace('Z', '+00:00'))
                    except ValueError:
                        self.warnings.append(f"Invalid due_date for invoice {invoice_number}")
                
                # Parse status
                status = models.InvoiceStatus.DRAFT
                if invoice_data.get("status"):
                    try:
                        status = models.InvoiceStatus(invoice_data["status"])
                    except ValueError:
                        self.warnings.append(f"Invalid status for invoice {invoice_number}: {invoice_data['status']}")
                
                if existing_invoice and update_existing:
                    # Update existing invoice
                    existing_invoice.customer_id = customer_id
                    existing_invoice.issue_date = issue_date
                    existing_invoice.due_date = due_date
                    existing_invoice.status = status
                    existing_invoice.notes = invoice_data.get("notes")
                    existing_invoice.tax_rate = float(invoice_data.get("tax_rate", 0.0))
                    existing_invoice.discount = float(invoice_data.get("discount", 0.0))
                    existing_invoice.subtotal = float(invoice_data.get("subtotal", 0.0))
                    existing_invoice.tax_amount = float(invoice_data.get("tax_amount", 0.0))
                    existing_invoice.total = float(invoice_data.get("total", 0.0))
                    
                    # Delete existing items
                    self.db.query(models.InvoiceItem).filter(
                        models.InvoiceItem.invoice_id == existing_invoice.id
                    ).delete()
                    
                    new_invoice = existing_invoice
                else:
                    # Create new invoice
                    new_invoice = models.Invoice(
                        invoice_number=invoice_number,
                        customer_id=customer_id,
                        user_id=self.user_id,
                        issue_date=issue_date,
                        due_date=due_date,
                        status=status,
                        notes=invoice_data.get("notes"),
                        tax_rate=float(invoice_data.get("tax_rate", 0.0)),
                        discount=float(invoice_data.get("discount", 0.0)),
                        subtotal=float(invoice_data.get("subtotal", 0.0)),
                        tax_amount=float(invoice_data.get("tax_amount", 0.0)),
                        total=float(invoice_data.get("total", 0.0))
                    )
                    self.db.add(new_invoice)
                    self.db.flush()
                    
                    self.import_stats.invoices_created += 1
                
                # Import invoice items
                items_data = invoice_data.get("items", [])
                for item_data in items_data:
                    try:
                        new_item = models.InvoiceItem(
                            invoice_id=new_invoice.id,
                            description=item_data.get("description", ""),
                            quantity=float(item_data.get("quantity", 1.0)),
                            unit_price=float(item_data.get("unit_price", 0.0)),
                            amount=float(item_data.get("amount", 0.0))
                        )
                        self.db.add(new_item)
                        
                    except Exception as e:
                        self.errors.append(f"Failed to import item for invoice {invoice_number}: {str(e)}")
                
            except Exception as e:
                self.errors.append(f"Failed to import invoice {invoice_data.get('invoice_number', 'unknown')}: {str(e)}")
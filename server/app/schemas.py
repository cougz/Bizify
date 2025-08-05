# Modified version of the schemas.py file to fix validation issues
from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional, Union
from datetime import datetime, date
from enum import Enum

# Enum for invoice status
class InvoiceStatusEnum(str, Enum):
    DRAFT = "draft"
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"

# Base schemas
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = "User"

class CustomerBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    company: Optional[str] = None
    notes: Optional[str] = None

class InvoiceItemBase(BaseModel):
    description: str
    quantity: Union[float, int, str] = Field(gt=0)  # Accept string or numeric input
    unit_price: Union[float, int, str] = Field(ge=0)  # Accept string or numeric input
    
    # Validators to convert string values to float
    @validator('quantity', pre=True)
    def validate_quantity(cls, v):
        if isinstance(v, str):
            try:
                v = float(v)
            except ValueError:
                raise ValueError('Quantity must be a valid number')
        if v <= 0:
            raise ValueError('Quantity must be greater than 0')
        return v
    
    @validator('unit_price', pre=True)
    def validate_unit_price(cls, v):
        if isinstance(v, str):
            try:
                v = float(v)
            except ValueError:
                raise ValueError('Unit price must be a valid number')
        if v < 0:
            raise ValueError('Unit price must be a non-negative number')
        return v

class InvoiceBase(BaseModel):
    customer_id: Union[int, str]  # Accept string or int input
    issue_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    status: Optional[InvoiceStatusEnum] = InvoiceStatusEnum.DRAFT
    notes: Optional[str] = None
    tax_rate: Optional[Union[float, str]] = 0.0  # Accept string or float input
    discount: Optional[Union[float, str]] = 0.0  # Accept string or float input
    
    # Validators to convert string values to appropriate types
    @validator('customer_id', pre=True)
    def validate_customer_id(cls, v):
        if isinstance(v, str):
            try:
                v = int(v)
            except ValueError:
                raise ValueError('Customer ID must be a valid integer')
        return v
    
    @validator('tax_rate', pre=True)
    def validate_tax_rate(cls, v):
        if isinstance(v, str) and v.strip():
            try:
                v = float(v)
            except ValueError:
                raise ValueError('Tax rate must be a valid number')
        return 0.0 if v is None else v
    
    @validator('discount', pre=True)
    def validate_discount(cls, v):
        if isinstance(v, str) and v.strip():
            try:
                v = float(v)
            except ValueError:
                raise ValueError('Discount must be a valid number')
        return 0.0 if v is None else v

class SettingsBase(BaseModel):
    company_name: Optional[str] = None
    company_address: Optional[str] = None
    company_city: Optional[str] = None
    company_state: Optional[str] = None
    company_zip: Optional[str] = None
    company_country: Optional[str] = None
    company_phone: Optional[str] = None
    company_email: Optional[EmailStr] = None
    company_website: Optional[str] = None
    company_logo: Optional[str] = None
    tax_rate: Optional[float] = 0.0
    currency: Optional[str] = "USD"
    invoice_prefix: Optional[str] = "INV-"
    invoice_footer: Optional[str] = None
    bank_name: Optional[str] = None
    bank_iban: Optional[str] = None
    bank_bic: Optional[str] = None
    language: Optional[str] = "en"

# Create schemas
class UserCreate(UserBase):
    password: str

class CustomerCreate(CustomerBase):
    pass

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceCreate(InvoiceBase):
    items: List[InvoiceItemCreate]

class SettingsCreate(SettingsBase):
    pass

# Update schemas
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    password: Optional[str] = None

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    company: Optional[str] = None
    notes: Optional[str] = None

class InvoiceItemUpdate(BaseModel):
    id: Optional[int] = None
    description: Optional[str] = None
    quantity: Optional[Union[float, int, str]] = None
    unit_price: Optional[Union[float, int, str]] = None

    @validator('quantity')
    def quantity_must_be_positive(cls, v):
        if v is not None:
            if isinstance(v, str):
                try:
                    v = float(v)
                except ValueError:
                    raise ValueError('Quantity must be a valid number')
            if v <= 0:
                raise ValueError('Quantity must be greater than 0')
        return v

    @validator('unit_price')
    def unit_price_must_be_non_negative(cls, v):
        if v is not None:
            if isinstance(v, str):
                try:
                    v = float(v)
                except ValueError:
                    raise ValueError('Unit price must be a valid number')
            if v < 0:
                raise ValueError('Unit price must be non-negative')
        return v

class InvoiceUpdate(BaseModel):
    customer_id: Optional[Union[int, str]] = None
    issue_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    status: Optional[InvoiceStatusEnum] = None
    notes: Optional[str] = None
    tax_rate: Optional[Union[float, str]] = None
    discount: Optional[Union[float, str]] = None
    items: Optional[List[InvoiceItemUpdate]] = None
    
    @validator('customer_id')
    def validate_customer_id(cls, v):
        if v is not None and isinstance(v, str):
            try:
                v = int(v)
            except ValueError:
                raise ValueError('Customer ID must be a valid integer')
        return v
    
    @validator('tax_rate')
    def validate_tax_rate(cls, v):
        if v is not None and isinstance(v, str):
            try:
                v = float(v)
            except ValueError:
                raise ValueError('Tax rate must be a valid number')
        return v
    
    @validator('discount')
    def validate_discount(cls, v):
        if v is not None and isinstance(v, str):
            try:
                v = float(v)
            except ValueError:
                raise ValueError('Discount must be a valid number')
        return v

class SettingsUpdate(SettingsBase):
    pass

# Response schemas (rest of the code remains unchanged)
class InvoiceItem(InvoiceItemBase):
    id: int
    invoice_id: int
    amount: float
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class Customer(CustomerBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class Invoice(InvoiceBase):
    id: int
    invoice_number: str
    user_id: int
    subtotal: float
    tax_amount: float
    total: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[InvoiceItem]
    customer: Customer

    class Config:
        orm_mode = True

class Settings(SettingsBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Stats schemas
class CustomerStats(BaseModel):
    total_customers: int
    new_customers_this_month: int
    active_customers: int
    top_customers: List[dict]

class InvoiceStats(BaseModel):
    total_invoices: int
    paid_invoices: int
    pending_invoices: int
    overdue_invoices: int
    total_revenue: float
    revenue_this_month: float
    revenue_last_month: float
    monthly_revenue: List[dict]

class DashboardData(BaseModel):
    total_customers: int
    total_invoices: int
    total_revenue: float
    revenue_change: float
    pending_invoices: int
    paid_invoices: int
    overdue_invoices: int
    revenue_data: List[dict]
    invoice_status_data: dict

# Export/Import schemas
from enum import Enum

class ExportFormat(str, Enum):
    JSON = "json"
    CSV = "csv"
    EXCEL = "excel"
    BACKUP = "backup"

class ExportRequest(BaseModel):
    format: ExportFormat = ExportFormat.JSON
    include_customers: bool = True
    include_invoices: bool = True
    include_settings: bool = True
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    customer_ids: Optional[List[int]] = None

class ExportData(BaseModel):
    export_version: str = "1.0"
    export_date: datetime
    application: str = "Bizify"
    user_info: dict
    settings: Optional[dict] = None
    customers: List[dict] = []
    invoices: List[dict] = []

class ImportOptions(BaseModel):
    update_existing: bool = False
    import_settings: bool = True
    import_customers: bool = True
    import_invoices: bool = True
    skip_duplicates: bool = True

class ImportPreview(BaseModel):
    total_customers: int
    total_invoices: int
    has_settings: bool
    conflicts: List[dict] = []
    validation_errors: List[str] = []
    warnings: List[str] = []

class ImportStats(BaseModel):
    customers_created: int = 0
    customers_updated: int = 0
    invoices_created: int = 0
    settings_updated: bool = False

class ImportResult(BaseModel):
    success: bool
    message: str
    stats: ImportStats
    errors: List[str] = []
    warnings: List[str] = []

class ExportResponse(BaseModel):
    task_id: Optional[str] = None
    status: str
    download_url: Optional[str] = None

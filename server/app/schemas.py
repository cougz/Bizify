from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional
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
    name: str

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
    quantity: float = Field(gt=0)
    unit_price: float = Field(ge=0)

class InvoiceBase(BaseModel):
    customer_id: int
    issue_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    status: Optional[InvoiceStatusEnum] = InvoiceStatusEnum.DRAFT
    notes: Optional[str] = None
    tax_rate: Optional[float] = 0.0
    discount: Optional[float] = 0.0

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
    quantity: Optional[float] = None
    unit_price: Optional[float] = None

    @validator('quantity')
    def quantity_must_be_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Quantity must be greater than 0')
        return v

    @validator('unit_price')
    def unit_price_must_be_non_negative(cls, v):
        if v is not None and v < 0:
            raise ValueError('Unit price must be non-negative')
        return v

class InvoiceUpdate(BaseModel):
    customer_id: Optional[int] = None
    issue_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    status: Optional[InvoiceStatusEnum] = None
    notes: Optional[str] = None
    tax_rate: Optional[float] = None
    discount: Optional[float] = None
    items: Optional[List[InvoiceItemUpdate]] = None

class SettingsUpdate(SettingsBase):
    pass

# Response schemas
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

from fpdf import FPDF

def generate_pdf(invoice_data):
    """
    Generate a PDF invoice using FPDF
    
    Args:
        invoice_data: Dictionary containing invoice information
        
    Returns:
        PDF file content as bytes
    """
    pdf = FPDF()
    pdf.add_page()
    
    # Set up fonts
    pdf.set_font("Arial", "B", 16)
    
    # Header
    pdf.cell(190, 10, "INVOICE", 0, 1, "C")
    pdf.set_font("Arial", "B", 12)
    pdf.cell(190, 10, f"Invoice #{invoice_data.get('invoice_number', 'N/A')}", 0, 1, "C")
    pdf.ln(5)
    
    # Company info
    pdf.set_font("Arial", "B", 10)
    pdf.cell(95, 10, "From:", 0, 0)
    pdf.cell(95, 10, "To:", 0, 1)
    
    pdf.set_font("Arial", "", 10)
    pdf.cell(95, 5, invoice_data.get("company_name", "Your Company"), 0, 0)
    pdf.cell(95, 5, invoice_data.get("customer_name", "Customer"), 0, 1)
    
    pdf.cell(95, 5, invoice_data.get("company_address", ""), 0, 0)
    pdf.cell(95, 5, invoice_data.get("customer_address", ""), 0, 1)
    
    pdf.cell(95, 5, invoice_data.get("company_email", ""), 0, 0)
    pdf.cell(95, 5, invoice_data.get("customer_email", ""), 0, 1)
    
    pdf.ln(10)
    
    # Invoice details
    pdf.set_font("Arial", "B", 10)
    pdf.cell(47.5, 10, "Invoice Date", 1, 0, "C")
    pdf.cell(47.5, 10, "Due Date", 1, 0, "C")
    pdf.cell(47.5, 10, "Status", 1, 0, "C")
    pdf.cell(47.5, 10, "Amount Due", 1, 1, "C")
    
    pdf.set_font("Arial", "", 10)
    pdf.cell(47.5, 10, invoice_data.get("issue_date", ""), 1, 0, "C")
    pdf.cell(47.5, 10, invoice_data.get("due_date", ""), 1, 0, "C")
    pdf.cell(47.5, 10, invoice_data.get("status", ""), 1, 0, "C")
    pdf.cell(47.5, 10, f"${invoice_data.get('total', 0):.2f}", 1, 1, "C")
    
    pdf.ln(10)
    
    # Items table
    pdf.set_font("Arial", "B", 10)
    pdf.cell(95, 10, "Description", 1, 0, "C")
    pdf.cell(30, 10, "Quantity", 1, 0, "C")
    pdf.cell(30, 10, "Unit Price", 1, 0, "C")
    pdf.cell(35, 10, "Amount", 1, 1, "C")
    
    pdf.set_font("Arial", "", 10)
    items = invoice_data.get("items", [])
    for item in items:
        description = item.get("description", "")
        quantity = item.get("quantity", 0)
        unit_price = item.get("unit_price", 0)
        amount = item.get("amount", 0)
        
        pdf.cell(95, 10, description, 1, 0)
        pdf.cell(30, 10, str(quantity), 1, 0, "C")
        pdf.cell(30, 10, f"${unit_price:.2f}", 1, 0, "C")
        pdf.cell(35, 10, f"${amount:.2f}", 1, 1, "C")
    
    # Totals
    pdf.ln(5)
    pdf.cell(125, 10, "", 0, 0)
    pdf.cell(30, 10, "Subtotal:", 0, 0, "R")
    pdf.cell(35, 10, f"${invoice_data.get('subtotal', 0):.2f}", 0, 1, "R")
    
    pdf.cell(125, 10, "", 0, 0)
    pdf.cell(30, 10, "Tax:", 0, 0, "R")
    pdf.cell(35, 10, f"${invoice_data.get('tax_amount', 0):.2f}", 0, 1, "R")
    
    if invoice_data.get('discount', 0) > 0:
        pdf.cell(125, 10, "", 0, 0)
        pdf.cell(30, 10, "Discount:", 0, 0, "R")
        pdf.cell(35, 10, f"-${invoice_data.get('discount', 0):.2f}", 0, 1, "R")
    
    pdf.set_font("Arial", "B", 10)
    pdf.cell(125, 10, "", 0, 0)
    pdf.cell(30, 10, "Total:", 0, 0, "R")
    pdf.cell(35, 10, f"${invoice_data.get('total', 0):.2f}", 0, 1, "R")
    
    # Notes
    if invoice_data.get("notes"):
        pdf.ln(10)
        pdf.set_font("Arial", "B", 10)
        pdf.cell(190, 10, "Notes:", 0, 1)
        pdf.set_font("Arial", "", 10)
        pdf.multi_cell(190, 5, invoice_data.get("notes", ""))
    
    # Footer
    pdf.ln(10)
    pdf.set_font("Arial", "I", 8)
    pdf.cell(190, 5, "Thank you for your business!", 0, 1, "C")
    
    return pdf.output(dest="S").encode("latin1")

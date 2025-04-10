import io
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

def generate_pdf(invoice, settings):
    """
    Generate a PDF for an invoice
    
    Args:
        invoice: The invoice object with all details
        settings: The company settings object
    
    Returns:
        bytes: The PDF file as bytes
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=inch/2,
        leftMargin=inch/2,
        topMargin=inch/2,
        bottomMargin=inch/2
    )
    
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name='RightAlign',
        parent=styles['Normal'],
        alignment=2  # 2 is right alignment
    ))
    
    # Create the content for the PDF
    elements = []
    
    # Add company logo if available
    # if settings.company_logo:
    #     logo = Image(settings.company_logo)
    #     logo.drawHeight = 0.5*inch
    #     logo.drawWidth = 1.5*inch
    #     elements.append(logo)
    
    # Add invoice header
    elements.append(Paragraph(f"INVOICE #{invoice.invoice_number}", styles['Heading1']))
    elements.append(Spacer(1, 0.25*inch))
    
    # Add company and customer information
    company_info = [
        ["FROM:", "BILL TO:"],
        [
            f"{settings.company_name if settings else 'Your Company'}\n" +
            f"{settings.company_address if settings else '123 Business St'}\n" +
            f"{settings.company_city if settings else 'San Francisco'}, " +
            f"{settings.company_state if settings else 'CA'} " +
            f"{settings.company_zip if settings else '94103'}\n" +
            f"{settings.company_country if settings else 'USA'}\n" +
            f"Phone: {settings.company_phone if settings else '(555) 987-6543'}\n" +
            f"Email: {settings.company_email if settings else 'info@yourcompany.com'}",
            
            f"{invoice.customer.name}\n" +
            f"{invoice.customer.company}\n" +
            f"{invoice.customer.address}\n" +
            f"{invoice.customer.city}, {invoice.customer.state} {invoice.customer.zip_code}\n" +
            f"{invoice.customer.country}\n" +
            f"Email: {invoice.customer.email}"
        ]
    ]
    
    company_table = Table(company_info, colWidths=[2.75*inch, 2.75*inch])
    company_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('FONT', (0, 0), (1, 0), 'Helvetica-Bold'),
        ('LINEBELOW', (0, 0), (1, 0), 1, colors.black),
        ('TOPPADDING', (0, 0), (1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (1, 0), 6),
    ]))
    elements.append(company_table)
    elements.append(Spacer(1, 0.25*inch))
    
    # Add invoice details
    invoice_details = [
        ["Invoice Number:", invoice.invoice_number],
        ["Issue Date:", datetime.fromisoformat(invoice.issue_date).strftime("%B %d, %Y") if isinstance(invoice.issue_date, str) else invoice.issue_date.strftime("%B %d, %Y")],
        ["Due Date:", datetime.fromisoformat(invoice.due_date).strftime("%B %d, %Y") if isinstance(invoice.due_date, str) else invoice.due_date.strftime("%B %d, %Y")],
        ["Status:", invoice.status.upper()]
    ]
    
    details_table = Table(invoice_details, colWidths=[1.5*inch, 4*inch])
    details_table.setStyle(TableStyle([
        ('FONT', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.25, colors.lightgrey),
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(details_table)
    elements.append(Spacer(1, 0.25*inch))
    
    # Add invoice items
    items_data = [["Description", "Quantity", "Unit Price", "Amount"]]
    for item in invoice.items:
        items_data.append([
            item.description,
            str(item.quantity),
            f"${item.unit_price:.2f}",
            f"${item.amount:.2f}"
        ])
    
    # Add subtotal, tax, and total
    items_data.append(["", "", "Subtotal:", f"${invoice.subtotal:.2f}"])
    if invoice.discount > 0:
        items_data.append(["", "", "Discount:", f"-${invoice.discount:.2f}"])
    items_data.append(["", "", f"Tax ({invoice.tax_rate}%):", f"${invoice.tax_amount:.2f}"])
    items_data.append(["", "", "Total:", f"${invoice.total:.2f}"])
    
    items_table = Table(items_data, colWidths=[3*inch, 1*inch, 1*inch, 1*inch])
    items_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONT', (2, -3), (3, -1), 'Helvetica-Bold'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, len(invoice.items)), 0.25, colors.black),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
        ('LINEBELOW', (0, len(invoice.items)), (-1, len(invoice.items)), 1, colors.black),
        ('LINEABOVE', (2, -1), (-1, -1), 1, colors.black),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 0.25*inch))
    
    # Add notes if available
    if invoice.notes:
        elements.append(Paragraph("Notes:", styles['Heading3']))
        elements.append(Paragraph(invoice.notes, styles['Normal']))
        elements.append(Spacer(1, 0.25*inch))
    
    # Add footer
    if settings and settings.invoice_footer:
        elements.append(Paragraph(settings.invoice_footer, styles['Normal']))
    
    # Build the PDF
    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes

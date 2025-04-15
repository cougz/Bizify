import io
import base64
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, Frame, PageTemplate
from reportlab.pdfgen import canvas

def create_footer(canvas, doc, settings):
    """
    Create a footer for each page of the invoice
    """
    canvas.saveState()
    
    # Set footer position
    footer_y = 0.5 * inch
    
    # Draw a line above the footer
    canvas.setStrokeColor(colors.lightgrey)
    canvas.line(0.5*inch, footer_y + 0.25*inch, doc.width + 0.5*inch, footer_y + 0.25*inch)
    
    # Debug: Print settings to verify they're being used correctly
    print("PDF Footer - Using settings:", {
        "company_name": settings.company_name if settings else "No settings found",
        "company_address": settings.company_address if settings else "No address",
        "company_email": settings.company_email if settings else "No email"
    })
    
    # Add company info in the footer
    canvas.setFont("Helvetica", 8)
    company_name = settings.company_name if settings and settings.company_name else 'Your Company'
    company_address = f"{settings.company_address if settings and settings.company_address else 'Your Address'}, {settings.company_city if settings and settings.company_city else 'Your City'}, {settings.company_state if settings and settings.company_state else 'Your State'} {settings.company_zip if settings and settings.company_zip else 'Your ZIP'}"
    company_contact = f"Phone: {settings.company_phone if settings and settings.company_phone else 'Your Phone'} | Email: {settings.company_email if settings and settings.company_email else 'your@email.com'} | {settings.company_website if settings and settings.company_website else 'www.example.com'}"
    
    # Draw company info
    canvas.drawCentredString(doc.width/2 + 0.5*inch, footer_y + 0.1*inch, company_name)
    canvas.drawCentredString(doc.width/2 + 0.5*inch, footer_y - 0.1*inch, company_address)
    canvas.drawCentredString(doc.width/2 + 0.5*inch, footer_y - 0.3*inch, company_contact)
    
    # Add page number
    page_num = canvas.getPageNumber()
    canvas.drawRightString(doc.width + 0.5*inch, footer_y - 0.3*inch, f"Page {page_num}")
    
    canvas.restoreState()

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
    
    # Create document with custom footer
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=inch/2,
        leftMargin=inch/2,
        topMargin=inch/2,
        bottomMargin=inch
    )
    
    # Create a frame for the content
    frame = Frame(
        doc.leftMargin,
        doc.bottomMargin,
        doc.width,
        doc.height - 0.5*inch,
        id='normal'
    )
    
    # Create a template with the footer
    template = PageTemplate(
        id='invoice_template',
        frames=[frame],
        onPage=lambda canvas, doc: create_footer(canvas, doc, settings)
    )
    
    # Add the template to the document
    doc.addPageTemplates([template])
    
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name='RightAlign',
        parent=styles['Normal'],
        alignment=2  # 2 is right alignment
    ))
    
    # Add modern heading style
    styles.add(ParagraphStyle(
        name='ModernHeading',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=12,
        textColor=colors.HexColor('#2c3e50')
    ))
    
    # Create the content for the PDF
    elements = []
    
    # Create a table for the header with logo and invoice title
    header_data = [["", ""]]
    
    # Add company logo if available
    logo_path = None
    if hasattr(settings, 'company_logo') and settings.company_logo:
        try:
            # Check if it's a data URL (base64 encoded image)
            if settings.company_logo.startswith('data:image'):
                # Extract the base64 part
                header, encoded = settings.company_logo.split(",", 1)
                try:
                    # Decode the base64 data
                    logo_data = base64.b64decode(encoded)
                    logo_path = io.BytesIO(logo_data)
                except Exception as e:
                    print(f"Error decoding logo: {e}")
                    logo_path = None
            else:
                # If not a data URL, assume it's a file path
                logo_path = settings.company_logo
        except Exception as e:
            print(f"Error processing logo: {e}")
            logo_path = None
    
    if logo_path:
        try:
            logo = Image(logo_path)
            # Set a maximum width or height (increased for larger logo display)
            max_width = 3*inch
            max_height = 1.5*inch
            
            # Calculate scaling factors for width and height
            width_scale = max_width / logo.imageWidth
            height_scale = max_height / logo.imageHeight
            
            # Use the smaller scaling factor to ensure the image fits within bounds
            scale = min(width_scale, height_scale)
            
            # Apply the scaling factor to both dimensions to maintain aspect ratio
            logo.drawWidth = logo.imageWidth * scale
            logo.drawHeight = logo.imageHeight * scale
            
            header_data[0][0] = logo
        except Exception as e:
            print(f"Error creating logo image: {e}")
            # If logo creation fails, fall back to text
            company_name = settings.company_name if settings and settings.company_name else 'Your Company'
            header_data[0][0] = Paragraph(f"<font size='16'><b>{company_name}</b></font>", styles['Normal'])
    else:
        # If no logo, use company name as text
        company_name = settings.company_name if settings and settings.company_name else 'Your Company'
        header_data[0][0] = Paragraph(f"<font size='16'><b>{company_name}</b></font>", styles['Normal'])
    
    # Add invoice title
    header_data[0][1] = Paragraph(f"<font size='24' color='#2c3e50'><b>INVOICE</b></font><br/><font size='14' color='#7f8c8d'>#{invoice.invoice_number}</font>", styles['RightAlign'])
    
    header_table = Table(header_data, colWidths=[3*inch, 3*inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 0.25*inch))
    
    # Debug print to verify settings
    print("PDF Generator - Using settings:", {
        "company_name": settings.company_name if settings else "No settings found",
        "company_address": settings.company_address if settings else "No address",
        "company_email": settings.company_email if settings else "No email"
    })
    
    # Add company and customer information with modern styling
    company_info = [
        [Paragraph("<font color='#2c3e50'><b>FROM</b></font>", styles['Normal']), 
         Paragraph("<font color='#2c3e50'><b>BILL TO</b></font>", styles['Normal'])],
        [
            Paragraph(
                f"<font size='12'><b>{settings.company_name if settings and settings.company_name else 'Your Company'}</b></font><br/>" +
                f"{settings.company_address if settings and settings.company_address else 'Your Address'}<br/>" +
                f"{settings.company_city if settings and settings.company_city else 'Your City'}, " +
                f"{settings.company_state if settings and settings.company_state else 'Your State'} " +
                f"{settings.company_zip if settings and settings.company_zip else 'Your ZIP'}<br/>" +
                f"{settings.company_country if settings and settings.company_country else 'Your Country'}<br/>" +
                f"{settings.company_email if settings and settings.company_email else 'your@email.com'}<br/>" +
                f"Phone: {settings.company_phone if settings and settings.company_phone else 'Your Phone'}",
                styles['Normal']
            ),
            
            Paragraph(
                f"<font size='12'><b>{invoice.customer.name}</b></font><br/>" +
                f"<b>{invoice.customer.company}</b><br/>" +
                f"{invoice.customer.address}<br/>" +
                f"{invoice.customer.city}, {invoice.customer.state} {invoice.customer.zip_code}<br/>" +
                f"{invoice.customer.country}<br/>" +
                f"Email: {invoice.customer.email}",
                styles['Normal']
            )
        ]
    ]
    
    company_table = Table(company_info, colWidths=[3*inch, 3*inch])
    company_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (1, 0), 6),
        ('LINEBELOW', (0, 0), (1, 0), 1, colors.HexColor('#ecf0f1')),
    ]))
    elements.append(company_table)
    elements.append(Spacer(1, 0.25*inch))
    
    # Add invoice details with modern styling
    invoice_details = [
        ["Invoice Number:", invoice.invoice_number],
        ["Issue Date:", datetime.fromisoformat(invoice.issue_date).strftime("%B %d, %Y") if isinstance(invoice.issue_date, str) else invoice.issue_date.strftime("%B %d, %Y")],
        ["Due Date:", datetime.fromisoformat(invoice.due_date).strftime("%B %d, %Y") if isinstance(invoice.due_date, str) else invoice.due_date.strftime("%B %d, %Y")],
        ["Status:", invoice.status.upper()]
    ]
    
    details_table = Table(invoice_details, colWidths=[1.5*inch, 4.5*inch])
    details_table.setStyle(TableStyle([
        ('FONT', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#ecf0f1')),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ecf0f1')),
        ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#ecf0f1')),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(details_table)
    elements.append(Spacer(1, 0.25*inch))
    
    # Get currency symbol from settings or default to $
    currency_symbol = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'CAD': 'CA$',
        'AUD': 'A$'
    }.get(settings.currency if hasattr(settings, 'currency') and settings.currency else 'USD', '$')
    
    # Add invoice items with modern styling
    items_data = [["Description", "Quantity", "Unit Price", "Amount"]]
    for item in invoice.items:
        items_data.append([
            item.description,
            str(item.quantity),
            f"{currency_symbol}{item.unit_price:.2f}",
            f"{currency_symbol}{item.amount:.2f}"
        ])
    
    # Add subtotal, tax, and total
    items_data.append(["", "", "Subtotal:", f"{currency_symbol}{invoice.subtotal:.2f}"])
    if invoice.discount > 0:
        items_data.append(["", "", "Discount:", f"-{currency_symbol}{invoice.discount:.2f}"])
    items_data.append(["", "", f"Tax ({invoice.tax_rate}%):", f"{currency_symbol}{invoice.tax_amount:.2f}"])
    items_data.append(["", "", "Total:", f"{currency_symbol}{invoice.total:.2f}"])
    
    items_table = Table(items_data, colWidths=[3*inch, 1*inch, 1*inch, 1*inch])
    items_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONT', (2, -3), (3, -1), 'Helvetica-Bold'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, len(invoice.items)), 0.25, colors.HexColor('#ecf0f1')),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ecf0f1')),
        ('LINEBELOW', (0, len(invoice.items)), (-1, len(invoice.items)), 1, colors.HexColor('#ecf0f1')),
        ('LINEABOVE', (2, -1), (-1, -1), 1, colors.HexColor('#ecf0f1')),
        ('BACKGROUND', (2, -1), (3, -1), colors.HexColor('#2c3e50')),
        ('TEXTCOLOR', (2, -1), (3, -1), colors.white),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 0.25*inch))
    
    # Add notes if available
    if invoice.notes:
        elements.append(Paragraph("<font color='#2c3e50'><b>Notes</b></font>", styles['Normal']))
        elements.append(Spacer(1, 0.1*inch))
        elements.append(Paragraph(invoice.notes, styles['Normal']))
        elements.append(Spacer(1, 0.25*inch))
    
    # Add payment instructions
    if settings and settings.invoice_footer:
        elements.append(Paragraph("<font color='#2c3e50'><b>Payment Instructions</b></font>", styles['Normal']))
        elements.append(Spacer(1, 0.1*inch))
        elements.append(Paragraph(settings.invoice_footer, styles['Normal']))
    
    # Build the PDF
    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes

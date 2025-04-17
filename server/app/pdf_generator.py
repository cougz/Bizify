import io
import base64
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, Frame, PageTemplate
from reportlab.pdfgen import canvas

from app.utils.translations import get_translation, format_date, format_currency

def create_footer(canvas, doc, settings):
    """
    Create a footer for each page of the invoice
    """
    canvas.saveState()
    
    # Get language from settings or default to English
    language = getattr(settings, 'language', 'en')
    
    # Set footer position
    footer_y = 0.5 * inch
    
    # Draw a line above the footer
    canvas.setStrokeColor(colors.lightgrey)
    canvas.line(0.5*inch, footer_y + 0.25*inch, doc.width + 0.5*inch, footer_y + 0.25*inch)
    
    # Debug: Print settings to verify they're being used correctly
    print("PDF Footer - Using settings:", {
        "company_name": settings.company_name if settings else "No settings found",
        "company_address": settings.company_address if settings else "No address",
        "company_email": settings.company_email if settings else "No email",
        "language": language
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
    page_text = f"{get_translation('invoice.page', language)} {page_num}"
    canvas.drawRightString(doc.width + 0.5*inch, footer_y - 0.3*inch, page_text)
    
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
    
    # Get language from settings or default to English
    language = getattr(settings, 'language', 'en')
    
    # Add invoice title with translation
    invoice_title = get_translation('invoice.title', language)
    header_data[0][1] = Paragraph(
        f"<font size='24' color='#2c3e50'><b>{invoice_title}</b></font><br/>" +
        f"<font size='14' color='#7f8c8d'>#{invoice.invoice_number}</font>", 
        styles['RightAlign']
    )
    
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
        [Paragraph(f"<font color='#2c3e50'><b>{get_translation('invoice.from', language)}</b></font>", styles['Normal']), 
         Paragraph(f"<font color='#2c3e50'><b>{get_translation('invoice.bill_to', language)}</b></font>", styles['Normal'])],
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
    # Extract status value as string, ensuring we get just the raw value (draft, pending, etc.)
    if hasattr(invoice.status, 'value'):
        status_value = invoice.status.value
    elif hasattr(invoice.status, 'name'):
        status_value = invoice.status.name.lower()
    else:
        status_value = str(invoice.status).lower()
    
    # Get the translation for this specific status
    try:
        # First get the status translations dictionary
        status_translations = get_translation('invoice.status', language)
        # Then get the specific translation for this status
        if isinstance(status_translations, dict) and status_value in status_translations:
            status_translation = status_translations[status_value]
        else:
            # Fallback: try direct path
            status_translation = get_translation(f"invoice.status.{status_value}", language)
            # If that fails, just use the status value
            if status_translation == f"invoice.status.{status_value}":
                status_translation = status_value.upper()
    except Exception as e:
        print(f"Error translating status: {e}")
        status_translation = status_value.upper()
    
    invoice_details = [
        [f"{get_translation('invoice.number', language)}:", invoice.invoice_number],
        [f"{get_translation('invoice.date', language)}:", format_date(datetime.fromisoformat(invoice.issue_date) if isinstance(invoice.issue_date, str) else invoice.issue_date, language)],
        [f"{get_translation('invoice.due_date', language)}:", format_date(datetime.fromisoformat(invoice.due_date) if isinstance(invoice.due_date, str) else invoice.due_date, language)],
        [f"{get_translation('invoice.status', language)}:", status_translation]
    ]
    
    # Adjust column widths to accommodate longer German text
    details_table = Table(invoice_details, colWidths=[2*inch, 4*inch])
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
    items_data = [[
        get_translation('invoice.description', language),
        get_translation('invoice.quantity', language),
        get_translation('invoice.unit_price', language),
        get_translation('invoice.amount', language)
    ]]
    for item in invoice.items:
        items_data.append([
            item.description,
            str(item.quantity),
            f"{currency_symbol}{item.unit_price:.2f}",
            f"{currency_symbol}{item.amount:.2f}"
        ])
    
    # Add subtotal, tax, and total
    items_data.append(["", "", f"{get_translation('invoice.subtotal', language)}:", f"{currency_symbol}{invoice.subtotal:.2f}"])
    if invoice.discount > 0:
        items_data.append(["", "", f"{get_translation('invoice.discount', language)}:", f"-{currency_symbol}{invoice.discount:.2f}"])
    items_data.append(["", "", f"{get_translation('invoice.tax', language)} ({invoice.tax_rate}%):", f"{currency_symbol}{invoice.tax_amount:.2f}"])
    items_data.append(["", "", f"{get_translation('invoice.total', language)}:", f"{currency_symbol}{invoice.total:.2f}"])
    
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
        # Make the total row background darker and ensure text is white for both columns
        ('BACKGROUND', (2, -1), (3, -1), colors.HexColor('#2c3e50')),
        ('TEXTCOLOR', (2, -1), (3, -1), colors.white),
        # Add more padding for the total row to accommodate longer German text
        ('LEFTPADDING', (2, -1), (3, -1), 10),
        ('RIGHTPADDING', (2, -1), (3, -1), 10),
        # Standard padding for other cells
        ('LEFTPADDING', (0, 0), (-1, -2), 6),
        ('RIGHTPADDING', (0, 0), (-1, -2), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 0.25*inch))
    
    # Add notes if available
    if invoice.notes:
        elements.append(Paragraph(f"<font color='#2c3e50'><b>{get_translation('invoice.notes', language)}</b></font>", styles['Normal']))
        elements.append(Spacer(1, 0.1*inch))
        elements.append(Paragraph(invoice.notes, styles['Normal']))
        elements.append(Spacer(1, 0.25*inch))
    
    # Add payment instructions and bank details
    if settings:
        # Add payment instructions if available
        if settings.invoice_footer:
            elements.append(Paragraph(f"<font color='#2c3e50'><b>{get_translation('invoice.payment_instructions', language)}</b></font>", styles['Normal']))
            elements.append(Spacer(1, 0.1*inch))
            elements.append(Paragraph(settings.invoice_footer, styles['Normal']))
            elements.append(Spacer(1, 0.25*inch))
        
        # Add bank details if available
        if hasattr(settings, 'bank_name') and (settings.bank_name or settings.bank_iban or settings.bank_bic):
            elements.append(Paragraph(f"<font color='#2c3e50'><b>{get_translation('invoice.bank_details', language)}</b></font>", styles['Normal']))
            elements.append(Spacer(1, 0.1*inch))
            
            bank_details = []
            if settings.bank_name:
                bank_details.append(f"{get_translation('bank.name', language)}: {settings.bank_name}")
            if settings.bank_iban:
                bank_details.append(f"{get_translation('bank.iban', language)}: {settings.bank_iban}")
            if settings.bank_bic:
                bank_details.append(f"{get_translation('bank.bic', language)}: {settings.bank_bic}")
            
            elements.append(Paragraph("<br/>".join(bank_details), styles['Normal']))
    
    # Build the PDF
    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes

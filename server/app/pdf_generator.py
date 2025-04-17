import io
import base64
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
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
    
    # Add company info in the footer - use smaller font and limit text width
    canvas.setFont("Helvetica", 7)  # Reduced font size
    company_name = settings.company_name if settings and settings.company_name else 'Your Company'
    company_name = _truncate_text(company_name, 50)  # Limit text length
    
    company_address = f"{settings.company_address if settings and settings.company_address else ''}, " + \
                     f"{settings.company_city if settings and settings.company_city else ''}, " + \
                     f"{settings.company_state if settings and settings.company_state else ''} " + \
                     f"{settings.company_zip if settings and settings.company_zip else ''}"
    company_address = _truncate_text(company_address, 70)  # Limit text length
    
    # Use hardcoded translations for common terms to avoid translation issues
    phone_label = "Telefon" if language == 'de' else "Phone"
    company_contact = f"{phone_label}: {settings.company_phone if settings and settings.company_phone else ''} | " + \
                     f"Email: {settings.company_email if settings and settings.company_email else ''}"
    company_contact = _truncate_text(company_contact, 70)  # Limit text length
    
    # Draw company info
    canvas.drawCentredString(doc.width/2 + 0.5*inch, footer_y + 0.1*inch, company_name)
    canvas.drawCentredString(doc.width/2 + 0.5*inch, footer_y - 0.1*inch, company_address)
    canvas.drawCentredString(doc.width/2 + 0.5*inch, footer_y - 0.3*inch, company_contact)
    
    # Add page number
    page_num = canvas.getPageNumber()
    page_text = f"{get_translation('invoice.page', language)} {page_num}"
    canvas.drawRightString(doc.width + 0.5*inch, footer_y - 0.3*inch, page_text)
    
    canvas.restoreState()

def _truncate_text(text, max_length):
    """Helper function to truncate text to a maximum length"""
    if len(text) > max_length:
        return text[:max_length-3] + '...'
    return text

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
    
    # Get language from settings or default to English
    language = getattr(settings, 'language', 'en')
    
    # Use A4 for better international compatibility, especially for European languages
    page_size = A4
    
    # Create document with custom footer and adequate margins
    doc = SimpleDocTemplate(
        buffer,
        pagesize=page_size,
        rightMargin=15*mm,
        leftMargin=15*mm,
        topMargin=15*mm,
        bottomMargin=25*mm
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
    
    # Create custom styles for different languages and layouts
    styles = getSampleStyleSheet()
    
    # Right-aligned text style
    styles.add(ParagraphStyle(
        name='RightAlign',
        parent=styles['Normal'],
        alignment=2  # 2 is right alignment
    ))
    
    # Heading style with language-appropriate sizes
    heading_font_size = 20 if language == 'en' else 18  # Slightly smaller for German
    styles.add(ParagraphStyle(
        name='ModernHeading',
        parent=styles['Heading1'],
        fontSize=heading_font_size,
        spaceAfter=12,
        textColor=colors.HexColor('#2c3e50')
    ))
    
    # Create the content for the PDF
    elements = []
    
    # Calculate available width for better layout
    available_width = doc.width
    
    # Header section: Create a table for the header with logo and invoice title
    # Use relative widths based on available space
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
            # Set a reasonable maximum width or height
            max_width = 2*inch
            max_height = 1*inch
            
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
            header_data[0][0] = Paragraph(f"<font size='14'><b>{company_name}</b></font>", styles['Normal'])
    else:
        # If no logo, use company name as text
        company_name = settings.company_name if settings and settings.company_name else 'Your Company'
        header_data[0][0] = Paragraph(f"<font size='14'><b>{company_name}</b></font>", styles['Normal'])
    
    # Add invoice title with translation
    invoice_title = get_translation('invoice.title', language)
    header_data[0][1] = Paragraph(
        f"<font size='20' color='#2c3e50'><b>{invoice_title}</b></font><br/>" +
        f"<font size='12' color='#7f8c8d'>#{invoice.invoice_number}</font>", 
        styles['RightAlign']
    )
    
    # Create the header table with proportional widths
    header_table = Table(header_data, colWidths=[available_width * 0.5, available_width * 0.5])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 10*mm))  # Extra space after header
    
    # Address Block: From and To addresses
    # Get label translations
    from_label = get_translation('invoice.from', language)
    to_label = get_translation('invoice.bill_to', language)
    
    company_info = [
        [Paragraph(f"<font color='#2c3e50'><b>{from_label}</b></font>", styles['Normal']), 
         Paragraph(f"<font color='#2c3e50'><b>{to_label}</b></font>", styles['Normal'])],
        [
            # Company address with paragraph wrapping
            Paragraph(
                f"<font size='10'><b>{settings.company_name if settings and settings.company_name else ''}</b></font><br/>" +
                f"{settings.company_address if settings and settings.company_address else ''}<br/>" +
                f"{settings.company_city if settings and settings.company_city else ''}, " +
                f"{settings.company_state if settings and settings.company_state else ''} " +
                f"{settings.company_zip if settings and settings.company_zip else ''}<br/>" +
                f"{settings.company_country if settings and settings.company_country else ''}<br/>" +
                f"{settings.company_email if settings and settings.company_email else ''}<br/>" +
                f"{'Telefon' if language == 'de' else 'Phone'}: {settings.company_phone if settings and settings.company_phone else ''}",
                styles['Normal']
            ),
            
            # Customer address with paragraph wrapping
            Paragraph(
                f"<font size='10'><b>{invoice.customer.name if hasattr(invoice, 'customer') else ''}</b></font><br/>" +
                f"<b>{invoice.customer.company if hasattr(invoice, 'customer') else ''}</b><br/>" +
                f"{invoice.customer.address if hasattr(invoice, 'customer') else ''}<br/>" +
                f"{invoice.customer.city if hasattr(invoice, 'customer') else ''}, " +
                f"{invoice.customer.state if hasattr(invoice, 'customer') else ''} " +
                f"{invoice.customer.zip_code if hasattr(invoice, 'customer') else ''}<br/>" +
                f"{invoice.customer.country if hasattr(invoice, 'customer') else ''}<br/>" +
                f"Email: {invoice.customer.email if hasattr(invoice, 'customer') else ''}",
                styles['Normal']
            )
        ]
    ]
    
    # Create address table with proportional widths
    company_table = Table(company_info, colWidths=[available_width * 0.48, available_width * 0.48])
    company_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (1, 0), 8),
        ('BOTTOMPADDING', (0, 0), (1, 0), 6),
        ('LINEBELOW', (0, 0), (1, 0), 1, colors.HexColor('#ecf0f1')),
    ]))
    elements.append(company_table)
    elements.append(Spacer(1, 10*mm))  # Extra space after addresses
    
    # Invoice Details: Date, number, status
    # Extract the raw status value using multiple fallback methods
    try:
        # First check if status is directly a string
        if isinstance(invoice.status, str):
            status_value = invoice.status.lower()
        # Then check if it has a value attribute (Enum)
        elif hasattr(invoice.status, 'value'):
            status_value = invoice.status.value
        # Then check if it has a name attribute (another Enum format)
        elif hasattr(invoice.status, 'name'):
            status_value = invoice.status.name.lower()
        # Fallback to string conversion
        else:
            status_value = str(invoice.status).lower()
            
        # Clean up the status value if it's still not clean
        if isinstance(status_value, dict) or '{' in str(status_value):
            # If somehow we got a dictionary, use a default value
            status_value = 'draft'
    except Exception as e:
        print(f"Error extracting status value: {e}")
        status_value = 'draft'  # Default fallback
    
    # Direct hardcoded translations to avoid any dictionary issues
    status_translations = {
        'draft': 'ENTWURF' if language == 'de' else 'DRAFT',
        'pending': 'AUSSTEHEND' if language == 'de' else 'PENDING',
        'paid': 'BEZAHLT' if language == 'de' else 'PAID',
        'overdue': 'ÜBERFÄLLIG' if language == 'de' else 'OVERDUE',
        'cancelled': 'STORNIERT' if language == 'de' else 'CANCELLED'
    }
    
    # Get the specific translated status with fallback
    status_translation = status_translations.get(status_value, status_value.upper())
    
    # Final safety check - ensure we have a string, not a dict
    if not isinstance(status_translation, str) or '{' in status_translation:
        status_translation = status_value.upper()
    
    # Prepare translated labels
    number_label = get_translation('invoice.number', language)
    date_label = get_translation('invoice.date', language)
    due_date_label = get_translation('invoice.due_date', language)
    status_label = get_translation('invoice.status', language)
    
    # Format dates for display
    issue_date = format_date(
        datetime.fromisoformat(invoice.issue_date) if isinstance(invoice.issue_date, str) else invoice.issue_date, 
        language
    )
    due_date = format_date(
        datetime.fromisoformat(invoice.due_date) if isinstance(invoice.due_date, str) else invoice.due_date, 
        language
    )
    
    # Debug print to help diagnose status issues
    print(f"Invoice status debug - Raw value: {status_value}, Translated: {status_translation}")
    
    # Create invoice details with paragraphs for wrapping
    invoice_details = [
        [Paragraph(f"{number_label}:", styles['Normal']), Paragraph(invoice.invoice_number, styles['Normal'])],
        [Paragraph(f"{date_label}:", styles['Normal']), Paragraph(issue_date, styles['Normal'])],
        [Paragraph(f"{due_date_label}:", styles['Normal']), Paragraph(due_date, styles['Normal'])],
        [Paragraph(f"{status_label}:", styles['Normal']), Paragraph(status_translation, styles['Normal'])]
    ]
    
    # Adjust column widths based on language - German needs more space for labels
    label_width = available_width * (0.35 if language == 'de' else 0.3)
    value_width = available_width * (0.65 if language == 'de' else 0.7)
    
    details_table = Table(invoice_details, colWidths=[label_width, value_width])
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
    elements.append(Spacer(1, 10*mm))  # Extra space after details
    
    # Get currency symbol from settings or default to $
    currency_symbol = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'CAD': 'CA$',
        'AUD': 'A$'
    }.get(settings.currency if hasattr(settings, 'currency') and settings.currency else 'USD', '$')
    
    # Invoice Items Table
    # Get translated headers
    description_header = get_translation('invoice.description', language)
    quantity_header = get_translation('invoice.quantity', language)
    unit_price_header = get_translation('invoice.unit_price', language)
    amount_header = get_translation('invoice.amount', language)
    
    # Initialize table header
    items_data = [[
        Paragraph(description_header, styles['Normal']),
        Paragraph(quantity_header, styles['Normal']),
        Paragraph(unit_price_header, styles['Normal']),
        Paragraph(amount_header, styles['Normal'])
    ]]
    
    # Add invoice items
    for item in invoice.items:
        # Use paragraphs for text wrapping
        items_data.append([
            Paragraph(item.description, styles['Normal']),
            Paragraph(str(item.quantity), styles['RightAlign']),
            Paragraph(f"{currency_symbol}{item.unit_price:.2f}", styles['RightAlign']),
            Paragraph(f"{currency_symbol}{item.amount:.2f}", styles['RightAlign'])
        ])
    
    # Create a special style for financial terms that prevents word breaks
    styles.add(ParagraphStyle(
        name='FinancialTerm',
        parent=styles['RightAlign'],
        wordWrap='CJK',  # This forces whole words to wrap together
        allowWidows=0,
        allowOrphans=0
    ))
    
    # Get translated labels for totals - use non-breaking spaces for German
    if language == 'de':
        # Use non-breaking space character \xa0 to prevent word breaks
        subtotal_label = "Zwischensumme"  # Hardcoded to prevent translation issues
        discount_label = "Rabatt"
        tax_label = "Steuer"
        total_label = "Gesamtbetrag"
    else:
        subtotal_label = "Subtotal"
        discount_label = "Discount"
        tax_label = "Tax"
        total_label = "Total"
    
    # Add subtotal with right alignment and no word breaks
    items_data.append([
        "", "", 
        Paragraph(f"{subtotal_label}:", styles['FinancialTerm']), 
        Paragraph(f"{currency_symbol}{invoice.subtotal:.2f}", styles['RightAlign'])
    ])
    
    # Add discount if applicable
    if hasattr(invoice, 'discount') and invoice.discount > 0:
        items_data.append([
            "", "", 
            Paragraph(f"{discount_label}:", styles['FinancialTerm']), 
            Paragraph(f"-{currency_symbol}{invoice.discount:.2f}", styles['RightAlign'])
        ])
    
    # Add tax
    items_data.append([
        "", "", 
        Paragraph(f"{tax_label} ({invoice.tax_rate}%):", styles['FinancialTerm']), 
        Paragraph(f"{currency_symbol}{invoice.tax_amount:.2f}", styles['RightAlign'])
    ])
    
    # Add total
    items_data.append([
        "", "", 
        Paragraph(f"<b>{total_label}:</b>", styles['FinancialTerm']), 
        Paragraph(f"<b>{currency_symbol}{invoice.total:.2f}</b>", styles['RightAlign'])
    ])
    
    # Calculate column widths based on page width and language
    # For German, we need more space for the labels column
    if language == 'de':
        desc_width = available_width * 0.45  # 45% for description
        num_width = available_width * 0.15   # 15% for quantity
        unit_width = available_width * 0.18  # 18% for unit price (German terms are longer)
        amount_width = available_width * 0.22  # 22% for amount (German terms are longer)
    else:
        desc_width = available_width * 0.5   # 50% for description
        num_width = available_width * 0.15   # 15% for quantity
        unit_width = available_width * 0.15  # 15% for unit price
        amount_width = available_width * 0.2  # 20% for amount
    
    items_table = Table(
        items_data, 
        colWidths=[desc_width, num_width, unit_width, amount_width],
        repeatRows=1  # Repeat header row on new pages
    )
    
    # Style the items table
    items_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold'),  # Bold header row
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, len(invoice.items)), 0.25, colors.HexColor('#ecf0f1')),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ecf0f1')),
        ('LINEBELOW', (0, len(invoice.items)), (-1, len(invoice.items)), 1, colors.HexColor('#ecf0f1')),
        ('LINEABOVE', (2, -1), (-1, -1), 1, colors.HexColor('#ecf0f1')),
        # Make the total row background darker
        ('BACKGROUND', (2, -1), (3, -1), colors.HexColor('#2c3e50')),
        ('TEXTCOLOR', (2, -1), (3, -1), colors.white),
        # Adequate padding
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 10*mm))  # Extra space after items table
    
    # Add notes if available
    if hasattr(invoice, 'notes') and invoice.notes:
        notes_label = get_translation('invoice.notes', language)
        elements.append(Paragraph(f"<font color='#2c3e50'><b>{notes_label}</b></font>", styles['Normal']))
        elements.append(Spacer(1, 3*mm))
        elements.append(Paragraph(invoice.notes, styles['Normal']))
        elements.append(Spacer(1, 8*mm))
    
    # Add payment instructions and bank details
    if settings:
        # Add payment instructions if available
        if hasattr(settings, 'invoice_footer') and settings.invoice_footer:
            payment_label = get_translation('invoice.payment_instructions', language)
            elements.append(Paragraph(f"<font color='#2c3e50'><b>{payment_label}</b></font>", styles['Normal']))
            elements.append(Spacer(1, 3*mm))
            elements.append(Paragraph(settings.invoice_footer, styles['Normal']))
            elements.append(Spacer(1, 8*mm))
        
    # Add bank details if available - use a table for better layout control
    if hasattr(settings, 'bank_name') and (settings.bank_name or settings.bank_iban or settings.bank_bic):
        bank_details_label = get_translation('invoice.bank_details', language)
        elements.append(Paragraph(f"<font color='#2c3e50'><b>{bank_details_label}</b></font>", styles['Normal']))
        elements.append(Spacer(1, 3*mm))
        
        # Get translations for bank details
        bank_name_label = get_translation('bank.name', language)
        bank_iban_label = get_translation('bank.iban', language)
        bank_bic_label = get_translation('bank.bic', language)
        
        # Create a table for bank details to keep them on one page
        bank_data = []
        if hasattr(settings, 'bank_name') and settings.bank_name:
            bank_data.append([Paragraph(f"<b>{bank_name_label}:</b>", styles['Normal']), 
                             Paragraph(settings.bank_name, styles['Normal'])])
        if hasattr(settings, 'bank_iban') and settings.bank_iban:
            bank_data.append([Paragraph(f"<b>{bank_iban_label}:</b>", styles['Normal']), 
                             Paragraph(settings.bank_iban, styles['Normal'])])
        if hasattr(settings, 'bank_bic') and settings.bank_bic:
            bank_data.append([Paragraph(f"<b>{bank_bic_label}:</b>", styles['Normal']), 
                             Paragraph(settings.bank_bic, styles['Normal'])])
        
        # Create a compact table for bank details
        if bank_data:
            bank_table = Table(bank_data, colWidths=[available_width * 0.2, available_width * 0.8])
            bank_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
                ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                ('TOPPADDING', (0, 0), (-1, -1), 1),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
            ]))
            elements.append(bank_table)
    
    # Build the PDF
    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes

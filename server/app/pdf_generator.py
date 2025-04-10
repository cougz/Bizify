from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration
from jinja2 import Environment, FileSystemLoader
import os
import tempfile
from datetime import datetime

# Set up Jinja2 environment
template_dir = os.path.join(os.path.dirname(__file__), 'templates')
if not os.path.exists(template_dir):
    os.makedirs(template_dir)
env = Environment(loader=FileSystemLoader(template_dir))

# Create invoice template if it doesn't exist
invoice_template_path = os.path.join(template_dir, 'invoice_template.html')
if not os.path.exists(invoice_template_path):
    with open(invoice_template_path, 'w') as f:
        f.write('''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ invoice.invoice_number }}</title>
    <style>
        @page {
            size: letter;
            margin: 1.5cm;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }
        .header {
            margin-bottom: 30px;
        }
        .company-info {
            float: left;
            width: 60%;
        }
        .invoice-info {
            float: right;
            width: 40%;
            text-align: right;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #2c3e50;
        }
        .invoice-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #2c3e50;
        }
        .invoice-number {
            font-size: 16px;
            margin-bottom: 5px;
        }
        .invoice-date {
            margin-bottom: 5px;
        }
        .invoice-due {
            margin-bottom: 20px;
        }
        .customer-info {
            margin-bottom: 30px;
            clear: both;
        }
        .customer-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .customer-name {
            font-weight: bold;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th {
            background-color: #f5f7fa;
            border-bottom: 2px solid #ddd;
            padding: 10px;
            text-align: left;
        }
        td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
        }
        .item-description {
            width: 50%;
        }
        .item-quantity, .item-price, .item-amount {
            width: 16.66%;
            text-align: right;
        }
        .totals {
            width: 30%;
            float: right;
            margin-bottom: 30px;
        }
        .totals table {
            width: 100%;
        }
        .totals td {
            border: none;
            padding: 5px 10px;
        }
        .totals .label {
            text-align: left;
        }
        .totals .amount {
            text-align: right;
        }
        .total-row td {
            font-weight: bold;
            border-top: 2px solid #ddd;
        }
        .notes {
            margin-top: 40px;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .notes-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            color: #777;
            font-size: 11px;
        }
        .status-paid {
            color: #27ae60;
            font-weight: bold;
        }
        .status-pending {
            color: #f39c12;
            font-weight: bold;
        }
        .status-overdue {
            color: #e74c3c;
            font-weight: bold;
        }
        .clearfix::after {
            content: "";
            clear: both;
            display: table;
        }
    </style>
</head>
<body>
    <div class="header clearfix">
        <div class="company-info">
            <div class="company-name">{{ settings.company_name }}</div>
            <div>{{ settings.company_address }}</div>
            <div>{{ settings.company_city }}, {{ settings.company_state }} {{ settings.company_zip }}</div>
            <div>{{ settings.company_country }}</div>
            <div>{{ settings.company_phone }}</div>
            <div>{{ settings.company_email }}</div>
            <div>{{ settings.company_website }}</div>
        </div>
        <div class="invoice-info">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-number"># {{ invoice.invoice_number }}</div>
            <div class="invoice-date">Issue Date: {{ invoice.issue_date.strftime('%B %d, %Y') }}</div>
            <div class="invoice-due">Due Date: {{ invoice.due_date.strftime('%B %d, %Y') }}</div>
            <div>
                Status: 
                {% if invoice.status == 'paid' %}
                <span class="status-paid">PAID</span>
                {% elif invoice.status == 'pending' %}
                <span class="status-pending">PENDING</span>
                {% elif invoice.status == 'overdue' %}
                <span class="status-overdue">OVERDUE</span>
                {% else %}
                {{ invoice.status.upper() }}
                {% endif %}
            </div>
        </div>
    </div>
    
    <div class="customer-info">
        <div class="customer-title">BILL TO:</div>
        <div class="customer-name">{{ invoice.customer.name }}</div>
        <div>{{ invoice.customer.company }}</div>
        <div>{{ invoice.customer.address }}</div>
        <div>{{ invoice.customer.city }}, {{ invoice.customer.state }} {{ invoice.customer.zip_code }}</div>
        <div>{{ invoice.customer.country }}</div>
        <div>{{ invoice.customer.phone }}</div>
        <div>{{ invoice.customer.email }}</div>
    </div>
    
    <table>
        <thead>
            <tr>
                <th class="item-description">Description</th>
                <th class="item-quantity">Quantity</th>
                <th class="item-price">Unit Price</th>
                <th class="item-amount">Amount</th>
            </tr>
        </thead>
        <tbody>
            {% for item in invoice.items %}
            <tr>
                <td class="item-description">{{ item.description }}</td>
                <td class="item-quantity">{{ item.quantity }}</td>
                <td class="item-price">{{ currency_symbol }}{{ "%.2f"|format(item.unit_price) }}</td>
                <td class="item-amount">{{ currency_symbol }}{{ "%.2f"|format(item.amount) }}</td>
            </tr>
            {% endfor %}
        </tbody>
    </table>
    
    <div class="totals">
        <table>
            <tr>
                <td class="label">Subtotal:</td>
                <td class="amount">{{ currency_symbol }}{{ "%.2f"|format(invoice.subtotal) }}</td>
            </tr>
            {% if invoice.discount > 0 %}
            <tr>
                <td class="label">Discount:</td>
                <td class="amount">{{ currency_symbol }}{{ "%.2f"|format(invoice.discount) }}</td>
            </tr>
            {% endif %}
            {% if invoice.tax_rate > 0 %}
            <tr>
                <td class="label">Tax ({{ "%.2f"|format(invoice.tax_rate) }}%):</td>
                <td class="amount">{{ currency_symbol }}{{ "%.2f"|format(invoice.tax_amount) }}</td>
            </tr>
            {% endif %}
            <tr class="total-row">
                <td class="label">Total:</td>
                <td class="amount">{{ currency_symbol }}{{ "%.2f"|format(invoice.total) }}</td>
            </tr>
        </table>
    </div>
    
    {% if invoice.notes %}
    <div class="notes">
        <div class="notes-title">Notes:</div>
        <div>{{ invoice.notes }}</div>
    </div>
    {% endif %}
    
    <div class="footer">
        {% if settings.invoice_footer %}
        {{ settings.invoice_footer }}
        {% else %}
        Thank you for your business!
        {% endif %}
    </div>
</body>
</html>
        ''')

def get_currency_symbol(currency_code):
    """Get currency symbol from currency code."""
    currency_symbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'CAD': 'C$',
        'AUD': 'A$',
        'CHF': 'CHF',
        'CNY': '¥',
        'INR': '₹',
        'BRL': 'R$',
        'RUB': '₽',
        'KRW': '₩',
        'SGD': 'S$',
        'NZD': 'NZ$',
        'MXN': 'MX$',
        'HKD': 'HK$',
    }
    return currency_symbols.get(currency_code, currency_code)

def generate_pdf(invoice, settings):
    """Generate PDF from invoice data."""
    # Load template
    template = env.get_template('invoice_template.html')
    
    # Get currency symbol
    currency_symbol = get_currency_symbol(settings.currency if settings else 'USD')
    
    # Render template with data
    html_content = template.render(
        invoice=invoice,
        settings=settings,
        currency_symbol=currency_symbol
    )
    
    # Configure fonts
    font_config = FontConfiguration()
    
    # Create PDF
    pdf = HTML(string=html_content).write_pdf(
        stylesheets=[],
        font_config=font_config
    )
    
    return pdf

# Development stage
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including WeasyPrint dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    bash \
    # WeasyPrint dependencies - more comprehensive list
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info \
    libpangoft2-1.0-0 \
    libharfbuzz0b \
    libxml2 \
    libxslt1.1 \
    libfribidi0 \
    # Additional dependencies for gobject
    libglib2.0-0 \
    libglib2.0-dev \
    libgirepository1.0-dev \
    gir1.2-pango-1.0 \
    gir1.2-gtk-3.0 \
    # Try to find the specific gobject library
    libgobject-2.0-0 \
    # Add more packages that might help
    libcairo-gobject2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libpangoft2-1.0-0 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create a simple PDF generator that doesn't use WeasyPrint
RUN mkdir -p /app/app
COPY server/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create a fallback PDF generator that doesn't use WeasyPrint
RUN echo 'from fpdf import FPDF\n\ndef generate_pdf(invoice_data):\n    pdf = FPDF()\n    pdf.add_page()\n    pdf.set_font("Arial", size=12)\n    pdf.cell(200, 10, txt=f"Invoice #{invoice_data.get(\"invoice_number\", \"N/A\")}", ln=True, align="C")\n    pdf.cell(200, 10, txt=f"Customer: {invoice_data.get(\"customer_name\", \"N/A\")}", ln=True)\n    pdf.cell(200, 10, txt=f"Total: ${invoice_data.get(\"total\", 0):.2f}", ln=True)\n    return pdf.output(dest="S").encode("latin1")\n' > /app/app/pdf_generator.py

# Install FPDF as a fallback
RUN pip install fpdf

# Set environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV DOCKER_ENV=true

# Create necessary directories
RUN mkdir -p /app/app/templates

# Expose port
EXPOSE 8000

# The actual code will be mounted as a volume in development mode
# This allows for hot-reloading of code changes

# Command will be provided by docker-compose.yml
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

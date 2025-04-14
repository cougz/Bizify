# Bizify - Business Management Application

Bizify is a comprehensive business management application that helps you manage customers, invoices, and more.

## Features

- Customer management
- Invoice creation and tracking
- Dashboard with business insights
- PDF invoice generation
- Dark mode support

## Development Setup

To run the application in development mode:

```bash
# Clone the repository
git clone https://github.com/yourusername/bizify.git
cd bizify

# Run the application
./run.sh
```

This will start the PostgreSQL database, backend API, and frontend services in development mode.

## Production Setup

To run the application in production mode:

```bash
# Clone the repository
git clone https://github.com/yourusername/bizify.git
cd bizify

# Create a production user (first time only)
# 1. Start the database service
docker-compose -f docker-compose.prod.yml up postgres -d

# 2. Run the user creation script
docker-compose -f docker-compose.prod.yml run backend python create_production_user.py

# 3. Stop the database
docker-compose -f docker-compose.prod.yml down

# Run the application in production mode
./run_production.sh
```

For subsequent runs, you can simply use:

```bash
./run_production.sh
```

## Adding Real Customer Data

In production mode, you can add real customer data through the web interface:

1. Navigate to the Customers page
2. Click on "Add Customer"
3. Fill in the customer details and save

## Adding Real Invoice Data

To create real invoices:

1. Navigate to the Invoices page
2. Click on "Create Invoice"
3. Select a customer, add line items, and save

## Technologies Used

- Frontend: React, TypeScript, Tailwind CSS
- Backend: FastAPI, SQLAlchemy
- Database: PostgreSQL
- Containerization: Docker, Docker Compose

## License

MIT

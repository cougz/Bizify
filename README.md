# Bizify - Business Management Application

Bizify is a comprehensive business management application that helps you manage customers, invoices, and more.

## Features

- Customer management
- Invoice creation and tracking
- Dashboard with business insights
- PDF invoice generation
- Dark mode support

## Setup

To run the application:

```bash
# Clone the repository
git clone https://github.com/yourusername/bizify.git
cd bizify

# Make the start script executable (Unix/Linux/macOS)
chmod +x start.sh

# Start the application
./start.sh
```

This will start the PostgreSQL database, backend API, and frontend services.

## Creating a User

For first-time setup, you'll want to create a user:

```bash
# Start just the database
docker compose up postgres -d

# Create a user
docker compose run backend python create_user.py

# Stop the database
docker compose down
```

Then start the application:

```bash
./start.sh
```

## Adding Customer Data

You can add customer data through the web interface:

1. Navigate to the Customers page
2. Click on "Add Customer"
3. Fill in the customer details and save

## Adding Invoice Data

To create invoices:

1. Navigate to the Invoices page
2. Click on "Create Invoice"
3. Select a customer, add line items, and save

## Dark Mode

Bizify includes a dark mode toggle in the top-right corner of the application.

## Troubleshooting

If you encounter any issues with the frontend not building correctly:

1. Stop all containers: `docker compose down`
2. Remove all containers: `docker compose rm -f`
3. Rebuild and start: `docker compose up --build`

## Technologies Used

- Frontend: React, TypeScript, Tailwind CSS
- Backend: FastAPI, SQLAlchemy
- Database: PostgreSQL
- Containerization: Docker, Docker Compose

## License

MIT

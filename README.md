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

# Start the application
docker compose up -d
```

This will start the PostgreSQL database, backend API, and frontend services. The frontend will be accessible at http://localhost:3000 and the backend API at http://localhost:8000.

## Creating a User

For first-time setup, you'll need to create a user. We've added a special service for this:

```bash
# Run the user creation service
docker compose --profile setup run create-user

# This will prompt you to enter:
# - Email address
# - Full name
# - Password (min 8 characters)
```

The user creation service will create a new user and default settings for your Bizify application.

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

If you encounter any issues with the application:

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

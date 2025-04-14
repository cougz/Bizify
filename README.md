# Bizify - Invoice Management System

Bizify is a comprehensive invoice management system that helps businesses create, manage, and track invoices and customers.

## Features

- **Customer Management**: Add, edit, and delete customer information
- **Invoice Creation**: Create professional invoices with line items, taxes, and discounts
- **Dashboard**: View key metrics and statistics about your business
- **PDF Generation**: Generate and download PDF invoices
- **Dark Mode**: Toggle between light and dark themes

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Installation and Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/bizify.git
   cd bizify
   ```

2. Start the application:
   ```
   docker compose up -d
   ```

   This will start the PostgreSQL database, backend API, and frontend services.

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

### First-time User Setup

The application comes with a default test user:
- Email: test@example.com
- Password: password123

You can also create a new user:

```
docker compose run backend python create_user.py
```

## Architecture

Bizify consists of three main components:

1. **PostgreSQL Database**: Stores all application data
2. **Backend API**: Built with FastAPI (Python)
3. **Frontend**: Built with React, TypeScript, and Tailwind CSS

## Development

### Backend Development

The backend is built with FastAPI and SQLAlchemy. The code is located in the `server` directory.

### Frontend Development

The frontend is built with React, TypeScript, and Tailwind CSS. The code is located in the `client` directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

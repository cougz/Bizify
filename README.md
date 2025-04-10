# Bizify - Business Management Dashboard

Bizify is a comprehensive business management dashboard focused on invoicing and customer management. It provides a clean, professional interface for managing your business operations.

## Features

- **Customer Management:** Create, view, edit, and manage customers with detailed analytics
- **Invoicing System:** Create and manage invoices with status tracking and PDF generation
- **Dashboard Analytics:** Visual representation of business metrics and KPIs
- **User Authentication:** Secure login and registration system

## Tech Stack

### Frontend
- React with TypeScript
- Context API for state management
- React Router for navigation
- Chart.js for data visualization
- Responsive design with CSS

### Backend
- Python FastAPI
- PostgreSQL database
- SQLAlchemy ORM
- JWT authentication
- WeasyPrint for PDF generation

### Deployment
- Docker containerization
- Docker Compose for local development
- Kubernetes-ready structure for future scaling

## Getting Started

### Prerequisites
- Docker and Docker Compose

### Installation

1. Clone the repository
2. Run the setup script:
   ```bash
   ./setup.sh
   ```
3. Start the application:
   ```bash
   ./run.sh
   ```
   
   To rebuild containers after making changes:
   ```bash
   ./run.sh --build
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Test Credentials

For testing purposes, you can use:
- Email: test@example.com
- Password: password123

## Project Structure

```
bizify/
├── client/               # React TypeScript frontend
│   ├── public/           # Static assets
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── contexts/     # React Context providers
│       ├── layouts/      # Page layouts
│       ├── pages/        # Page components
│       └── utils/        # Utility functions
├── server/               # Python FastAPI backend
│   ├── app/              # Application code
│   │   ├── models.py     # Database models
│   │   ├── schemas.py    # Pydantic schemas
│   │   ├── crud.py       # CRUD operations
│   │   ├── auth.py       # Authentication
│   │   └── main.py       # Main application
│   └── migrations/       # Database migrations
├── docker/               # Dockerfiles
├── k8s/                  # Kubernetes configurations
└── docker-compose.yml    # Docker Compose configuration
```

## Development

### Making Changes

The Docker setup includes volume mounts for both the frontend and backend code, so you can make changes to the code and see them reflected immediately:

1. Frontend changes will be automatically detected and the browser will refresh
2. Backend changes will trigger a reload of the FastAPI server
3. Database changes persist in a Docker volume

### Database

The PostgreSQL database is automatically set up with the required schema and seed data when the containers start. The database data is persisted in a Docker volume, so it will be preserved between container restarts.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

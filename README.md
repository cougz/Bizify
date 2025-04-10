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
- Node.js (for local frontend development)
- Python 3.11+ (for local backend development)

### Running with Docker

1. Clone the repository
2. Navigate to the project directory
3. Run Docker Compose:
   ```
   docker-compose up
   ```
4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Development Setup

#### Frontend
```bash
cd client
npm install
npm start
```

#### Backend
```bash
cd server
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Project Structure

```
bizify/
├── client/               # React TypeScript frontend
├── server/               # Python FastAPI backend
│   └── app/              # Application code
│       ├── models.py     # Database models
│       ├── schemas.py    # Pydantic schemas
│       ├── crud.py       # CRUD operations
│       ├── auth.py       # Authentication
│       └── main.py       # Main application
├── docker/               # Dockerfiles
├── k8s/                  # Kubernetes configurations (placeholder)
└── docker-compose.yml    # Docker Compose configuration
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

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
- Docker and Docker Compose (for containerized mode)
- Node.js (for frontend development)
- Python 3.8+ (for backend development)
- PostgreSQL (for local development without Docker)

### Installation Options

#### Option 1: Using Docker (Recommended)

This is the easiest way to get started as it sets up everything including the PostgreSQL database in containers:

1. Clone the repository
2. Run the setup script:
   ```bash
   ./setup.sh
   ```
3. Start the application:
   ```bash
   ./run.sh
   ```
4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

#### Option 2: Local Development

For local development without Docker, you'll need to set up PostgreSQL manually:

1. Clone the repository
2. Install PostgreSQL and create a database:
   ```bash
   # Create database and user (commands may vary based on your PostgreSQL installation)
   createdb bizify
   createuser -P bizify  # Set password to 'bizify_password'
   psql -c "GRANT ALL PRIVILEGES ON DATABASE bizify TO bizify;"
   ```
3. Run the setup script:
   ```bash
   ./setup.sh
   ```
4. Start the application in development mode:
   ```bash
   ./run.sh --dev
   ```
   
   Alternatively, you can start the frontend and backend separately:
   ```bash
   # Terminal 1 - Frontend
   cd client
   npm start
   
   # Terminal 2 - Backend
   cd server
   source ../venv/bin/activate  # On Windows: .\venv\Scripts\activate
   python run.py
   ```

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

### Virtual Environment

The setup script creates a Python virtual environment in the `venv` directory. To activate it manually:

```bash
# On Linux/macOS
source venv/bin/activate

# On Windows
.\venv\Scripts\activate
```

### Database Migrations

To manually run database migrations:

```bash
cd server
source ../venv/bin/activate  # On Windows: .\venv\Scripts\activate
python setup_db.py
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

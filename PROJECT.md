# PROJECT.md

## Project Overview

**Project Name**: Bizify - Invoice Management System
**Description**: A comprehensive full-stack invoice management application for businesses to create, manage, and track invoices and customers with professional PDF generation capabilities
**Tech Stack**: React/TypeScript (Frontend), FastAPI/Python (Backend), PostgreSQL, Docker, Tailwind CSS, ReportLab
**Development Approach**: Feature-driven development with emphasis on user experience and production readiness

## Current Status

**Last Updated**: 2025-08-05
**Current Phase**: Bug fixing and modernization phase
**Build Status**: Partial - Frontend dependencies not installed locally
**Test Coverage**: Limited - Basic backend API tests exist, frontend tests not configured

### Recent Changes
- Fixed PDF generation invoice status display issues
- Modernization efforts in progress
- Fixed overlapping text issues in PDF layout
- Improved PDF layout with responsive column widths and better text wrapping
- Fixed status display by converting to string in crud.py

## Codebase Structure

```
Bizify/
├── client/                    # React Frontend Application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   └── Card.tsx
│   │   ├── contexts/         # React Context providers
│   │   │   ├── AuthContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── layouts/          # Layout components
│   │   │   └── Layout.tsx
│   │   ├── pages/            # Route page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Customers.tsx
│   │   │   ├── Invoices.tsx
│   │   │   └── Settings.tsx
│   │   └── utils/            # Utilities and API client
│   │       ├── api.ts
│   │       └── validators.ts
├── server/                    # FastAPI Backend Application
│   ├── app/
│   │   ├── models.py         # SQLAlchemy ORM models
│   │   ├── schemas.py        # Pydantic validation schemas
│   │   ├── crud.py           # Database operations
│   │   ├── auth.py           # JWT authentication
│   │   ├── main.py           # FastAPI routes & app
│   │   ├── pdf_generator.py  # PDF invoice generation
│   │   └── migration_manager.py # DB migration system
│   └── migrations/           # Database migration files
├── docker/                   # Docker configurations
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
├── k8s/                      # Kubernetes manifests (placeholder)
└── compose.yaml              # Docker Compose configuration
```

## Task List

### Current Sprint

#### 🔴 In Progress
- [ ] **Task ID: SEC-001**
  - Description: Remove debug print statements from production code
  - Acceptance Criteria:
    - All print() statements removed from crud.py
    - All console.log statements properly gated by environment
    - Production builds have no debug output
  - Next Steps:
    1. Remove debug prints from server/app/crud.py (lines 325-326, 532-534, 609, 615, 619, 625, 636, 643)
    2. Remove debug prints from server/app/pdf_generator.py (lines 157, 163, 186, 264-265, 289, 291, 327)
    3. Update client/src/utils/api.ts to properly gate console logs
    4. Test application functionality after cleanup

#### 📋 Backlog

##### High Priority
- [ ] **Task ID: SEC-002**
  - Description: Replace hardcoded secrets with environment variables
  - Acceptance Criteria:
    - No hardcoded passwords in compose.yaml
    - Secret key properly configured from environment
    - K8s secrets properly managed
  - Dependencies: None

- [ ] **Task ID: SEC-003**
  - Description: Implement secure token storage
  - Acceptance Criteria:
    - Replace localStorage with httpOnly cookies
    - Implement CSRF protection
    - Add token refresh mechanism
  - Dependencies: None

- [ ] **Task ID: PERF-001**
  - Description: Optimize database queries
  - Acceptance Criteria:
    - Add proper database indexes
    - Implement pagination for dashboard
    - Cache frequently accessed data
  - Dependencies: None

##### Medium Priority
- [ ] **Task ID: QUAL-001**
  - Description: Extract repeated code patterns
  - Acceptance Criteria:
    - Date formatting utility function created
    - Validation logic centralized
    - No code duplication
  - Dependencies: None

- [ ] **Task ID: TEST-001**
  - Description: Implement comprehensive test coverage
  - Acceptance Criteria:
    - Frontend tests configured and running
    - Backend test coverage > 80%
    - CI/CD pipeline with test automation
  - Dependencies: None

- [ ] **Task ID: FEAT-001**
  - Description: Complete Kubernetes deployment configuration
  - Acceptance Criteria:
    - Proper PostgreSQL StatefulSet
    - ConfigMaps and Secrets properly configured
    - Ingress configuration added
  - Dependencies: SEC-002

##### Low Priority
- [ ] **Task ID: DOC-001**
  - Description: Create comprehensive API documentation
  - Acceptance Criteria:
    - All endpoints documented
    - Request/response examples provided
    - Authentication flow documented
  - Dependencies: None

#### ✅ Completed
- [x] **Task ID: BUG-001**
  - Description: Fix PDF generation invoice status display
  - Completed: 2025-08-05
  - Notes: Status now properly converts to string in crud.py

- [x] **Task ID: BUG-002**
  - Description: Fix PDF layout overlapping issues
  - Completed: 2025-08-05
  - Notes: Improved responsive column widths and text wrapping

## Important Context

### Known Issues
- **Issue**: Debug print statements throughout production code
  - Workaround: Currently visible in Docker logs
  - Planned fix: SEC-001

- **Issue**: Hardcoded secrets in configuration files
  - Workaround: Only use in development
  - Planned fix: SEC-002

- **Issue**: No test coverage reporting
  - Workaround: Manual testing
  - Planned fix: TEST-001

### Architecture Decisions
- **Decision**: Use FastAPI over Django/Flask
  - Rationale: Modern async framework with automatic API documentation
  - Date: Project inception

- **Decision**: React Context API over Redux
  - Rationale: Simpler state management for current application size
  - Date: Project inception

- **Decision**: Custom migration system over Alembic
  - Rationale: Simpler setup for small team
  - Date: Project inception

- **Decision**: ReportLab for PDF generation
  - Rationale: Full control over PDF layout and styling
  - Date: When implementing invoice generation

### External Dependencies
- **PostgreSQL Database**
  - Version: 15
  - Connection: Via SQLAlchemy ORM
  - Migrations: Custom migration_manager.py

- **Authentication**: JWT tokens
  - Library: python-jose
  - Token expiration: 30 minutes
  - Storage: localStorage (to be changed)

### Gotchas & Learnings
- Invoice status must be converted to string for PDF generation
- PDF text wrapping requires careful width calculations in ReportLab
- Token expiration of 30 minutes may be too short for user experience
- Frontend validation doesn't match backend password requirements (8+ chars)
- Database migrations run automatically on server startup
- Company logo processing in PDF can fail silently - needs proper error handling

## Next Session Starting Point

**Priority**: Complete SEC-001 - Remove all debug print statements
**Current State**: Debug statements identified across multiple files
**Next Action**: Start removing print statements from server/app/crud.py

## Commands Reference

```bash
# Start development environment
docker compose up -d --build

# View logs
docker compose logs -f

# Access containers
docker compose exec server bash
docker compose exec client sh
docker compose exec db psql -U bizify_user -d bizify_db

# Run backend tests (from server directory)
pytest -v

# Run frontend tests (from client directory)
npm test

# Build production images
docker build -f docker/backend.Dockerfile -t bizify-backend .
docker build -f docker/frontend.Dockerfile -t bizify-frontend .

# Database operations
# Connect to database
docker compose exec db psql -U bizify_user -d bizify_db

# View migrations
docker compose exec server python -c "from app.migration_manager import MigrationManager; MigrationManager().list_migrations()"
```

## Update Log

### 2025-08-05
- Created initial PROJECT.md based on comprehensive codebase analysis
- Identified critical security issues requiring immediate attention
- Documented all debug print statements that need removal
- Found test infrastructure exists but needs configuration
- Recent focus has been on PDF generation bug fixes

### Recent Git History
- f37cc19: modernization
- c9624b0: fix PDF generation invoice status
- 97f6b24: PDF invoice status fixes
- 4af1f56: pdf fixes
- 134082c: Fix invoice status display in PDF
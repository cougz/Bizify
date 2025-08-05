# Bizify - Invoice Management System

![Bizify Logo](assets/logo.jpg)

Bizify is a comprehensive invoice management system that helps businesses create, manage, and track invoices and customers efficiently. With a modern interface and powerful features, Bizify streamlines your invoicing workflow.

## 📸 Screenshots

![Dashboard Screenshot](assets/screenshot-dashboard.png)
![Invoice Management Screenshot](assets/screenshot-invoices.png)

## ✨ Features

- **Customer Management**: Add, edit, and delete customer information
- **Invoice Creation**: Create professional invoices with line items, taxes, and discounts
- **Dashboard**: View key metrics and statistics about your business
- **PDF Generation**: Generate and download professional PDF invoices with your company logo
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices
- **User Settings**: Customize your company information and preferences
- **Multi-language Support**: Available in English and German

## 🚀 Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Installation and Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/Bizify.git
   cd Bizify
   ```

2. Start the application (first time):
   ```
   docker compose up -d --build
   ```

   This will build the containers, start the PostgreSQL database, backend API, and frontend services.

3. For subsequent starts:
   ```
   docker compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

### User Registration

When you first access the application, you'll need to:

1. Register a new account using the registration page
2. Set up your company information in the Settings page
3. Start adding customers and creating invoices

## 🏗️ Architecture

Bizify consists of three main components:

1. **PostgreSQL Database**: Stores all application data
2. **Backend API**: Built with FastAPI (Python)
3. **Frontend**: Built with React, TypeScript, and Tailwind CSS

```
├── client/           # React frontend
├── server/           # FastAPI backend
├── docker/           # Dockerfiles
├── compose.yaml      # Docker Compose configuration
└── assets/           # Images for README and documentation
```

## 🔧 Configuration

### CORS Configuration

Bizify includes configurable Cross-Origin Resource Sharing (CORS) settings to ensure secure communication between your frontend and backend. CORS is crucial for production deployments and can be customized based on your environment.

#### Environment Variables

Configure CORS using these environment variables:

- **`CORS_ORIGINS`**: Comma-separated list of allowed origins (default: `http://localhost:3000,http://127.0.0.1:3000`)
- **`CORS_METHODS`**: Allowed HTTP methods (default: `GET,POST,PUT,DELETE,OPTIONS`)
- **`CORS_HEADERS`**: Allowed request headers (default: `Content-Type,Authorization`)
- **`CORS_CREDENTIALS`**: Allow credentials in requests (default: `true`)

#### Quick Setup

1. **Development (default)**: No changes needed - works with localhost:3000
2. **Production**: Create a `.env` file or set environment variables:
   ```bash
   # Copy example configuration
   cp .env.example .env
   
   # Edit .env with your production domains
   CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```

#### Security Notes

- ⚠️ **Never use `*` for origins in production** - always specify exact domains
- ✅ **Use HTTPS** for production origins
- ✅ **Test CORS configuration** after changes using the provided test script: `./test_cors.sh`

📖 **For detailed CORS configuration guide, see [CORS_CONFIG.md](CORS_CONFIG.md)**

## 💻 Development

### Backend Development

The backend is built with FastAPI and SQLAlchemy. The code is located in the `server` directory.

To run the backend separately for development:

```
cd server
pip install -r requirements.txt
python run.py
```

### Frontend Development

The frontend is built with React, TypeScript, and Tailwind CSS. The code is located in the `client` directory.

To run the frontend separately for development:

```
cd client
npm install
npm start
```

## 🚢 Deployment

The application can be deployed using Docker Compose or Kubernetes:

### Docker Compose Deployment

1. **Configure environment variables for production**:
   ```bash
   # Create production environment file
   cp .env.example .env
   
   # Edit .env with your production settings
   CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   CORS_CREDENTIALS=true
   ```

2. **Deploy with Docker Compose**:
   ```bash
   docker compose up -d --build
   ```

### Kubernetes Deployment

- Use the configuration files in the `k8s` directory
- Ensure CORS environment variables are properly configured in your deployment manifests

### Production CORS Checklist

- ✅ Set specific domains in `CORS_ORIGINS` (no wildcards)
- ✅ Use HTTPS origins only
- ✅ Test CORS configuration with your frontend
- ✅ Monitor CORS logs on application startup

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
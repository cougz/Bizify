import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authAPI } from './utils/api';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Contexts
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import CreateCustomer from './pages/CreateCustomer';
import Invoices from './pages/Invoices';
import InvoiceDetail from './pages/InvoiceDetail';
import CreateInvoice from './pages/CreateInvoice';
import NotFound from './pages/NotFound';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// First time setup detection
const AppRoutes: React.FC = () => {
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkFirstTimeSetup = async () => {
      try {
        // Check if there are any users in the system
        const response = await authAPI.checkSetup();
        setIsFirstTimeSetup(response.data.isFirstTimeSetup);
      } catch (error) {
        console.error('Error checking first time setup:', error);
        // Default to false if there's an error
        setIsFirstTimeSetup(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkFirstTimeSetup();
  }, []);
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={
        isFirstTimeSetup === null ? (
          <div className="flex items-center justify-center h-screen">Loading...</div>
        ) : isFirstTimeSetup ? (
          <Navigate to="/register" />
        ) : (
          <AuthLayout>
            <Login />
          </AuthLayout>
        )
      } />
      
      <Route path="/register" element={
        <AuthLayout>
          <Register isFirstTimeSetup={isFirstTimeSetup || false} />
        </AuthLayout>
      } />
      
      <Route path="/" element={
        isFirstTimeSetup === null ? (
          <div className="flex items-center justify-center h-screen">Loading...</div>
        ) : isFirstTimeSetup ? (
          <Navigate to="/register" />
        ) : (
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        )
      } />
      
      <Route path="/customers" element={
        <ProtectedRoute>
          <MainLayout>
            <Customers />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/customers/new" element={
        <ProtectedRoute>
          <MainLayout>
            <CreateCustomer />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/customers/edit/:id" element={
        <ProtectedRoute>
          <MainLayout>
            <CreateCustomer />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/customers/:id" element={
        <ProtectedRoute>
          <MainLayout>
            <CustomerDetail />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/invoices" element={
        <ProtectedRoute>
          <MainLayout>
            <Invoices />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/invoices/:id" element={
        <ProtectedRoute>
          <MainLayout>
            <InvoiceDetail />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Add all routes for creating invoices */}
      <Route path="/invoices/new" element={
        <ProtectedRoute>
          <MainLayout>
            <CreateInvoice />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/invoices/create" element={
        <ProtectedRoute>
          <MainLayout>
            <CreateInvoice />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/invoices/edit/:id" element={
        <ProtectedRoute>
          <MainLayout>
            <CreateInvoice />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/invoices/create" element={
        <ProtectedRoute>
          <MainLayout>
            <CreateInvoice />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout>
            <Settings />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* 404 route */}
      <Route path="*" element={
        <ProtectedRoute>
          <MainLayout>
            <NotFound />
          </MainLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

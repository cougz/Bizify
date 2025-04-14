import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

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
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Settings from './pages/Settings';

// Check if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated && isProduction) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={
            isProduction ? (
              <AuthLayout>
                <Login />
              </AuthLayout>
            ) : (
              <Navigate to="/" />
            )
          } />
          
          <Route path="/register" element={
            isProduction ? (
              <AuthLayout>
                <Register />
              </AuthLayout>
            ) : (
              <Navigate to="/" />
            )
          } />
          
          {/* Main routes - protected in production */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
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
          
          {/* Add both routes for creating invoices */}
          <Route path="/invoices/new" element={
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
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

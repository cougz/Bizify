import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Invoices from './pages/Invoices';
import InvoiceDetail from './pages/InvoiceDetail';
import CreateInvoice from './pages/CreateInvoice';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Settings from './pages/Settings';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // In a real app, you would check if the user is authenticated
  const isAuthenticated = true; // For demo purposes, always authenticated
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // For demo purposes
  
  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
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
        
        <Route path="/invoices/new" element={
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
          <MainLayout>
            <NotFound />
          </MainLayout>
        } />
      </Routes>
    </Router>
  );
};

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';

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

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Auth routes - redirected to dashboard for demo */}
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="/register" element={<Navigate to="/" />} />
        
        {/* Main routes - no authentication required for demo */}
        <Route path="/" element={
          <MainLayout>
            <Dashboard />
          </MainLayout>
        } />
        
        <Route path="/customers" element={
          <MainLayout>
            <Customers />
          </MainLayout>
        } />
        
        <Route path="/customers/new" element={
          <MainLayout>
            <CreateCustomer />
          </MainLayout>
        } />
        
        <Route path="/customers/:id" element={
          <MainLayout>
            <CustomerDetail />
          </MainLayout>
        } />
        
        <Route path="/invoices" element={
          <MainLayout>
            <Invoices />
          </MainLayout>
        } />
        
        <Route path="/invoices/:id" element={
          <MainLayout>
            <InvoiceDetail />
          </MainLayout>
        } />
        
        {/* Add both routes for creating invoices */}
        <Route path="/invoices/new" element={
          <MainLayout>
            <CreateInvoice />
          </MainLayout>
        } />
        
        <Route path="/dashboard/invoices/create" element={
          <MainLayout>
            <CreateInvoice />
          </MainLayout>
        } />
        
        <Route path="/settings" element={
          <MainLayout>
            <Settings />
          </MainLayout>
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

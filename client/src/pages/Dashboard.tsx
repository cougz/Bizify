import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../utils/api';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  totalInvoices: number;
  invoicesPaid: number;
  invoicesOverdue: number;
  invoicesDraft: number;
  revenueTotal: number;
  revenueOverdue: number;
  revenuePaid: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    totalInvoices: 0,
    invoicesPaid: 0,
    invoicesOverdue: 0,
    invoicesDraft: 0,
    revenueTotal: 0,
    revenueOverdue: 0,
    revenuePaid: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // For now, use mock data since we don't have a real API yet
        // const response = await dashboardAPI.getData();
        // setStats(response.data);
        
        // Mock data
        setStats({
          totalCustomers: 24,
          activeCustomers: 18,
          totalInvoices: 56,
          invoicesPaid: 42,
          invoicesOverdue: 8,
          invoicesDraft: 6,
          revenueTotal: 24500,
          revenueOverdue: 3200,
          revenuePaid: 21300
        });
        
        setError('');
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="Loading dashboard data..." />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Customers">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Customers</span>
              <span className="text-xl font-semibold">{formatNumber(stats.totalCustomers)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Customers</span>
              <span className="text-xl font-semibold">{formatNumber(stats.activeCustomers)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Customer Retention</span>
              <span className="text-xl font-semibold">
                {Math.round((stats.activeCustomers / stats.totalCustomers) * 100)}%
              </span>
            </div>
          </div>
        </Card>
        
        <Card title="Invoices">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Invoices</span>
              <span className="text-xl font-semibold">{formatNumber(stats.totalInvoices)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Paid</span>
              <span className="text-xl font-semibold text-green-600">{formatNumber(stats.invoicesPaid)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Overdue</span>
              <span className="text-xl font-semibold text-red-600">{formatNumber(stats.invoicesOverdue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Draft</span>
              <span className="text-xl font-semibold text-gray-500">{formatNumber(stats.invoicesDraft)}</span>
            </div>
          </div>
        </Card>
        
        <Card title="Revenue">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Revenue</span>
              <span className="text-xl font-semibold">{formatCurrency(stats.revenueTotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Paid</span>
              <span className="text-xl font-semibold text-green-600">{formatCurrency(stats.revenuePaid)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Overdue</span>
              <span className="text-xl font-semibold text-red-600">{formatCurrency(stats.revenueOverdue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Collection Rate</span>
              <span className="text-xl font-semibold">
                {Math.round((stats.revenuePaid / stats.revenueTotal) * 100)}%
              </span>
            </div>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Recent Invoices">
          <p className="text-gray-600">No recent invoices found.</p>
        </Card>
        
        <Card title="Top Customers">
          <p className="text-gray-600">No customer data available.</p>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

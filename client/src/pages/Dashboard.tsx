import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiUsers, FiFileText, FiDollarSign } from 'react-icons/fi';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

interface DashboardData {
  total_customers: number;
  total_invoices: number;
  total_revenue: number;
  revenue_change: number;
  pending_invoices: number;
  paid_invoices: number;
  overdue_invoices: number;
  revenue_data: Array<{ month: string; revenue: number }>;
  invoice_status_data: {
    labels: string[];
    data: number[];
  };
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch real data from the API
        const response = await dashboardAPI.getData();
        setData(response.data);
        setError('');
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
        
        // Fallback to empty data structure if API fails
        setData({
          total_customers: 0,
          total_invoices: 0,
          total_revenue: 0,
          revenue_change: 0,
          pending_invoices: 0,
          paid_invoices: 0,
          overdue_invoices: 0,
          revenue_data: [
            { month: 'Jan', revenue: 0 },
            { month: 'Feb', revenue: 0 },
            { month: 'Mar', revenue: 0 },
            { month: 'Apr', revenue: 0 },
            { month: 'May', revenue: 0 },
            { month: 'Jun', revenue: 0 }
          ],
          invoice_status_data: {
            labels: ['Paid', 'Pending', 'Overdue'],
            data: [0, 0, 0]
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onDismiss={() => setError('')} />;
  }

  if (!data) {
    return <div>No data available</div>;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex space-x-2">
          <Link to="/customers/new">
            <Button variant="outline">
              <FiUsers className="mr-2" />
              New Customer
            </Button>
          </Link>
          <Link to="/dashboard/invoices/create">
            <Button variant="primary">
              <FiPlus className="mr-2" />
              Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(data.total_revenue)}
          icon={<FiDollarSign className="h-6 w-6 text-green-500" />}
          change={data.revenue_change}
          trend={data.revenue_change >= 0 ? 'up' : 'down'}
        />
        
        <StatCard 
          title="Customers" 
          value={data.total_customers.toString()}
          icon={<FiUsers className="h-6 w-6 text-blue-500" />}
        />
        
        <StatCard 
          title="Invoices" 
          value={data.total_invoices.toString()}
          icon={<FiFileText className="h-6 w-6 text-indigo-500" />}
        />
        
        <StatCard 
          title="Pending Invoices" 
          value={data.pending_invoices.toString()}
          icon={<FiFileText className="h-6 w-6 text-yellow-500" />}
        />
      </div>

      {/* Revenue Chart */}
      <Card>
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Revenue Overview</h2>
          <div className="h-64">
            {/* In a real app, you would use Chart.js or another charting library */}
            <div className="flex h-48 items-end space-x-2">
              {data.revenue_data.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ 
                      height: `${(item.revenue / Math.max(...data.revenue_data.map(d => d.revenue))) * 100}%` 
                    }}
                  ></div>
                  <div className="text-xs mt-2 text-gray-600">{item.month}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Invoice Status */}
      <Card>
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Invoice Status</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{data.paid_invoices}</div>
              <div className="text-sm text-gray-600">Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{data.pending_invoices}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{data.overdue_invoices}</div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/customers" className="block">
              <div className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <FiUsers className="h-6 w-6 text-blue-500 mb-2" />
                <h3 className="font-medium">Manage Customers</h3>
                <p className="text-sm text-gray-600">View and manage your customers</p>
              </div>
            </Link>
            
            <Link to="/invoices" className="block">
              <div className="p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                <FiFileText className="h-6 w-6 text-indigo-500 mb-2" />
                <h3 className="font-medium">Manage Invoices</h3>
                <p className="text-sm text-gray-600">View and manage your invoices</p>
              </div>
            </Link>
            
            <Link to="/settings" className="block">
              <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <FiDollarSign className="h-6 w-6 text-gray-500 mb-2" />
                <h3 className="font-medium">Company Settings</h3>
                <p className="text-sm text-gray-600">Update your company information</p>
              </div>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;

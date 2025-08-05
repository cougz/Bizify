import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiUsers, FiFileText, FiDollarSign } from 'react-icons/fi';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { dashboardAPI, settingsAPI } from '../utils/api';
import { formatCurrency } from '../utils/formatters';

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
  const [currency, setCurrency] = useState<string>('USD');

  // Generate sample data for demonstration when no real data exists
  const generateSampleData = (): DashboardData => {
    const currentDate = new Date();
    const months = [];
    
    // Generate last 6 months with varied data to test proportional scaling
    const sampleRevenues = [1200, 800, 2200, 4500, 3100, 1800]; // Varied amounts
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        revenue: sampleRevenues[5 - i] // Use predefined varied amounts
      });
    }
    
    return {
      total_customers: 12,
      total_invoices: 45,
      total_revenue: 13600, // Sum of sample revenues
      revenue_change: 12.5,
      pending_invoices: 8,
      paid_invoices: 32,
      overdue_invoices: 5,
      revenue_data: months,
      invoice_status_data: {
        labels: ['Paid', 'Pending', 'Overdue'],
        data: [32, 8, 5]
      }
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch both dashboard data and settings in parallel
        const [dashboardResponse, settingsResponse] = await Promise.all([
          dashboardAPI.getData(),
          settingsAPI.get()
        ]);
        
        setData(dashboardResponse.data);
        setCurrency(settingsResponse.data.currency || 'USD');
        setError('');
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
        
        // For development: use sample data to demonstrate chart functionality
        // In production: show empty state
        if (process.env.NODE_ENV === 'development') {
          console.log('Using sample data for development');
          setData(generateSampleData());
          setCurrency('EUR'); // Test with EUR formatting
        } else {
          // Production: show empty state
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
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
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
          value={formatCurrency(data.total_revenue, currency)}
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
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Revenue Overview</h2>
          <div className="h-64 relative">
            {data.revenue_data.every(item => item.revenue === 0) ? (
              /* No data message */
              <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <div className="text-sm mb-1">No revenue data available</div>
                  <div className="text-xs">Revenue will appear here once you have paid invoices</div>
                </div>
              </div>
            ) : (
              /* Chart with data */
              <div className="flex h-48 items-end space-x-2">
                {data.revenue_data.map((item, index) => {
                  // Calculate max revenue for proportional heights
                  const maxRevenue = Math.max(...data.revenue_data.map(d => d.revenue));
                  const heightPercentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div className="relative w-full">
                        {/* Tooltip showing actual value */}
                        <div className="opacity-0 hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 transition-opacity">
                          {formatCurrency(item.revenue, currency)}
                        </div>
                        <div 
                          className={`w-full rounded-t transition-all duration-300 ${
                            item.revenue > 0 
                              ? 'bg-blue-500 hover:bg-blue-600' 
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                          style={{ 
                            height: `${heightPercentage}%`,
                            minHeight: item.revenue > 0 ? '8px' : '4px'
                          }}
                        ></div>
                      </div>
                      <div className="text-xs mt-2 text-gray-600 dark:text-gray-400">{item.month}</div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Month labels for empty state */}
            {data.revenue_data.every(item => item.revenue === 0) && (
              <div className="flex justify-between px-2 mt-2">
                {data.revenue_data.map((item, index) => (
                  <div key={index} className="text-xs text-gray-600 dark:text-gray-400 flex-1 text-center">
                    {item.month}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Invoice Status */}
      <Card>
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Invoice Status</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{data.paid_invoices}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{data.pending_invoices}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{data.overdue_invoices}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Overdue</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/customers" className="block">
              <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors">
                <FiUsers className="h-6 w-6 text-blue-500 dark:text-blue-300 mb-2" />
                <h3 className="font-medium dark:text-gray-100">Manage Customers</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">View and manage your customers</p>
              </div>
            </Link>
            
            <Link to="/invoices" className="block">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors">
                <FiFileText className="h-6 w-6 text-indigo-500 dark:text-indigo-300 mb-2" />
                <h3 className="font-medium dark:text-gray-100">Manage Invoices</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">View and manage your invoices</p>
              </div>
            </Link>
            
            <Link to="/settings" className="block">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <FiDollarSign className="h-6 w-6 text-gray-500 dark:text-gray-400 mb-2" />
                <h3 className="font-medium dark:text-gray-100">Company Settings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Update your company information</p>
              </div>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;

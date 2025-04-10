import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiUsers, FiFileText, FiDollarSign, FiArrowUp, FiArrowDown, FiClock } from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

interface DashboardStats {
  totalCustomers: number;
  totalInvoices: number;
  totalRevenue: number;
  revenueChange: number;
  pendingInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
}

interface RevenueData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
}

interface InvoiceStatusData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderWidth: number;
  }[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    revenueChange: 0,
    pendingInvoices: 0,
    paidInvoices: 0,
    overdueInvoices: 0
  });
  const [revenueData, setRevenueData] = useState<RevenueData>({
    labels: [],
    datasets: [
      {
        label: 'Revenue',
        data: [],
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
      },
    ],
  });
  const [invoiceStatusData, setInvoiceStatusData] = useState<InvoiceStatusData>({
    labels: ['Paid', 'Pending', 'Overdue'],
    datasets: [
      {
        label: 'Invoice Status',
        data: [0, 0, 0],
        backgroundColor: [
          '#2ecc71',
          '#f39c12',
          '#e74c3c',
        ],
        borderWidth: 0,
      },
    ],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, these would be actual API calls
        // For now, we'll simulate the data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockStats: DashboardStats = {
          totalCustomers: 124,
          totalInvoices: 287,
          totalRevenue: 42680.50,
          revenueChange: 12.5,
          pendingInvoices: 18,
          paidInvoices: 253,
          overdueInvoices: 16
        };
        
        const mockRevenueData: RevenueData = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Revenue',
              data: [4200, 5100, 6800, 7200, 8900, 10500],
              borderColor: '#3498db',
              backgroundColor: 'rgba(52, 152, 219, 0.2)',
            },
          ],
        };
        
        const mockInvoiceStatusData: InvoiceStatusData = {
          labels: ['Paid', 'Pending', 'Overdue'],
          datasets: [
            {
              label: 'Invoice Status',
              data: [mockStats.paidInvoices, mockStats.pendingInvoices, mockStats.overdueInvoices],
              backgroundColor: [
                '#2ecc71',
                '#f39c12',
                '#e74c3c',
              ],
              borderWidth: 0,
            },
          ],
        };
        
        setStats(mockStats);
        setRevenueData(mockRevenueData);
        setInvoiceStatusData(mockInvoiceStatusData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Customers</h3>
            <div className="bg-blue-100 p-2 rounded-full">
              <FiUsers className="text-primary-color" size={20} />
            </div>
          </div>
          <div className="flex items-end">
            <h2 className="text-3xl font-bold">{stats.totalCustomers}</h2>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Invoices</h3>
            <div className="bg-green-100 p-2 rounded-full">
              <FiFileText className="text-success-color" size={20} />
            </div>
          </div>
          <div className="flex items-end">
            <h2 className="text-3xl font-bold">{stats.totalInvoices}</h2>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
            <div className="bg-purple-100 p-2 rounded-full">
              <FiDollarSign className="text-purple-600" size={20} />
            </div>
          </div>
          <div className="flex items-end">
            <h2 className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</h2>
            <span className={`ml-2 flex items-center text-sm ${stats.revenueChange >= 0 ? 'text-success-color' : 'text-danger-color'}`}>
              {stats.revenueChange >= 0 ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
              {Math.abs(stats.revenueChange)}%
            </span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Pending Invoices</h3>
            <div className="bg-yellow-100 p-2 rounded-full">
              <FiClock className="text-warning-color" size={20} />
            </div>
          </div>
          <div className="flex items-end">
            <h2 className="text-3xl font-bold">{stats.pendingInvoices}</h2>
            <Link to="/dashboard/invoices" className="ml-2 text-sm text-primary-color hover:underline">
              View all
            </Link>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <div className="h-64">
            <Line 
              data={revenueData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `$${value}`
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Invoice Status</h3>
          <div className="h-64 flex items-center justify-center">
            <div style={{ width: '70%', height: '100%' }}>
              <Doughnut 
                data={invoiceStatusData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }} 
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/dashboard/customers/new" 
            className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center transition-colors"
          >
            <FiUsers size={24} className="mx-auto mb-2 text-primary-color" />
            <span>Add New Customer</span>
          </Link>
          
          <Link 
            to="/dashboard/invoices/create" 
            className="bg-green-50 hover:bg-green-100 p-4 rounded-lg text-center transition-colors"
          >
            <FiFileText size={24} className="mx-auto mb-2 text-success-color" />
            <span>Create New Invoice</span>
          </Link>
          
          <Link 
            to="/dashboard/settings" 
            className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition-colors"
          >
            <FiDollarSign size={24} className="mx-auto mb-2 text-gray-700" />
            <span>Manage Payment Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

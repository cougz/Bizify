import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiSearch, FiDownload, FiEye, FiTrash2 } from 'react-icons/fi';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: {
    id: string;
    name: string;
    company: string;
  };
  issueDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  amount: number;
}

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        // In a real app, this would be an actual API call
        // For now, we'll simulate the data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockInvoices: Invoice[] = [
          {
            id: '1',
            invoiceNumber: 'INV-2023-001',
            customer: {
              id: '1',
              name: 'John Doe',
              company: 'Acme Inc.'
            },
            issueDate: '2023-03-01T00:00:00Z',
            dueDate: '2023-03-31T00:00:00Z',
            status: 'paid',
            amount: 1250.00
          },
          {
            id: '2',
            invoiceNumber: 'INV-2023-002',
            customer: {
              id: '2',
              name: 'Jane Smith',
              company: 'XYZ Corporation'
            },
            issueDate: '2023-03-05T00:00:00Z',
            dueDate: '2023-04-04T00:00:00Z',
            status: 'pending',
            amount: 2340.50
          },
          {
            id: '3',
            invoiceNumber: 'INV-2023-003',
            customer: {
              id: '3',
              name: 'Robert Johnson',
              company: 'Johnson & Co'
            },
            issueDate: '2023-02-15T00:00:00Z',
            dueDate: '2023-03-17T00:00:00Z',
            status: 'overdue',
            amount: 4500.75
          },
          {
            id: '4',
            invoiceNumber: 'INV-2023-004',
            customer: {
              id: '4',
              name: 'Emily Davis',
              company: 'Davis Enterprises'
            },
            issueDate: '2023-03-10T00:00:00Z',
            dueDate: '2023-04-09T00:00:00Z',
            status: 'pending',
            amount: 1800.25
          },
          {
            id: '5',
            invoiceNumber: 'INV-2023-005',
            customer: {
              id: '5',
              name: 'Michael Wilson',
              company: 'Wilson Technologies'
            },
            issueDate: '2023-03-12T00:00:00Z',
            dueDate: '2023-04-11T00:00:00Z',
            status: 'paid',
            amount: 3200.00
          }
        ];
        
        setInvoices(mockInvoices);
        setFilteredInvoices(mockInvoices);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError('Failed to load invoices. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  useEffect(() => {
    let filtered = [...invoices];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredInvoices(filtered);
  }, [searchTerm, statusFilter, invoices]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-success-color';
      case 'pending':
        return 'bg-yellow-100 text-warning-color';
      case 'overdue':
        return 'bg-red-100 text-danger-color';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p>Loading invoices...</p>
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link 
          to="/dashboard/invoices/create" 
          className="btn btn-primary flex items-center"
        >
          <FiPlus className="mr-2" />
          Create Invoice
        </Link>
      </div>
      
      {/* Search and filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search invoices by number or customer..."
              className="form-control pl-10"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="w-full md:w-48">
            <select
              className="form-control"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Invoices table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No invoices found matching your search.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.customer.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {invoice.customer.company}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.issueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(invoice.status)}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${invoice.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link 
                          to={`/dashboard/invoices/${invoice.id}`} 
                          className="text-primary-color hover:text-blue-800"
                          title="View"
                        >
                          <FiEye size={18} />
                        </Link>
                        <button 
                          className="text-gray-600 hover:text-gray-900"
                          title="Download PDF"
                          onClick={() => {
                            // In a real app, this would download the invoice PDF
                            alert(`Download PDF for invoice: ${invoice.invoiceNumber}`);
                          }}
                        >
                          <FiDownload size={18} />
                        </button>
                        <button 
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                          onClick={() => {
                            // In a real app, this would show a confirmation dialog
                            // and then delete the invoice if confirmed
                            alert(`Delete invoice: ${invoice.invoiceNumber}`);
                          }}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Invoices;

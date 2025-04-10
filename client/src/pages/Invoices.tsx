import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiDownload, FiEye, FiTrash2 } from 'react-icons/fi';
import { invoicesAPI } from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCurrency, formatDate } from '../utils/formatters';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  issue_date: string;
  due_date: string;
  total: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
}

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        // For demo purposes, we'll use mock data
        // const response = await invoicesAPI.getAll();
        // setInvoices(response.data);
        
        // Mock data
        setInvoices([
          {
            id: '1',
            invoice_number: 'INV-001',
            customer_name: 'Acme Inc',
            issue_date: '2023-03-01T00:00:00Z',
            due_date: '2023-03-31T00:00:00Z',
            total: 1250.00,
            status: 'paid'
          },
          {
            id: '2',
            invoice_number: 'INV-002',
            customer_name: 'XYZ Corp',
            issue_date: '2023-03-15T00:00:00Z',
            due_date: '2023-04-15T00:00:00Z',
            total: 3750.50,
            status: 'pending'
          },
          {
            id: '3',
            invoice_number: 'INV-003',
            customer_name: 'ABC Ltd',
            issue_date: '2023-02-15T00:00:00Z',
            due_date: '2023-03-15T00:00:00Z',
            total: 850.75,
            status: 'overdue'
          },
          {
            id: '4',
            invoice_number: 'INV-004',
            customer_name: 'Smith & Co',
            issue_date: '2023-03-20T00:00:00Z',
            due_date: '2023-04-20T00:00:00Z',
            total: 1500.00,
            status: 'draft'
          }
        ]);
        
        setError('');
      } catch (err) {
        setError('Failed to load invoices');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        // In a real app, you would call the API
        // await invoicesAPI.delete(id);
        
        // Update local state
        setInvoices(invoices.filter(invoice => invoice.id !== id));
      } catch (err) {
        setError('Failed to delete invoice');
        console.error(err);
      }
    }
  };

  const handleDownloadPdf = async (id: string) => {
    try {
      // In a real app, you would call the API and download the PDF
      // const response = await invoicesAPI.getPdf(id);
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', `invoice-${id}.pdf`);
      // document.body.appendChild(link);
      // link.click();
      // link.remove();
      
      // For demo purposes, just show an alert
      alert(`Downloading PDF for invoice ${id}`);
    } catch (err) {
      setError('Failed to download invoice PDF');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="Loading invoices..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
        <Link to="/dashboard/invoices/create">
          <Button variant="primary">
            <FiPlus className="mr-2" />
            Create Invoice
          </Button>
        </Link>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      {invoices.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No invoices</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new invoice.</p>
            <div className="mt-6">
              <Link to="/dashboard/invoices/create">
                <Button variant="primary">
                  <FiPlus className="mr-2" />
                  Create Invoice
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      <Link to={`/invoices/${invoice.id}`} className="hover:text-blue-600">
                        {invoice.invoice_number}
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{invoice.customer_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(invoice.issue_date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(invoice.due_date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(invoice.total)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={invoice.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link to={`/invoices/${invoice.id}`} className="text-blue-600 hover:text-blue-900">
                        <FiEye />
                      </Link>
                      <button
                        onClick={() => handleDownloadPdf(invoice.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <FiDownload />
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Invoices;

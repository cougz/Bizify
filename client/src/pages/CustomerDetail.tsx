import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiFileText } from 'react-icons/fi';
import { formatDate, formatCurrency } from '../utils/formatters';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { customersAPI, invoicesAPI, settingsAPI } from '../utils/api';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  company: string;
  notes: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  total: number;
}

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [currency, setCurrency] = useState<string>('USD');

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        
        if (!id) {
          setError('Customer ID is missing');
          setLoading(false);
          return;
        }
        
        // Fetch customer data, invoices, and settings in parallel
        const [customerResponse, invoicesResponse, settingsResponse] = await Promise.all([
          customersAPI.getById(id),
          invoicesAPI.getAll(),
          settingsAPI.get()
        ]);
        
        setCustomer(customerResponse.data);
        setCurrency(settingsResponse.data.currency || 'USD');
        
        // Filter invoices for this customer on the client side
        const customerInvoices = invoicesResponse.data.filter(
          (invoice: any) => invoice.customer_id === id
        );
        setInvoices(customerInvoices);
        
        setError('');
      } catch (err) {
        setError('Failed to load customer details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomerData();
    }
  }, [id]);

  const handleEdit = () => {
    navigate(`/customers/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    
    if (!id) {
      setError('Customer ID is missing');
      return;
    }
    
    try {
      setDeleting(true);
      // Call the API to delete the customer
      await customersAPI.delete(id);
      
      // Redirect to customers list
      navigate('/customers');
    } catch (err) {
      setError('Failed to delete customer');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateInvoice = () => {
    navigate('/invoices/create', { state: { customerId: id } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="Loading customer details..." />
      </div>
    );
  }

  if (!customer) {
    return <ErrorMessage message="Customer not found" />;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{customer.name}</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleEdit}>
            <FiEdit2 className="mr-2" />
            Edit
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            loading={deleting}
          >
            <FiTrash2 className="mr-2" />
            {deleteConfirm ? 'Confirm Delete' : 'Delete'}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Contact Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
              <p className="mt-1 dark:text-gray-300">{customer.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
              <p className="mt-1 dark:text-gray-300">{customer.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</p>
              <p className="mt-1 dark:text-gray-300">{customer.company}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Address</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Street</p>
              <p className="mt-1 dark:text-gray-300">{customer.address}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">City</p>
                <p className="mt-1 dark:text-gray-300">{customer.city}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">State/Province</p>
                <p className="mt-1 dark:text-gray-300">{customer.state}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ZIP/Postal Code</p>
                <p className="mt-1 dark:text-gray-300">{customer.zip_code}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Country</p>
                <p className="mt-1 dark:text-gray-300">{customer.country}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {customer.notes && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Notes</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{customer.notes}</p>
        </Card>
      )}
      
      <div className="flex justify-between items-center mt-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Invoices</h2>
        <Button variant="primary" onClick={handleCreateInvoice}>
          <FiFileText className="mr-2" />
          Create Invoice
        </Button>
      </div>
      
      {invoices.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{invoice.invoice_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(invoice.issue_date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(invoice.due_date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={invoice.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(invoice.total, currency)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      variant="outline" 
                      size="small" 
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">No invoices found for this customer.</p>
          <Button variant="outline" className="mt-4" onClick={handleCreateInvoice}>
            Create First Invoice
          </Button>
        </Card>
      )}
    </div>
  );
};

export default CustomerDetail;

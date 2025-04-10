import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiDownload, FiMail } from 'react-icons/fi';
import { invoicesAPI } from '../utils/api';
import { formatDate, formatCurrency } from '../utils/formatters';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  customer: Customer;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  notes: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  total: number;
  items: InvoiceItem[];
}

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        setLoading(true);
        // For demo purposes, we'll use mock data
        // const response = await invoicesAPI.getById(id);
        // setInvoice(response.data);
        
        // Mock data
        setInvoice({
          id: id || '1',
          invoice_number: 'INV-2023-001',
          customer: {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            company: 'Acme Inc',
            address: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            zip_code: '94103',
            country: 'USA'
          },
          issue_date: '2023-01-15',
          due_date: '2023-02-15',
          status: 'paid',
          notes: 'Thank you for your business!',
          subtotal: 1000.00,
          tax_rate: 10,
          tax_amount: 100.00,
          discount: 50.00,
          total: 1050.00,
          items: [
            {
              id: '1',
              description: 'Web Design Services',
              quantity: 10,
              unit_price: 75.00,
              amount: 750.00
            },
            {
              id: '2',
              description: 'Hosting (Monthly)',
              quantity: 1,
              unit_price: 250.00,
              amount: 250.00
            }
          ]
        });
        
        setError('');
      } catch (err) {
        setError('Failed to load invoice details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInvoiceData();
    }
  }, [id]);

  const handleEdit = () => {
    navigate(`/invoices/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    
    try {
      setDeleting(true);
      // In a real app, you would call the API
      // await invoicesAPI.delete(id);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to invoices list
      navigate('/invoices');
    } catch (err) {
      setError('Failed to delete invoice');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      // In a real app, you would call the API
      // const response = await invoicesAPI.getPdf(id);
      // const blob = new Blob([response.data], { type: 'application/pdf' });
      // const url = window.URL.createObjectURL(blob);
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', `invoice_${invoice?.invoice_number}.pdf`);
      // document.body.appendChild(link);
      // link.click();
      // link.remove();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setError('');
    } catch (err) {
      setError('Failed to download PDF');
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      setSending(true);
      // In a real app, you would call the API
      // await invoicesAPI.sendEmail(id);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setError('');
      // Show success message
      alert('Invoice sent successfully!');
    } catch (err) {
      setError('Failed to send invoice');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="Loading invoice details..." />
      </div>
    );
  }

  if (!invoice) {
    return <ErrorMessage message="Invoice not found" />;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Invoice {invoice.invoice_number}</h1>
          <p className="text-gray-500">
            <StatusBadge status={invoice.status} className="mr-2" />
            Issued on {formatDate(invoice.issue_date)} | Due on {formatDate(invoice.due_date)}
          </p>
        </div>
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
          <Button 
            variant="outline" 
            onClick={handleDownloadPdf}
            loading={downloading}
          >
            <FiDownload className="mr-2" />
            Download PDF
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSendEmail}
            loading={sending}
          >
            <FiMail className="mr-2" />
            Send Email
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">From</h2>
          <div className="space-y-1">
            <p className="font-medium">Your Company</p>
            <p>123 Business St</p>
            <p>San Francisco, CA 94103</p>
            <p>United States</p>
            <p className="mt-2">info@yourcompany.com</p>
            <p>(555) 987-6543</p>
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Bill To</h2>
          <div className="space-y-1">
            <p className="font-medium">{invoice.customer.name}</p>
            <p>{invoice.customer.company}</p>
            <p>{invoice.customer.address}</p>
            <p>{invoice.customer.city}, {invoice.customer.state} {invoice.customer.zip_code}</p>
            <p>{invoice.customer.country}</p>
            <p className="mt-2">{invoice.customer.email}</p>
          </div>
        </Card>
      </div>
      
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  Subtotal
                </td>
                <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                  {formatCurrency(invoice.subtotal)}
                </td>
              </tr>
              {invoice.discount > 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    Discount
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                    -{formatCurrency(invoice.discount)}
                  </td>
                </tr>
              )}
              <tr>
                <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  Tax ({invoice.tax_rate}%)
                </td>
                <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                  {formatCurrency(invoice.tax_amount)}
                </td>
              </tr>
              <tr className="bg-gray-100">
                <td colSpan={3} className="px-6 py-3 text-right text-base font-bold text-gray-900">
                  Total
                </td>
                <td className="px-6 py-3 text-right text-base font-bold text-gray-900">
                  {formatCurrency(invoice.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
      
      {invoice.notes && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Notes</h2>
          <p className="text-gray-700 whitespace-pre-line">{invoice.notes}</p>
        </Card>
      )}
    </div>
  );
};

export default InvoiceDetail;

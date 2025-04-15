import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiDownload, FiMail } from 'react-icons/fi';
import { invoicesAPI, settingsAPI } from '../utils/api';
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
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch both invoice and settings data
        const [invoiceResponse, settingsResponse] = await Promise.all([
          invoicesAPI.getById(id || ''),
          settingsAPI.get()
        ]);
        
        setInvoice(invoiceResponse.data);
        setSettings(settingsResponse.data);
        setError('');
      } catch (err) {
        setError('Failed to load invoice details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
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
      // Call the API to delete the invoice
      await invoicesAPI.delete(id || '');
      
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
      
      // Call the API to get the PDF
      const response = await invoicesAPI.getPdf(id || '');
      
      // Create a blob from the PDF data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoice?.invoice_number}.pdf`);
      
      // Append to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);
      
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Invoice {invoice.invoice_number}</h1>
          <p className="text-gray-500 dark:text-gray-400">
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
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">From</h2>
          <div className="space-y-1 dark:text-gray-300">
            <p className="font-medium">{settings?.company_name || 'Your Company'}</p>
            <p>{settings?.company_address || '123 Business St'}</p>
            <p>{settings?.company_city || 'San Francisco'}, {settings?.company_state || 'CA'} {settings?.company_zip || '94103'}</p>
            <p>{settings?.company_country || 'United States'}</p>
            <p className="mt-2">{settings?.company_email || 'info@yourcompany.com'}</p>
            <p>{settings?.company_phone || '(555) 987-6543'}</p>
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Bill To</h2>
          <div className="space-y-1 dark:text-gray-300">
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
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Unit Price
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 text-right">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 text-right">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300 text-right">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                  Subtotal
                </td>
                <td className="px-6 py-3 text-right text-sm font-medium text-gray-900 dark:text-gray-300">
                  {formatCurrency(invoice.subtotal)}
                </td>
              </tr>
              {invoice.discount > 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                    Discount
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-medium text-gray-900 dark:text-gray-300">
                    -{formatCurrency(invoice.discount)}
                  </td>
                </tr>
              )}
              <tr>
                <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                  Tax ({invoice.tax_rate}%)
                </td>
                <td className="px-6 py-3 text-right text-sm font-medium text-gray-900 dark:text-gray-300">
                  {formatCurrency(invoice.tax_amount)}
                </td>
              </tr>
              <tr className="bg-gray-100 dark:bg-gray-600">
                <td colSpan={3} className="px-6 py-3 text-right text-base font-bold text-gray-900 dark:text-white">
                  Total
                </td>
                <td className="px-6 py-3 text-right text-base font-bold text-gray-900 dark:text-white">
                  {formatCurrency(invoice.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
      
      {invoice.notes && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Notes</h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{invoice.notes}</p>
        </Card>
      )}
    </div>
  );
};

export default InvoiceDetail;

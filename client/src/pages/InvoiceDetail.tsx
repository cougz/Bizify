import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoicesAPI } from '../utils/api';
import { formatDate, formatCurrency } from '../utils/formatters';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface Customer {
  id: number;
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
  id: number;
  invoice_number: string;
  customer_id: number;
  customer: Customer;
  issue_date: string;
  due_date: string;
  status: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  total: number;
  notes: string;
  items: InvoiceItem[];
  created_at: string;
  updated_at: string;
}

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const response = await invoicesAPI.getById(id || '');
        setInvoice(response.data);
        setError('');
      } catch (err) {
        setError('Failed to load invoice details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const handleDownloadPdf = async () => {
    try {
      const response = await invoicesAPI.getPdf(id || '');
      
      // Create a blob from the PDF data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create a link element and trigger download
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `invoice-${invoice?.invoice_number}.pdf`;
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download PDF');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="Loading invoice details..." />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!invoice) {
    return <ErrorMessage message="Invoice not found" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Invoice {invoice.invoice_number}</h1>
        <div className="space-x-2">
          <Button 
            variant="primary" 
            onClick={() => navigate(`/invoices/${id}/edit`)}
          >
            Edit
          </Button>
          <Button 
            variant="success" 
            onClick={handleDownloadPdf}
          >
            Download PDF
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => navigate('/invoices')}
          >
            Back to Invoices
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Invoice Details</h2>
            <p className="text-gray-600">
              <span className="font-medium">Status:</span> <StatusBadge status={invoice.status} />
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Issue Date:</span> {formatDate(invoice.issue_date)}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Due Date:</span> {formatDate(invoice.due_date)}
            </p>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-semibold mb-2">Customer</h3>
            <p className="text-gray-800 font-medium">{invoice.customer.name}</p>
            {invoice.customer.company && (
              <p className="text-gray-600">{invoice.customer.company}</p>
            )}
            <p className="text-gray-600">{invoice.customer.email}</p>
            <Button 
              variant="link" 
              onClick={() => navigate(`/customers/${invoice.customer_id}`)}
              className="mt-2"
            >
              View Customer
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left">Description</th>
                <th className="py-2 px-4 text-right">Quantity</th>
                <th className="py-2 px-4 text-right">Unit Price</th>
                <th className="py-2 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2 px-4">{item.description}</td>
                  <td className="py-2 px-4 text-right">{item.quantity}</td>
                  <td className="py-2 px-4 text-right">{formatCurrency(item.unit_price)}</td>
                  <td className="py-2 px-4 text-right">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2">
              <span className="font-medium">Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between py-2 text-green-600">
                <span className="font-medium">Discount:</span>
                <span>-{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            {invoice.tax_rate > 0 && (
              <div className="flex justify-between py-2">
                <span className="font-medium">Tax ({invoice.tax_rate}%):</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-t border-gray-300 font-bold">
              <span>Total:</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Notes</h3>
            <p className="text-gray-600 whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default InvoiceDetail;

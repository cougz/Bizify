import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { customersAPI, invoicesAPI, settingsAPI } from '../utils/api';

interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
}

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

const CreateInvoice: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  
  const [invoice, setInvoice] = useState({
    customer_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    notes: '',
    tax_rate: 0,
    discount_percent: 0
  });
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unit_price: 0, amount: 0 }
  ]);
  
  const [subtotal, setSubtotal] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        // Fetch customers and settings from the API
        const [customersResponse, settingsResponse] = await Promise.all([
          customersAPI.getAll(),
          settingsAPI.get()
        ]);
        
        setCustomers(customersResponse.data);
        
        // Set currency from settings
        if (settingsResponse.data && settingsResponse.data.currency) {
          setCurrency(settingsResponse.data.currency);
        }
        
        // If a customerId was passed in location state, set it as the selected customer
        const { state } = location;
        if (state && state.customerId) {
          setInvoice(prev => ({
            ...prev,
            customer_id: state.customerId
          }));
        }
        
        setError('');
      } catch (err) {
        setError('Failed to load customers');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [location]);

  // Fetch invoice data when in edit mode
  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (isEditMode && id) {
        try {
          setLoading(true);
          const response = await invoicesAPI.getById(id);
          const invoiceData = response.data;
          
          // Set invoice data
          setInvoice({
            customer_id: invoiceData.customer_id.toString(),
            issue_date: invoiceData.issue_date.split('T')[0],
            due_date: invoiceData.due_date.split('T')[0],
            status: invoiceData.status,
            notes: invoiceData.notes || '',
            tax_rate: invoiceData.tax_rate,
            discount_percent: invoiceData.discount_percent || 0
          });
          
          // Set invoice items
          if (invoiceData.items && invoiceData.items.length > 0) {
            setItems(invoiceData.items.map((item: any) => ({
              id: item.id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              amount: item.amount
            })));
          }
          
          setError('');
        } catch (err) {
          setError('Failed to load invoice data');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchInvoiceData();
  }, [isEditMode, id]);

  useEffect(() => {
    // Calculate subtotal
    const newSubtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    setSubtotal(newSubtotal);
    
    // Calculate tax amount
    const newTaxAmount = newSubtotal * (invoice.tax_rate / 100);
    setTaxAmount(newTaxAmount);
    
    // Calculate discount amount (percentage-based)
    const discountAmount = newSubtotal * (invoice.discount_percent / 100);
    
    // Calculate total
    setTotal(newSubtotal - discountAmount + newTaxAmount);
  }, [items, invoice.tax_rate, invoice.discount_percent]);

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInvoice(prev => ({
      ...prev,
      [name]: name === 'tax_rate' || name === 'discount_percent' ? parseFloat(value) || 0 : value
    }));
  };

  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newItems = [...items];
    
    if (name === 'quantity' || name === 'unit_price') {
      const numValue = parseFloat(value) || 0;
      newItems[index] = {
        ...newItems[index],
        [name]: numValue,
        amount: name === 'quantity' 
          ? numValue * newItems[index].unit_price 
          : newItems[index].quantity * numValue
      };
    } else {
      newItems[index] = {
        ...newItems[index],
        [name]: value
      };
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invoice.customer_id) {
      setError('Please select a customer');
      return;
    }
    
    if (items.some(item => !item.description)) {
      setError('Please provide a description for all items');
      return;
    }
    
    if (items.some(item => item.quantity <= 0)) {
      setError('Quantity must be greater than 0 for all items');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      // Prepare the payload with proper type conversions
      const payload = {
        ...invoice,
        customer_id: parseInt(invoice.customer_id, 10),
        tax_rate: typeof invoice.tax_rate === 'string' ? parseFloat(invoice.tax_rate) : invoice.tax_rate,
        discount_percent: typeof invoice.discount_percent === 'string' ? parseFloat(invoice.discount_percent) : invoice.discount_percent,
        items: items.map(item => ({
          id: item.id, // Include item ID for updates
          description: item.description,
          quantity: typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity,
          unit_price: typeof item.unit_price === 'string' ? parseFloat(item.unit_price) : item.unit_price
        }))
      };
      
      let response;
      
      if (isEditMode && id) {
        // Update existing invoice
        console.log('Updating invoice with payload:', payload);
        response = await invoicesAPI.update(id, payload);
        console.log('Invoice updated successfully:', response.data);
      } else {
        // Create new invoice
        console.log('Creating invoice with payload:', payload);
        response = await invoicesAPI.create(payload);
        console.log('Invoice created successfully:', response.data);
      }
      
      // Redirect to invoice list
      navigate('/invoices');
    } catch (err: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} invoice:`, err);
      // Provide more detailed error message if available
      if (err.response && err.response.data) {
        setError(`Failed to ${isEditMode ? 'update' : 'create'} invoice: ${JSON.stringify(err.response.data)}`);
      } else {
        setError(`Failed to ${isEditMode ? 'update' : 'create'} invoice. Please check your data and try again.`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="Loading customers..." />
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Invoice' : 'Create Invoice'}</h1>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Invoice Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Customer <span className="text-red-500">*</span>
                </label>
                <select
                  id="customer_id"
                  name="customer_id"
                  value={invoice.customer_id}
                  onChange={handleInvoiceChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.company ? `- ${customer.company}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={invoice.status}
                  onChange={handleInvoiceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="issue_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  id="issue_date"
                  name="issue_date"
                  value={invoice.issue_date}
                  onChange={handleInvoiceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  id="due_date"
                  name="due_date"
                  value={invoice.due_date}
                  onChange={handleInvoiceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="tax_rate" className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  id="tax_rate"
                  name="tax_rate"
                  value={invoice.tax_rate}
                  onChange={handleInvoiceChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="discount_percent" className="block text-sm font-medium text-gray-700 mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  id="discount_percent"
                  name="discount_percent"
                  value={invoice.discount_percent}
                  onChange={handleInvoiceChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={invoice.notes}
                  onChange={handleInvoiceChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="mt-6">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Invoice Items</h2>
              <Button type="button" variant="outline" onClick={addItem}>
                <FiPlus className="mr-2" />
                Add Item
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description <span className="text-red-500">*</span>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity <span className="text-red-500">*</span>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price <span className="text-red-500">*</span>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          name="description"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, e)}
                          placeholder="Item description"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          name="quantity"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, e)}
                          step="0.01"
                          min="0.01"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          name="unit_price"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, e)}
                          step="0.01"
                          min="0"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(item.amount || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-900"
                          disabled={items.length === 1}
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-end">
              <div className="w-full md:w-1/3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tax ({invoice.tax_rate}%):</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Discount ({invoice.discount_percent}%):</span>
                  <span className="text-sm font-medium text-gray-900">-{formatCurrency(subtotal * invoice.discount_percent / 100)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-base font-medium text-gray-900">Total:</span>
                  <span className="text-base font-bold text-gray-900">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            disabled={submitting}
          >
            {isEditMode ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;

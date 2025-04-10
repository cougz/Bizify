import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { invoicesAPI, customersAPI } from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

interface Customer {
  id: number;
  name: string;
  email: string;
  company: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
}

interface InvoiceFormData {
  customer_id: number;
  issue_date: string;
  due_date: string;
  notes: string;
  tax_rate: number;
  discount: number;
  items: InvoiceItem[];
}

const CreateInvoice: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedCustomerId = queryParams.get('customer');

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const [formData, setFormData] = useState<InvoiceFormData>({
    customer_id: preselectedCustomerId ? parseInt(preselectedCustomerId) : 0,
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    tax_rate: 0,
    discount: 0,
    items: [{ description: '', quantity: 1, unit_price: 0 }]
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await customersAPI.getAll();
        setCustomers(response.data);
        
        // If no customer is preselected and we have customers, select the first one
        if (!preselectedCustomerId && response.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            customer_id: response.data[0].id
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
  }, [preselectedCustomerId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string) => {
    const newItems = [...formData.items];
    
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index][field] = parseFloat(value) || 0;
    } else {
      // @ts-ignore - TypeScript doesn't know that description is a string
      newItems[index][field] = value;
    }
    
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unit_price: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = [...formData.items];
      newItems.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        items: newItems
      }));
    }
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = subtotal * (formData.tax_rate / 100);
    return subtotal - formData.discount + taxAmount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.customer_id === 0) {
      setError('Please select a customer');
      return;
    }
    
    if (formData.items.some(item => !item.description || item.quantity <= 0)) {
      setError('Please fill in all item details and ensure quantities are greater than zero');
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await invoicesAPI.create(formData);
      navigate(`/invoices/${response.data.id}`);
    } catch (err) {
      setError('Failed to create invoice');
      console.error(err);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Create New Invoice</h1>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/invoices')}
        >
          Cancel
        </Button>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer
              </label>
              <select
                name="customer_id"
                value={formData.customer_id}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value="">Select a customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} {customer.company ? `(${customer.company})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  name="issue_date"
                  value={formData.issue_date}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-2">Invoice Items</h3>
          
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Description</th>
                  <th className="py-2 px-4 text-right" style={{ width: '120px' }}>Quantity</th>
                  <th className="py-2 px-4 text-right" style={{ width: '150px' }}>Unit Price</th>
                  <th className="py-2 px-4 text-right" style={{ width: '150px' }}>Amount</th>
                  <th className="py-2 px-4 text-center" style={{ width: '80px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Item description"
                        required
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-right"
                        min="1"
                        step="1"
                        required
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-right"
                        min="0"
                        step="0.01"
                        required
                      />
                    </td>
                    <td className="py-2 px-4 text-right">
                      ${(item.quantity * item.unit_price).toFixed(2)}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700"
                        disabled={formData.items.length <= 1}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-6">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={addItem}
              className="text-sm"
            >
              + Add Item
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                rows={4}
                placeholder="Invoice notes, payment terms, etc."
              />
            </div>

            <div>
              <div className="bg-gray-50 p-4 rounded">
                <div className="flex justify-between py-2">
                  <label className="text-sm font-medium text-gray-700">Subtotal:</label>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between py-2">
                  <label className="text-sm font-medium text-gray-700">
                    Tax Rate (%):
                  </label>
                  <input
                    type="number"
                    name="tax_rate"
                    value={formData.tax_rate}
                    onChange={handleInputChange}
                    className="w-20 p-1 border border-gray-300 rounded text-right"
                    min="0"
                    step="0.1"
                  />
                </div>
                
                <div className="flex justify-between py-2">
                  <label className="text-sm font-medium text-gray-700">
                    Discount:
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    className="w-20 p-1 border border-gray-300 rounded text-right"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="flex justify-between py-2 border-t border-gray-300 font-bold">
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button 
              type="submit" 
              variant="primary"
              disabled={submitting}
              loading={submitting}
            >
              Create Invoice
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CreateInvoice;

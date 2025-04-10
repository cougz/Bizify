import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customersAPI } from '../utils/api';
import { formatDate, formatPhone } from '../utils/formatters';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

interface Customer {
  id: number;
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
  created_at: string;
  updated_at: string;
}

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        const response = await customersAPI.getById(id || '');
        setCustomer(response.data);
        setError('');
      } catch (err) {
        setError('Failed to load customer details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomer();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="Loading customer details..." />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!customer) {
    return <ErrorMessage message="Customer not found" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Customer Details</h1>
        <div className="space-x-2">
          <Button 
            variant="primary" 
            onClick={() => navigate(`/customers/${id}/edit`)}
          >
            Edit
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => navigate('/customers')}
          >
            Back to Customers
          </Button>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">{customer.name}</h2>
            {customer.company && (
              <p className="text-gray-600 mb-2">{customer.company}</p>
            )}
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Email:</span> {customer.email}
            </p>
            {customer.phone && (
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Phone:</span> {formatPhone(customer.phone)}
              </p>
            )}
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Created:</span> {formatDate(customer.created_at)}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Address</h3>
            {customer.address && (
              <p className="text-gray-600">{customer.address}</p>
            )}
            {(customer.city || customer.state || customer.zip_code) && (
              <p className="text-gray-600">
                {customer.city}{customer.city && customer.state ? ', ' : ''}
                {customer.state} {customer.zip_code}
              </p>
            )}
            {customer.country && (
              <p className="text-gray-600">{customer.country}</p>
            )}
          </div>
        </div>

        {customer.notes && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Notes</h3>
            <p className="text-gray-600 whitespace-pre-line">{customer.notes}</p>
          </div>
        )}
      </Card>

      <Card title="Invoices">
        <p className="text-gray-600">Customer invoices will be displayed here.</p>
        <Button 
          variant="primary" 
          onClick={() => navigate(`/invoices/new?customer=${customer.id}`)}
          className="mt-4"
        >
          Create New Invoice
        </Button>
      </Card>
    </div>
  );
};

export default CustomerDetail;

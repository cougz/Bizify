import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiUser } from 'react-icons/fi';
import { customersAPI } from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  created_at: string;
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        // For demo purposes, we'll use mock data
        // const response = await customersAPI.getAll();
        // setCustomers(response.data);
        
        // Mock data
        setCustomers([
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '(123) 456-7890',
            company: 'Acme Inc',
            address: '123 Main St, City, Country',
            created_at: '2023-01-15T00:00:00Z'
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '(098) 765-4321',
            company: 'XYZ Corp',
            address: '456 Oak Ave, Town, Country',
            created_at: '2023-02-20T00:00:00Z'
          },
          {
            id: '3',
            name: 'Bob Johnson',
            email: 'bob@example.com',
            phone: '(555) 123-4567',
            company: 'ABC Ltd',
            address: '789 Pine Rd, Village, Country',
            created_at: '2023-03-10T00:00:00Z'
          }
        ]);
        
        setError('');
      } catch (err) {
        setError('Failed to load customers');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        // In a real app, you would call the API
        // await customersAPI.delete(id);
        
        // Update local state
        setCustomers(customers.filter(customer => customer.id !== id));
      } catch (err) {
        setError('Failed to delete customer');
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="Loading customers..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        <Link to="/customers/new">
          <Button variant="primary">
            <FiPlus className="mr-2" />
            Add Customer
          </Button>
        </Link>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      {customers.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <FiUser className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No customers</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new customer.</p>
            <div className="mt-6">
              <Link to="/customers/new">
                <Button variant="primary">
                  <FiPlus className="mr-2" />
                  Add Customer
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
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">{customer.name.charAt(0)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          <Link to={`/customers/${customer.id}`} className="hover:text-blue-600">
                            {customer.name}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.company}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link to={`/customers/${customer.id}`} className="text-blue-600 hover:text-blue-900">
                        <FiEdit />
                      </Link>
                      <button
                        onClick={() => handleDelete(customer.id)}
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

export default Customers;

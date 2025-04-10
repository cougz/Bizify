import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

interface SettingsData {
  id?: number;
  company_name: string;
  company_address: string;
  company_city: string;
  company_state: string;
  company_zip: string;
  company_country: string;
  company_phone: string;
  company_email: string;
  company_website: string;
  company_logo?: string;
  tax_rate: number;
  currency: string;
  invoice_prefix: string;
  invoice_footer: string;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsData>({
    company_name: '',
    company_address: '',
    company_city: '',
    company_state: '',
    company_zip: '',
    company_country: '',
    company_phone: '',
    company_email: '',
    company_website: '',
    tax_rate: 0,
    currency: 'USD',
    invoice_prefix: 'INV-',
    invoice_footer: ''
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        
        // Try to get settings from localStorage first
        const savedSettings = localStorage.getItem('bizify_settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        } else {
          // For demo purposes, we'll use mock data
          // const response = await settingsAPI.get();
          // setSettings(response.data);
          
          // Mock data
          const defaultSettings = {
            id: 1,
            company_name: 'Bizify Demo Company',
            company_address: '123 Business St',
            company_city: 'San Francisco',
            company_state: 'CA',
            company_zip: '94103',
            company_country: 'USA',
            company_phone: '(555) 123-4567',
            company_email: 'info@bizify-demo.com',
            company_website: 'www.bizify-demo.com',
            tax_rate: 8.5,
            currency: 'USD',
            invoice_prefix: 'INV-',
            invoice_footer: 'Thank you for your business!'
          };
          
          setSettings(defaultSettings);
          localStorage.setItem('bizify_settings', JSON.stringify(defaultSettings));
        }
        
        setError('');
      } catch (err) {
        setError('Failed to load settings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: name === 'tax_rate' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      // In a real app, you would call the API
      // await settingsAPI.update(settings);
      
      // Save to localStorage
      localStorage.setItem('bizify_settings', JSON.stringify(settings));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Settings saved successfully');
    } catch (err) {
      setError('Failed to save settings');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" text="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Company Settings</h1>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{success}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setSuccess('')}
          >
            <span className="sr-only">Close</span>
            <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Company Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Logo
                </label>
                <div className="mt-1 flex items-center">
                  {settings.company_logo ? (
                    <div className="relative">
                      <img 
                        src={settings.company_logo} 
                        alt="Company Logo" 
                        className="h-24 w-auto object-contain border border-gray-300 rounded-md p-2"
                      />
                      <button
                        type="button"
                        onClick={() => setSettings(prev => ({ ...prev, company_logo: undefined }))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-24 w-48 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="company_logo" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                            <span>Upload a logo</span>
                            <input 
                              id="company_logo" 
                              name="company_logo" 
                              type="file" 
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setSettings(prev => ({ 
                                      ...prev, 
                                      company_logo: reader.result as string 
                                    }));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={settings.company_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="company_email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="company_email"
                  name="company_email"
                  value={settings.company_email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="company_phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  id="company_phone"
                  name="company_phone"
                  value={settings.company_phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="company_website" className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="text"
                  id="company_website"
                  name="company_website"
                  value={settings.company_website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="company_address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  id="company_address"
                  name="company_address"
                  value={settings.company_address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="company_city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  id="company_city"
                  name="company_city"
                  value={settings.company_city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="company_state" className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  id="company_state"
                  name="company_state"
                  value={settings.company_state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="company_zip" className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP/Postal Code
                </label>
                <input
                  type="text"
                  id="company_zip"
                  name="company_zip"
                  value={settings.company_zip}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="company_country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  id="company_country"
                  name="company_country"
                  value={settings.company_country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="mt-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Invoice Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="tax_rate" className="block text-sm font-medium text-gray-700 mb-1">
                  Default Tax Rate (%)
                </label>
                <input
                  type="number"
                  id="tax_rate"
                  name="tax_rate"
                  value={settings.tax_rate}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="invoice_prefix" className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Number Prefix
                </label>
                <input
                  type="text"
                  id="invoice_prefix"
                  name="invoice_prefix"
                  value={settings.invoice_prefix}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="invoice_footer" className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Footer Text
                </label>
                <textarea
                  id="invoice_footer"
                  name="invoice_footer"
                  value={settings.invoice_footer}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
            </div>
          </div>
        </Card>
        
        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            loading={saving}
            disabled={saving}
          >
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;

import React, { useState } from 'react';
import { 
  FiDownload, FiUpload, FiAlertTriangle, FiCheckCircle, 
  FiX, FiFileText, FiSettings, FiUsers, FiFile, FiEye 
} from 'react-icons/fi';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import { exportAPI } from '../utils/api';

interface ExportOptions {
  format: 'json' | 'csv' | 'excel' | 'backup';
  includeCustomers: boolean;
  includeInvoices: boolean;
  includeSettings: boolean;
  dateFrom: string;
  dateTo: string;
}

interface ImportOptions {
  updateExisting: boolean;
  importSettings: boolean;
  importCustomers: boolean;
  importInvoices: boolean;
  skipDuplicates: boolean;
}

interface ImportPreview {
  total_customers: number;
  total_invoices: number;
  has_settings: boolean;
  conflicts: Array<{
    type: string;
    identifier: string;
    action: string;
    [key: string]: any;
  }>;
  validation_errors: string[];
  warnings: string[];
}

interface ImportResult {
  success: boolean;
  message: string;
  stats: {
    customers_created: number;
    customers_updated: number;
    invoices_created: number;
    settings_updated: boolean;
  };
  errors: string[];
  warnings: string[];
}

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportImportModal: React.FC<ExportImportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [error, setError] = useState('');
  
  // Export state
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeCustomers: true,
    includeInvoices: true,
    includeSettings: true,
    dateFrom: '',
    dateTo: ''
  });
  
  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    updateExisting: false,
    importSettings: true,
    importCustomers: true,
    importInvoices: true,
    skipDuplicates: true
  });
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError('');
      
      const requestData = {
        format: exportOptions.format,
        include_customers: exportOptions.includeCustomers,
        include_invoices: exportOptions.includeInvoices,
        include_settings: exportOptions.includeSettings,
        date_from: exportOptions.dateFrom || null,
        date_to: exportOptions.dateTo || null
      };
      
      const response = await exportAPI.exportData(requestData);
      
      // Create blob and download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or create default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `bizify_export.${exportOptions.format}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Show success message and close modal
      setError('');
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (err: any) {
      console.error('Export failed:', err);
      setError(err.response?.data?.detail || 'Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['application/json', 'application/zip'];
      const validExtensions = ['.json', '.zip'];
      
      const isValidType = validTypes.includes(file.type) || 
                         validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (!isValidType) {
        setError('Please select a valid JSON or ZIP file.');
        return;
      }
      
      setImportFile(file);
      setError('');
      setImportPreview(null);
      setImportResult(null);
      setShowPreview(false);
      
      // Auto-preview the file
      await handlePreview(file);
    }
  };

  const handlePreview = async (file?: File) => {
    const fileToPreview = file || importFile;
    if (!fileToPreview) {
      setError('Please select a file to preview.');
      return;
    }

    try {
      setIsPreviewing(true);
      setError('');
      
      const response = await exportAPI.previewImport(fileToPreview);
      setImportPreview(response.data);
      setShowPreview(true);
      
    } catch (err: any) {
      console.error('Preview failed:', err);
      setError(err.response?.data?.detail || 'Failed to preview file. Please check the file format.');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      setError('Please select a file to import.');
      return;
    }

    try {
      setIsImporting(true);
      setError('');
      setImportResult(null);
      
      const response = await exportAPI.importData(importFile, importOptions);
      setImportResult(response.data);
      
      if (response.data.success) {
        // Optionally refresh the page or emit an event to refresh data
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
      
    } catch (err: any) {
      console.error('Import failed:', err);
      setError(err.response?.data?.detail || 'Import failed. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const resetModal = () => {
    setActiveTab('export');
    setError('');
    setImportFile(null);
    setImportPreview(null);
    setImportResult(null);
    setShowPreview(false);
    setExportOptions({
      format: 'json',
      includeCustomers: true,
      includeInvoices: true,
      includeSettings: true,
      dateFrom: '',
      dateTo: ''
    });
    setImportOptions({
      updateExisting: false,
      importSettings: true,
      importCustomers: true,
      importInvoices: true,
      skipDuplicates: true
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Export & Import Data
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('export')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'export'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <FiDownload className="inline mr-2" />
            Export Data
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'import'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <FiUpload className="inline mr-2" />
            Import Data
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'export' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Format Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Export Format
                  </label>
                  <select
                    value={exportOptions.format}
                    onChange={(e) => setExportOptions({...exportOptions, format: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="json">JSON (Complete Data)</option>
                    <option value="excel">Excel Spreadsheet</option>
                    <option value="csv">CSV Files (ZIP)</option>
                    <option value="backup">Complete Backup (ZIP)</option>
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Range (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={exportOptions.dateFrom}
                      onChange={(e) => setExportOptions({...exportOptions, dateFrom: e.target.value})}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="From"
                    />
                    <input
                      type="date"
                      value={exportOptions.dateTo}
                      onChange={(e) => setExportOptions({...exportOptions, dateTo: e.target.value})}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="To"
                    />
                  </div>
                </div>
              </div>

              {/* What to Export */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  What to Export
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeCustomers}
                      onChange={(e) => setExportOptions({...exportOptions, includeCustomers: e.target.checked})}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <FiUsers className="ml-2 mr-1 text-blue-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Customers</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeInvoices}
                      onChange={(e) => setExportOptions({...exportOptions, includeInvoices: e.target.checked})}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <FiFileText className="ml-2 mr-1 text-green-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Invoices</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeSettings}
                      onChange={(e) => setExportOptions({...exportOptions, includeSettings: e.target.checked})}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <FiSettings className="ml-2 mr-1 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Company Settings</span>
                  </label>
                </div>
              </div>

              {/* Export Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleExport}
                  disabled={isExporting || (!exportOptions.includeCustomers && !exportOptions.includeInvoices && !exportOptions.includeSettings)}
                  variant="primary"
                >
                  {isExporting ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span className="ml-2">Exporting...</span>
                    </>
                  ) : (
                    <>
                      <FiDownload className="mr-2" />
                      Export Data
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select File to Import
                </label>
                <input
                  type="file"
                  accept=".json,.zip"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                           file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700
                           hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Supported formats: JSON, ZIP (backup files)
                </p>
              </div>

              {/* Preview */}
              {importFile && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-800 dark:text-gray-100">
                      <FiFile className="inline mr-2" />
                      {importFile.name}
                    </h4>
                    <Button
                      onClick={() => handlePreview()}
                      disabled={isPreviewing}
                      variant="outline"
                      className="text-xs"
                    >
                      {isPreviewing ? (
                        <>
                          <LoadingSpinner size="small" />
                          <span className="ml-1">Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <FiEye className="mr-1" />
                          Preview
                        </>
                      )}
                    </Button>
                  </div>

                  {importPreview && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">{importPreview.total_customers}</div>
                          <div className="text-gray-600 dark:text-gray-400">Customers</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">{importPreview.total_invoices}</div>
                          <div className="text-gray-600 dark:text-gray-400">Invoices</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-600">
                            {importPreview.has_settings ? '✓' : '✗'}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">Settings</div>
                        </div>
                      </div>

                      {importPreview.conflicts.length > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded p-3">
                          <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                            <FiAlertTriangle className="inline mr-1" />
                            Conflicts Found ({importPreview.conflicts.length})
                          </h5>
                          <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                            {importPreview.conflicts.slice(0, 3).map((conflict, index) => (
                              <div key={index}>
                                • {conflict.type}: {conflict.identifier} ({conflict.action})
                              </div>
                            ))}
                            {importPreview.conflicts.length > 3 && (
                              <div>... and {importPreview.conflicts.length - 3} more</div>
                            )}
                          </div>
                        </div>
                      )}

                      {importPreview.validation_errors.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded p-3">
                          <h5 className="font-medium text-red-800 dark:text-red-200 mb-2">
                            Validation Errors
                          </h5>
                          <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                            {importPreview.validation_errors.slice(0, 3).map((error, index) => (
                              <div key={index}>• {error}</div>
                            ))}
                            {importPreview.validation_errors.length > 3 && (
                              <div>... and {importPreview.validation_errors.length - 3} more</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Import Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Import Options
                </label>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={importOptions.importCustomers}
                        onChange={(e) => setImportOptions({...importOptions, importCustomers: e.target.checked})}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Import Customers</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={importOptions.importInvoices}
                        onChange={(e) => setImportOptions({...importOptions, importInvoices: e.target.checked})}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Import Invoices</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={importOptions.importSettings}
                        onChange={(e) => setImportOptions({...importOptions, importSettings: e.target.checked})}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Import Settings</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={importOptions.updateExisting}
                        onChange={(e) => setImportOptions({...importOptions, updateExisting: e.target.checked})}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Update Existing Data</span>
                    </label>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={importOptions.skipDuplicates}
                      onChange={(e) => setImportOptions({...importOptions, skipDuplicates: e.target.checked})}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Skip Duplicate Invoices</span>
                  </label>
                </div>
              </div>

              {/* Import Button */}
              <div className="flex justify-end space-x-3">
                <Button
                  onClick={handleClose}
                  variant="outline"
                  disabled={isImporting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!importFile || isImporting || (importPreview && importPreview.validation_errors.length > 0)}
                  variant="primary"
                >
                  {isImporting ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span className="ml-2">Importing...</span>
                    </>
                  ) : (
                    <>
                      <FiUpload className="mr-2" />
                      Import Data
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-center">
                <FiAlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Import Result Display */}
          {importResult && (
            <div className={`mt-4 p-4 rounded-lg border ${
              importResult.success 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
            }`}>
              <div className="flex items-start">
                <FiCheckCircle className={`h-5 w-5 mr-2 mt-0.5 ${
                  importResult.success ? 'text-green-500' : 'text-red-500'
                }`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    importResult.success 
                      ? 'text-green-700 dark:text-green-400' 
                      : 'text-red-700 dark:text-red-400'
                  }`}>
                    {importResult.message}
                  </p>
                  
                  {importResult.success && (
                    <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                      Stats: {importResult.stats.customers_created} customers created, {' '}
                      {importResult.stats.customers_updated} updated, {' '}
                      {importResult.stats.invoices_created} invoices created
                      {importResult.stats.settings_updated && ', settings updated'}
                    </div>
                  )}
                  
                  {importResult.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Errors:</p>
                      <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                        {importResult.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                        {importResult.errors.length > 5 && (
                          <li>... and {importResult.errors.length - 5} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  {importResult.warnings.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Warnings:</p>
                      <ul className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1">
                        {importResult.warnings.slice(0, 3).map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                        {importResult.warnings.length > 3 && (
                          <li>... and {importResult.warnings.length - 3} more warnings</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportImportModal;
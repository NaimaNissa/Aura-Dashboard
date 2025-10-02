'use client';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, Upload, Download, FileText, AlertCircle } from 'lucide-react';
import { bulkUploadProducts } from '../../store/slices/productSlice';
import { closeModal } from '../../store/slices/uiSlice';

export default function BulkUploadModal() {
  const dispatch = useDispatch();
  const { modals } = useSelector((state) => state.ui);
  const { isLoading } = useSelector((state) => state.product);

  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [errors, setErrors] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      parseCSV(file);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const data = [];
      const newErrors = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim());
          const row = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          // Validate required fields
          if (!row.productname || !row.Price) {
            newErrors.push(`Row ${i + 1}: Missing required fields (productname, Price)`);
          }
          
          data.push(row);
        }
      }
      
      setCsvData(data);
      setErrors(newErrors);
    };
    reader.readAsText(file);
  };

  const handleUpload = () => {
    if (errors.length > 0) {
      alert('Please fix the errors before uploading');
      return;
    }
    
    dispatch(bulkUploadProducts(csvData)).then(() => {
      handleClose();
    });
  };

  const handleClose = () => {
    setCsvFile(null);
    setCsvData([]);
    setErrors([]);
    dispatch(closeModal('bulkUpload'));
  };

  const downloadTemplate = () => {
    const headers = [
      'productname',
      'Description',
      'Price',
      'Quantity',
      'productID',
      'productImg',
      'Colors',
      'KeyFeatures',
      'category'
    ];
    
    const sampleData = [
      'Sample Product',
      'This is a sample product description',
      '99.99',
      '10',
      'PROD-001',
      'https://example.com/image.jpg',
      'Red, Blue, Green',
      'Feature 1, Feature 2, Feature 3',
      'Electronics'
    ];
    
    const csvContent = [headers.join(','), sampleData.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!modals.bulkUpload) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Bulk Upload Products
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Download the CSV template to see the required format</li>
              <li>• Fill in your product data following the template</li>
              <li>• Upload the CSV file to bulk import products</li>
              <li>• Required fields: productname, Price</li>
            </ul>
          </div>

          {/* Template Download */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">CSV Template</p>
                <p className="text-sm text-gray-600">Download the template with sample data</p>
              </div>
            </div>
            <button
              onClick={downloadTemplate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Preview Data */}
          {csvData.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">
                Preview ({csvData.length} products)
              </h3>
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Product Name</th>
                      <th className="px-3 py-2 text-left">Price</th>
                      <th className="px-3 py-2 text-left">Quantity</th>
                      <th className="px-3 py-2 text-left">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="px-3 py-2">{row.productname}</td>
                        <td className="px-3 py-2">${row.Price}</td>
                        <td className="px-3 py-2">{row.Quantity}</td>
                        <td className="px-3 py-2">{row.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvData.length > 10 && (
                  <p className="p-3 text-sm text-gray-600 text-center">
                    ... and {csvData.length - 10} more products
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-medium text-red-900">Errors Found:</h3>
              </div>
              <ul className="text-sm text-red-800 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={isLoading || csvData.length === 0 || errors.length > 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isLoading ? 'Uploading...' : `Upload ${csvData.length} Products`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}







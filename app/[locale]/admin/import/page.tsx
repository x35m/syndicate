'use client';

import { useState } from 'react';

export default function AdminImportPage() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async (country?: string) => {
    setImporting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(country ? { country } : {}),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setResult(data.result);
      } else {
        setError(data.error || 'Import failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">RSS Import</h2>
        <p className="mt-2 text-gray-600">Import articles from configured RSS sources</p>
      </div>

      {/* Import Buttons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Start Import</h3>
        
        <div className="space-y-4">
          <div>
            <button
              onClick={() => handleImport('ukraine')}
              disabled={importing}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {importing ? 'Importing...' : 'Import Ukraine'}
            </button>
          </div>

          <div>
            <button
              onClick={() => handleImport()}
              disabled={importing}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {importing ? 'Importing...' : 'Import All Countries'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">Import Successful</h3>
          <div className="space-y-2 text-sm text-green-800">
            <p><strong>Total articles parsed:</strong> {result.total}</p>
            <p><strong>Relevant articles:</strong> {result.relevant}</p>
            <p><strong>Articles saved:</strong> {result.saved}</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Import Failed</h3>
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Note</h3>
        <p className="text-sm text-blue-800">
          Import may take 1-2 minutes depending on the number of sources. 
          Articles are filtered using AI to ensure relevance to the selected country.
        </p>
      </div>
    </div>
  );
}


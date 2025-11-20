'use client';

import { useCountry } from '@/contexts/CountryContext';

export default function CountryPage() {
  const { country } = useCountry();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {country.name}
          </h1>
          <span className="text-sm text-gray-500">
            ({country.code})
          </span>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Available Languages
          </h2>
          <div className="flex flex-wrap gap-2">
            {country.languages.map(lang => (
              <span
                key={lang.code}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  lang.isDefault
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {lang.name} ({lang.code})
                {lang.isDefault && ' • Default'}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            AI Settings
          </h2>
          <div className="text-sm text-gray-600">
            {country.aiSettings ? (
              <div className="space-y-2">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Content filtering enabled</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>AI categorization enabled</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>AI summarization enabled</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
                AI settings not configured
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


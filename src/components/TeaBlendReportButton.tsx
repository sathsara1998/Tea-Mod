// src/components/TeaBlendReportButton.tsx
'use client';

import { useState } from 'react';

interface TeaBlendReportButtonProps {
  blendId?: number;
  blendName?: string;
  className?: string;
}

export default function TeaBlendReportButton({
  blendId,
  blendName,
  className = '',
}: TeaBlendReportButtonProps) {
  const [loading, setLoading] = useState(false);

  const downloadReport = async () => {
    try {
      setLoading(true);
      
      // Construct query parameter
      const params = new URLSearchParams();
      if (blendId) params.set('id', blendId.toString());
      if (blendName) params.set('name', blendName);
      
      const response = await fetch(`/api/reports/tea-blend?${params}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to download report');
      }
      
      // Convert response to blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tea_blend_report_${blendId || blendName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={downloadReport}
      disabled={loading}
      className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 ${className}`}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Downloading...
        </>
      ) : (
        'Download Report'
      )}
    </button>
  );
}
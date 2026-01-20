"use client";

import { useState } from 'react';

interface AttendanceQRProps {
  registrationId: string;
  eventTitle: string;
}

export default function AttendanceQR({ registrationId, eventTitle }: AttendanceQRProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  async function generateQR() {
    if (qrCode) {
      setIsOpen(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/qr/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId })
      });
      const data = await res.json();
      if (data.qrCode) {
        setQrCode(data.qrCode);
        setIsOpen(true);
      } else {
        alert(data.error || 'Failed to generate QR code');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while generating the QR code');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button 
        onClick={generateQR}
        disabled={loading}
        className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'View Entry QR'}
      </button>

      {isOpen && qrCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Entry Ticket</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center space-y-4 border border-gray-100">
              <img 
                src={qrCode} 
                alt="Attendance QR Code" 
                className="w-full aspect-square rounded-lg shadow-sm"
              />
              <div className="text-center">
                <p className="font-bold text-gray-900">{eventTitle}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">Single Use Only</p>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center">
              Show this QR code to the staff at the entrance to check in.
            </p>

            <button 
              onClick={() => setIsOpen(false)}
              className="w-full py-2 bg-gray-900 text-white rounded-xl font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface VerificationResult {
  status: 'ok' | 'error';
  attendeeName?: string;
  role?: string;
  error?: string;
  reason?: string;
}

export default function StaffVerifyPage() {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isScanning && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        /* verbose= */ false
      );

      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
        scannerRef.current = null;
      }
    };
  }, [isScanning]);

  async function onScanSuccess(decodedText: string) {
    console.log(`Code matched = ${decodedText}`);
    
    // Stop scanning while processing
    if (scannerRef.current) {
      await scannerRef.current.pause(true);
    }
    
    setIsScanning(false);
    
    try {
      const response = await fetch('/api/qr/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: decodedText })
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult({ status: 'error', error: 'Failed to communicate with server' });
    }
  }

  function onScanFailure(error: any) {
    // We don't really need to log every failure as it happens constantly when no QR is in view
    // console.warn(`Code scan error = ${error}`);
  }

  function resetScanner() {
    setResult(null);
    setIsScanning(true);
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Attendance Verification</h1>
        <p className="text-gray-500">Scan attendee QR code to verify participation</p>
      </div>

      {isScanning ? (
        <div className="bg-white p-4 rounded-xl shadow-lg border">
          <div id="reader" className="overflow-hidden rounded-lg"></div>
        </div>
      ) : (
        <div className={`p-8 rounded-xl shadow-lg border text-center space-y-4 ${
          result?.status === 'ok' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          {result?.status === 'ok' ? (
            <>
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-800">Verified!</h2>
              <div className="space-y-1">
                <p className="text-lg font-medium text-green-900">{result.attendeeName}</p>
                <p className="text-sm uppercase tracking-wider text-green-700 opacity-75">{result.role}</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-800">Verification Failed</h2>
              <p className="text-red-700">{result?.error || 'Unknown error occurred'}</p>
            </>
          )}

          <button 
            onClick={resetScanner}
            className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors mt-4"
          >
            Scan Next
          </button>
        </div>
      )}

      <div className="text-sm text-gray-400 text-center">
        Only authorized staff can perform verification.
      </div>
    </div>
  );
}

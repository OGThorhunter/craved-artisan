import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Camera, CameraOff, AlertCircle, CheckCircle, X } from 'lucide-react';
import type { ScanQRCodeRequest, ScanResult } from '@/lib/api/checkin';

interface QRScannerProps {
  sessionId: string;
  onScanResult: (result: any) => void;
  onClose: () => void;
  location?: string;
}

export function QRScanner({ sessionId, onScanResult, onClose, location }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanning = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualScan = async () => {
    if (!manualCode.trim()) return;

    const scanRequest: ScanQRCodeRequest = {
      qrCode: manualCode.trim(),
      sessionId,
      location,
      deviceType: 'manual'
    };

    try {
      // TODO: Implement actual API call
      const mockResult = {
        success: true,
        data: {
          id: 'checkin_manual',
          ticketId: 'ticket_123',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          stallNumber: 'A1',
          status: 'COMPLETED',
          checkinTime: new Date().toISOString()
        }
      };

      setScanResult('SUCCESS');
      onScanResult(mockResult);
    } catch (error) {
      setScanResult('ERROR');
      setError('Failed to process scan');
    }
  };

  const handleQRCodeDetected = (qrCode: string) => {
    // In a real implementation, this would use a QR code library
    console.log('QR Code detected:', qrCode);
    
    const scanRequest: ScanQRCodeRequest = {
      qrCode,
      sessionId,
      location,
      deviceType: 'camera'
    };

    // Simulate API call
    setTimeout(() => {
      const mockResult = {
        success: true,
        data: {
          id: 'checkin_camera',
          ticketId: 'ticket_456',
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          stallNumber: 'B2',
          status: 'COMPLETED',
          checkinTime: new Date().toISOString()
        }
      };

      setScanResult('SUCCESS');
      onScanResult(mockResult);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">QR Code Scanner</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close scanner"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Camera View */}
        <div className="relative mb-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {isScanning ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Scanning Overlay */}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-brand-green border-dashed rounded-lg flex items-center justify-center">
                <div className="text-brand-green text-sm font-medium">Position QR code here</div>
              </div>
            </div>
          )}
        </div>

        {/* Camera Controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {!isScanning ? (
            <button
              onClick={startScanning}
              className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors"
            >
              <Camera className="w-4 h-4" />
              Start Camera
            </button>
          ) : (
            <button
              onClick={stopScanning}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <CameraOff className="w-4 h-4" />
              Stop Camera
            </button>
          )}
        </div>

        {/* Manual Entry */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Or enter QR code manually:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Enter QR code..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green"
              onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
            />
            <button
              onClick={handleManualScan}
              disabled={!manualCode.trim()}
              className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Scan
            </button>
          </div>
        </div>

        {/* Scan Result */}
        {scanResult && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${
            scanResult === 'SUCCESS' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {scanResult === 'SUCCESS' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={`text-sm font-medium ${
              scanResult === 'SUCCESS' ? 'text-green-800' : 'text-red-800'
            }`}>
              {scanResult === 'SUCCESS' 
                ? 'Check-in successful!' 
                : 'Scan failed. Please try again.'
              }
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 text-xs text-gray-500">
          <p>• Position the QR code within the scanning area</p>
          <p>• Ensure good lighting and steady hands</p>
          <p>• Or enter the QR code manually above</p>
        </div>
      </div>
    </div>
  );
}

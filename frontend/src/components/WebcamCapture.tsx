'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, CameraOff } from 'lucide-react';

interface WebcamCaptureProps {
  onCapture?: (imageSrc: string) => void;
  title?: string;
  isActive?: boolean;
}

export default function WebcamCapture({ onCapture, title = "Biometric Capture", isActive = false }: WebcamCaptureProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 320, 
          height: 240,
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        setError(null);
      }
    } catch (err) {
      setError('Camera access denied or not available');
      console.error('Error accessing camera:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const captureImage = useCallback(() => {
    if (videoRef.current && isStreaming) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      if (context) {
        context.drawImage(videoRef.current, 0, 0);
        const imageSrc = canvas.toDataURL('image/jpeg', 0.8);
        onCapture?.(imageSrc);
      }
    }
  }, [isStreaming, onCapture]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
      
      <div className="space-y-3">
        {/* Camera View */}
        <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '180px' }}>
          {error ? (
            <div className="flex items-center justify-center h-full text-red-500 text-sm">
              {error}
            </div>
          ) : isStreaming ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Camera className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Camera not started</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-2">
          {!isStreaming ? (
            <button
              type="button"
              onClick={startCamera}
              className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center gap-1"
            >
              <Camera className="w-4 h-4" />
              Start Camera
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={captureImage}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
              >
                Capture
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 flex items-center gap-1"
              >
                <CameraOff className="w-4 h-4" />
                Stop
              </button>
            </>
          )}
        </div>

        {isStreaming && (
          <p className="text-xs text-gray-500 text-center">
            Position your face in the camera view and click capture for biometric registration
          </p>
        )}
      </div>
    </div>
  );
}

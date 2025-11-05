import React, { useState, useRef, useCallback } from 'react';

interface PhotoCaptureProps {
  onPhotoCapture: (file: File) => void;
  onCancel: () => void;
  isUploading?: boolean;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  onPhotoCapture,
  onCancel,
  isUploading = false
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [cameraError, setCameraError] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraError('');
    } catch (error: any) {
      console.error('Failed to access camera:', error);
      setHasCamera(false);
      setCameraError(error.name === 'NotAllowedError' 
        ? 'Camera permission denied. Please enable camera access and try again.'
        : 'Unable to access camera. You can still upload a photo from your gallery.'
      );
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedPhoto(imageDataUrl);
    
    // Stop camera after capture
    stopCamera();
  };

  const confirmPhoto = () => {
    if (!capturedPhoto || !canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `chore-proof-${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        onPhotoCapture(file);
      }
    }, 'image/jpeg', 0.8);
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Compress and resize image if needed
      compressImage(file, (compressedFile) => {
        onPhotoCapture(compressedFile);
      });
    }
  };

  const compressImage = (file: File, callback: (file: File) => void) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions (max 500px)
      const maxSize = 500;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          callback(compressedFile);
        }
      }, 'image/jpeg', 0.7);
    };

    img.src = URL.createObjectURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black text-white">
        <button
          onClick={onCancel}
          className="text-white hover:text-gray-300 p-2"
        >
          ✕
        </button>
        <h2 className="text-lg font-medium">Add Proof Photo</h2>
        <div className="w-10"></div>
      </div>

      {/* Camera View or Photo Preview */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        {capturedPhoto ? (
          // Photo Preview
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={capturedPhoto}
              alt="Captured proof"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ) : hasCamera && stream ? (
          // Camera View
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Camera overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-4 border-2 border-white border-opacity-50 rounded-lg"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-white rounded-full"></div>
            </div>
          </div>
        ) : (
          // Error or fallback state
          <div className="text-center text-white p-8">
            <div className="text-4xl mb-4">📷</div>
            <p className="text-lg mb-4">Camera Unavailable</p>
            {cameraError && (
              <p className="text-sm text-gray-300 mb-6">{cameraError}</p>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-white text-black px-6 py-3 rounded-lg font-medium"
            >
              Choose from Gallery
            </button>
          </div>
        )}

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="p-6 bg-black">
        {capturedPhoto ? (
          // Photo confirmation controls
          <div className="flex justify-center space-x-4">
            <button
              onClick={retakePhoto}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium"
            >
              Retake
            </button>
            <button
              onClick={confirmPhoto}
              disabled={isUploading}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Use Photo'}
            </button>
          </div>
        ) : hasCamera && stream ? (
          // Camera controls
          <div className="flex justify-center items-center space-x-8">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center text-white text-xl"
            >
              🖼️
            </button>
            
            <button
              onClick={capturePhoto}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl shadow-lg"
            >
              📸
            </button>
            
            <button
              onClick={startCamera}
              className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center text-white text-xl"
            >
              🔄
            </button>
          </div>
        ) : (
          // Fallback controls
          <div className="flex justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium"
            >
              Choose Photo
            </button>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        capture="environment"
      />
    </div>
  );
};

export default PhotoCapture;
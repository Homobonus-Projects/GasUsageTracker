
import React, { useState, useRef } from 'react';
import { extractMeterReading } from '../services/geminiService';

interface AddReadingProps {
  onAdd: (value: number, imageUrl?: string) => void;
  onCancel: () => void;
}

const compressImage = (base64Str: string, maxWidth = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      // Using JPEG for better compression of photo data
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(base64Str); // Fallback to original if compression fails
  });
};

const AddReading: React.FC<AddReadingProps> = ({ onAdd, onCancel }) => {
  const [image, setImage] = useState<string | null>(null);
  const [extractedValue, setExtractedValue] = useState<number | string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const originalBase64 = reader.result as string;
        
        // Compress immediately to save memory and storage space
        const compressedBase64 = await compressImage(originalBase64);
        setImage(compressedBase64);
        processImage(compressedBase64);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (base64: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await extractMeterReading(base64);
      if (result !== null) {
        setExtractedValue(result);
      } else {
        setError("Could not read digits. Please enter manually or try another photo.");
      }
    } catch (err) {
      setError("Analysis failed. Please check your connection or enter manually.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = typeof extractedValue === 'string' ? parseFloat(extractedValue) : extractedValue;
    if (!isNaN(val) && val >= 0) {
      onAdd(val, image || undefined);
    } else {
      setError("Please enter a valid meter reading.");
    }
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <header className="text-center">
        <h2 className="text-3xl font-extrabold text-slate-900">New Gas Reading</h2>
        <p className="text-slate-500 mt-2">Take a photo of your meter to auto-detect usage</p>
      </header>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div 
          className="aspect-video bg-slate-50 border-b border-slate-100 relative flex items-center justify-center cursor-pointer group"
          onClick={triggerCamera}
        >
          {image ? (
            <img src={image} alt="Preview" className="w-full h-full object-contain" />
          ) : (
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <i className="fas fa-camera text-2xl"></i>
              </div>
              <p className="font-semibold text-slate-700">Tap to Take Photo / Upload</p>
              <p className="text-slate-400 text-sm mt-1">Capture your gas meter digits clearly</p>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            onChange={handleFileChange} 
          />
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 uppercase tracking-wider">Meter Reading (m³)</label>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                required
                value={extractedValue}
                onChange={(e) => setExtractedValue(e.target.value)}
                placeholder="00000.000"
                className="w-full text-3xl font-mono font-bold p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:ring-0 outline-none transition-colors"
              />
              {isProcessing && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-semibold text-blue-600">AI Reading...</span>
                </div>
              )}
            </div>
            {error && <p className="text-red-500 text-sm flex items-center gap-2 mt-2">
              <i className="fas fa-circle-exclamation"></i> {error}
            </p>}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 text-slate-600 font-bold border-2 border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 disabled:bg-slate-300 shadow-lg shadow-blue-100 transition-all"
            >
              Save Reading
            </button>
          </div>
        </form>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3 text-amber-800 text-sm">
        <i className="fas fa-lightbulb text-amber-500 mt-1"></i>
        <p>
          <strong>Tip:</strong> For best results, ensure the flash is off if it causes glare on the glass cover, and try to keep the numbers level in the frame.
        </p>
      </div>
    </div>
  );
};

export default AddReading;

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProviderOnboardingStep6() {
  const router = useRouter();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('provider_onboarding_photoPreview');
    if (saved) setPhotoPreview(saved);
  }, []);

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be less than 5MB');
      return;
    }

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setError('Photo must be JPG or PNG');
      return;
    }

    setError('');
    setPhotoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setPhotoPreview(dataUrl);
      sessionStorage.setItem('provider_onboarding_photoPreview', dataUrl);
      sessionStorage.setItem('provider_onboarding_photoName', file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files[0]);
  };

  const handleContinue = () => {
    if (!photoPreview) {
      setError('A photo is required. Profiles with photos get 10x more inquiries!');
      return;
    }
    router.push('/provider/onboarding/step-7');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step 6 of 9</span>
            <span className="text-sm text-gray-500">~5 minutes</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '66.67%' }} />
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Upload a photo *
          </h1>
          <p className="text-gray-600">
            Profiles with photos get 10x more inquiries
          </p>
        </div>

        <div className="mb-6">
          {photoPreview ? (
            <div className="space-y-4">
              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => {
                  setPhotoPreview(null);
                  setPhotoFile(null);
                  sessionStorage.removeItem('provider_onboarding_photoPreview');
                  sessionStorage.removeItem('provider_onboarding_photoName');
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg"
              >
                Remove Photo
              </button>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="mt-4">
                <label className="cursor-pointer">
                  <span className="text-indigo-600 hover:text-indigo-700 font-medium">Upload a file</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  />
                </label>
                <span className="text-gray-600"> or drag and drop</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">JPG or PNG, max 5MB</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => router.push('/provider/onboarding/step-5')} className="sm:w-32 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300">
            ← Back
          </button>
          <div className="flex-1 flex gap-3">
            <button onClick={() => setError('A photo is required to complete your profile')} className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg border-2 border-gray-300">
              Skip
            </button>
            <button
              onClick={handleContinue}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg"
            >
              Continue →
            </button>
          </div>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">* Required field</p>
      </div>
    </div>
  );
}

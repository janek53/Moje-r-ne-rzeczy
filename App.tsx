import React, { useState, useCallback } from 'react';
import { editImage } from './services/geminiService';

const App: React.FC = () => {
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [uploadedImageMimeType, setUploadedImageMimeType] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [editedImageSrc, setEditedImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setUploadedImageSrc(reader.result as string);
        setUploadedImageBase64(base64);
        setUploadedImageMimeType(file.type);
        setEditedImageSrc(null); // Clear previous edited image
        setError(null);
      };
      reader.onerror = () => {
        setError("Failed to read image file.");
        setUploadedImageSrc(null);
        setUploadedImageBase64(null);
        setUploadedImageMimeType(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleEditImage = useCallback(async () => {
    if (!uploadedImageBase64 || !uploadedImageMimeType || !prompt.trim()) {
      setError('Please upload an image and enter a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImageSrc(null); // Clear previous edited image

    try {
      const result = await editImage(uploadedImageBase64, uploadedImageMimeType, prompt);
      setEditedImageSrc(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during image editing.');
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImageBase64, uploadedImageMimeType, prompt]);

  return (
    <div className="bg-white p-6 md:p-10 rounded-xl shadow-lg w-full max-w-4xl mx-auto flex flex-col space-y-8 md:space-y-0 md:flex-row md:space-x-8">
      <div className="flex-1 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">Gemini Image Editor</h1>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-all duration-200 cursor-pointer">
          <label htmlFor="file-upload" className="block text-gray-700 font-semibold mb-2">
            Upload an image
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => document.getElementById('file-upload')?.click()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Choose File
          </button>
          {uploadedImageSrc && (
            <p className="mt-4 text-sm text-gray-500">Image selected for editing.</p>
          )}
        </div>

        {uploadedImageSrc && (
          <div className="mt-4 text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Original Image Preview</h2>
            <img
              src={uploadedImageSrc}
              alt="Uploaded Preview"
              className="max-w-full h-auto mx-auto rounded-lg shadow-md object-contain max-h-64"
            />
          </div>
        )}

        <div className="mt-6">
          <label htmlFor="prompt-input" className="block text-gray-700 font-semibold mb-2">
            Enter your editing prompt:
          </label>
          <textarea
            id="prompt-input"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-y min-h-[100px]"
            placeholder="e.g., Add a retro filter, Remove the person in the background, Make it look like a painting"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
          />
        </div>

        <button
          onClick={handleEditImage}
          disabled={isLoading || !uploadedImageSrc}
          className={`w-full py-3 px-6 rounded-lg text-lg font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isLoading || !uploadedImageSrc
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
            }`}
        >
          {isLoading ? 'Editing Image...' : 'Edit Image with Gemini'}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-lg p-6 shadow-inner relative min-h-[300px] md:min-h-0">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Edited Image</h2>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-lg">
            <div className="flex flex-col items-center text-blue-600">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-3 text-lg font-medium">Generating your image...</p>
            </div>
          </div>
        )}
        {!isLoading && editedImageSrc ? (
          <img
            src={editedImageSrc}
            alt="Edited"
            className="max-w-full h-auto mx-auto rounded-lg shadow-md object-contain max-h-96"
          />
        ) : !isLoading && !editedImageSrc && (
          <p className="text-gray-500 text-center">
            Upload an image and enter a prompt to see the edited version here.
          </p>
        )}
      </div>
    </div>
  );
};

export default App;
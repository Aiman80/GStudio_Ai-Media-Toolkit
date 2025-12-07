
import React from 'react';

interface ImageViewerProps {
  title: string;
  imageUrl: string | null;
  isLoading?: boolean;
  children?: React.ReactNode;
  onClear?: () => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-200/50 backdrop-blur-sm z-10">
        <div className="w-16 h-16 border-4 border-t-transparent border-brand-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-lg font-semibold text-content-100">Enhancing Image...</p>
    </div>
);

export const ImageViewer: React.FC<ImageViewerProps> = ({ title, imageUrl, isLoading = false, children, onClear }) => {
  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'upscaled-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
    
  return (
    <div className="bg-base-200 p-4 rounded-xl shadow-lg flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-content-100">{title}</h2>
        {imageUrl && onClear && (
            <button onClick={onClear} className="text-sm text-content-200 hover:text-red-400 transition-colors">
                Clear
            </button>
        )}
        {imageUrl && !onClear && (
            <button onClick={handleDownload} className="flex items-center text-sm font-medium bg-brand-primary text-white py-1 px-3 rounded-md hover:bg-brand-primary/90 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
            </button>
        )}
      </div>
      <div className="aspect-square w-full bg-base-300 rounded-lg relative overflow-hidden flex items-center justify-center">
        {isLoading && <LoadingSpinner />}
        {!isLoading && imageUrl && (
          <img src={imageUrl} alt={title} className="object-contain w-full h-full" />
        )}
        {children}
      </div>
    </div>
  );
};

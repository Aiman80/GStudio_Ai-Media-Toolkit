
import React, { useRef, useCallback } from 'react';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  hasImage: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, hasImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  };

  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };
  
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.currentTarget.classList.add('border-brand-primary');
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.currentTarget.classList.remove('border-brand-primary');
  }, []);

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.currentTarget.classList.remove('border-brand-primary');
      const file = event.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        onImageUpload(file);
      }
  }, [onImageUpload]);

  if (hasImage) {
    return null; // Don't render anything if an image is already displayed in the parent
  }

  return (
    <div 
        className="absolute inset-0 flex items-center justify-center p-4 cursor-pointer"
        onClick={handleContainerClick}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      <div className="text-center text-content-200 p-6 border-2 border-dashed border-base-300 rounded-lg w-full h-full flex flex-col justify-center items-center transition-colors duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-content-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <p className="font-semibold">Click to upload, drag & drop, or paste image</p>
        <p className="text-sm">PNG, JPG, or WEBP (Ctrl+V)</p>
      </div>
    </div>
  );
};

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ImageUploader } from './ImageUploader';
import { ImageViewer } from './ImageViewer';
import { TipsPanel } from './TipsPanel';
import { upscaleImage } from '../services/geminiService';

const PROMPT_TEMPLATES = {
  UPSCALE_2X: "This image has been digitally enlarged 2 times. Please enhance its quality by sharpening details, reducing pixelation, and improving overall clarity to make it look like a native high-resolution photo. Do not add or remove any objects. Keep the original style and composition intact.",
  DEFAULT: "Subtly enhance this image's resolution. Improve fine details, clarity, and lighting to be more natural. Do not add or remove any objects. Keep the original style and composition intact.",
  VIBRANT: 'Boost the color saturation and vibrancy of this image. Make the colors pop without looking unnatural. Enhance the contrast slightly.',
  CINEMATIC: 'Give this image a cinematic look. Adjust the color grading to be more dramatic, add a subtle film grain, and enhance the lighting to create more depth.',
  SHARPEN: 'Focus on sharpening the fine details in this image. Increase the definition of edges and textures without introducing halos or artifacts.'
};

const UPSCALE_OPTIONS = [
  { name: 'Enhance Only', factor: 1, prompt: PROMPT_TEMPLATES.DEFAULT },
  { name: 'Upscale 2x', factor: 2, prompt: PROMPT_TEMPLATES.UPSCALE_2X },
];

const EXAMPLE_PROMPTS = [
  { name: '2x Upscale', prompt: PROMPT_TEMPLATES.UPSCALE_2X, factor: 2 },
  { name: 'Default Enhance', prompt: PROMPT_TEMPLATES.DEFAULT, factor: 1 },
  { name: 'Vibrant Colors', prompt: PROMPT_TEMPLATES.VIBRANT },
  { name: 'Cinematic Look', prompt: PROMPT_TEMPLATES.CINEMATIC },
  { name: 'Sharpen Details', prompt: PROMPT_TEMPLATES.SHARPEN },
];

const resizeImage = (dataUrl: string, scale: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
            reject(new Error('Failed to load image for resizing.'));
        };
        img.src = dataUrl;
    });
};

export const ImageEnhancer: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [upscaledImage, setUpscaledImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPromptLoading, setIsPromptLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [upscaleFactor, setUpscaleFactor] = useState<number>(2);
  const [prompt, setPrompt] = useState<string>(PROMPT_TEMPLATES.UPSCALE_2X);
  const promptLoadingTimer = useRef<number | null>(null);

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImage(reader.result as string);
      setUpscaledImage(null);
      setError(null);
    };
    reader.onerror = () => {
        setError("Failed to read the image file. Please try again.");
    };
    reader.readAsDataURL(file);
  }, []);

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (originalImage) {
        return; // Don't handle paste if an image is already loaded
      }

      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            handleImageUpload(file);
            event.preventDefault();
            return; // Stop after handling the first image
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [originalImage, handleImageUpload]);

  const handleUpscale = useCallback(async () => {
    if (!originalImage) {
      setError("Please upload an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setUpscaledImage(null);

    try {
      let imageToProcess = originalImage;
      if (upscaleFactor > 1) {
        imageToProcess = await resizeImage(originalImage, upscaleFactor);
      }
      const result = await upscaleImage(imageToProcess, prompt);
      setUpscaledImage(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during upscaling.");
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, prompt, upscaleFactor]);
  
  const handleSuggestionClick = (example: { name: string, prompt: string, factor?: number }) => {
      if (promptLoadingTimer.current) {
        clearTimeout(promptLoadingTimer.current);
      }
      setIsPromptLoading(true);

      promptLoadingTimer.current = window.setTimeout(() => {
        setPrompt(example.prompt);
        if (example.factor) {
            setUpscaleFactor(example.factor);
        }
        setIsPromptLoading(false);
        promptLoadingTimer.current = null;
      }, 300);
  };

  const handleUpscaleFactorChange = (factor: number) => {
    setUpscaleFactor(factor);
    const selectedOption = UPSCALE_OPTIONS.find(opt => opt.factor === factor);
    if (selectedOption) {
        handleSuggestionClick(selectedOption);
    }
  };

  const handleClearAll = () => {
    setOriginalImage(null);
    setUpscaledImage(null);
    setError(null);
    setIsLoading(false);
    // Reset to default state
    setUpscaleFactor(2);
    setPrompt(PROMPT_TEMPLATES.UPSCALE_2X);
  };

  return (
    <div className="w-full max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageViewer title="Original Image" imageUrl={originalImage} onClear={() => setOriginalImage(null)}>
              <ImageUploader onImageUpload={handleImageUpload} hasImage={!!originalImage} />
            </ImageViewer>
            <ImageViewer title="Upscaled Image" imageUrl={upscaledImage} isLoading={isLoading} />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div className="bg-base-200 p-6 rounded-xl shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                  <label htmlFor="prompt" className="block text-lg font-semibold text-content-100 mb-2 sm:mb-0">Enhancement Mode</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2 p-1 bg-base-300 rounded-lg">
                        {UPSCALE_OPTIONS.map((option) => (
                            <button
                                key={option.name}
                                onClick={() => handleUpscaleFactorChange(option.factor)}
                                className={`px-3 py-1 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-300 focus:ring-brand-primary ${
                                    upscaleFactor === option.factor ? 'bg-brand-primary text-white shadow' : 'text-content-200 hover:bg-base-100/50'
                                }`}
                            >
                                {option.name}
                            </button>
                        ))}
                    </div>
                    {originalImage && (
                        <button
                            onClick={handleClearAll}
                            className="flex items-center text-sm font-medium bg-base-300 text-content-200 p-2 rounded-lg hover:bg-red-900/50 hover:text-red-300 transition-colors"
                            aria-label="Clear all images and settings"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                  </div>
              </div>
              
              <label className="block text-md font-semibold text-content-100 mb-2">Enhancement Prompt</label>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-sm font-medium text-content-200 mr-2">Suggestions:</span>
                {EXAMPLE_PROMPTS.map((example) => (
                  <button
                    key={example.name}
                    onClick={() => handleSuggestionClick(example)}
                    disabled={isPromptLoading}
                    className="px-3 py-1 text-xs font-semibold bg-base-300 hover:bg-brand-primary text-content-100 hover:text-white rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-200 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-wait"
                    aria-label={`Set prompt to ${example.name}`}
                  >
                    {example.name}
                  </button>
                ))}
              </div>
              <div className="relative">
                {isPromptLoading && (
                  <div className="absolute top-2 left-3 text-sm text-content-200 animate-pulse">Loading prompt...</div>
                )}
                <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    readOnly={isPromptLoading}
                    className={`w-full h-28 p-3 bg-base-300 border-2 border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 text-content-100 resize-none ${isPromptLoading ? 'opacity-50' : ''}`}
                    placeholder="Describe how you want to enhance the image..."
                />
              </div>
               <button 
                  onClick={handleUpscale}
                  disabled={!originalImage || isLoading}
                  className="mt-4 w-full flex items-center justify-center text-lg font-bold py-3 px-6 rounded-lg bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
              >
                  {isLoading ? (
                      <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enhancing...
                      </>
                  ) : (
                      "✨ Enhance Image"
                  )}
              </button>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <TipsPanel />
        </div>

      </div>
    </div>
  );
};
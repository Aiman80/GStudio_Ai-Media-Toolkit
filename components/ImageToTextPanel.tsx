import React, { useState, useCallback, useEffect } from 'react';
import { ImageViewer } from './ImageViewer';
import { ImageUploader } from './ImageUploader';
import { generateTextFromImage, enhancePrompt } from '../services/geminiService';

const MODELS = [
  { id: 'flux', name: 'Flux Dev' },
  { id: 'qwen', name: 'Qwen' },
  { id: 'sdxl', name: 'SDXL' },
];

const STYLES = [
  '2D Vector',
  '3D Detailed Unreal Engine Render',
  '3D Disney Pixar',
  'Abstract',
  'Anime',
  'Chinese Ink Drawing',
  'Cinematic',
  'Comic Book',
  'Cyberpunk',
  'Fantasy Art',
  'Flat Illustration',
  'Graffiti',
  'Icon',
  'Impressionism',
  'Isometric',
  'Line Art',
  'Low Poly',
  'Minimalist',
  'Pencil Drawing',
  'Photorealistic',
  'Sketchup',
  'Steampunk',
  'Sticker',
  'Surrealism',
  'Watercolor',
];

const LoadingSpinner: React.FC<{ text: string }> = ({ text }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-200/50 backdrop-blur-sm z-10">
      <div className="w-12 h-12 border-4 border-t-transparent border-brand-primary rounded-full animate-spin"></div>
      <p className="mt-3 text-md font-semibold text-content-100">{text}</p>
  </div>
);

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copySuccess, setCopySuccess] = useState('');
    const handleCopy = useCallback(() => {
        if (navigator.clipboard && textToCopy) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                setCopySuccess('Copied!');
                setTimeout(() => setCopySuccess(''), 2000);
            }, () => {
                setCopySuccess('Failed');
                setTimeout(() => setCopySuccess(''), 2000);
            });
        }
    }, [textToCopy]);

    return (
        <button
            onClick={handleCopy}
            disabled={!textToCopy}
            className="absolute top-3 right-3 flex items-center text-sm font-medium bg-base-100 text-content-200 py-1 px-3 rounded-md hover:bg-brand-primary hover:text-white transition-colors disabled:opacity-50"
            aria-label="Copy to clipboard"
        >
            {copySuccess || 'Copy'}
        </button>
    );
};

export const ImageToTextPanel: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [generatedText, setGeneratedText] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    
    const [basePrompt, setBasePrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
    const [enhancedPositivePrompt, setEnhancedPositivePrompt] = useState('');
    const [enhancedNegativePrompt, setEnhancedNegativePrompt] = useState('');
    const [isEnhancing, setIsEnhancing] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result as string);
            setGeneratedText('');
            setError(null);
        };
        reader.onerror = () => setError("Failed to read the image file.");
        reader.readAsDataURL(file);
    }, []);

    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            if (image) {
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
    }, [image, handleImageUpload]);

    const handleGenerateDescription = async () => {
        if (!image) return;
        setIsGenerating(true);
        setError(null);
        try {
            const description = await generateTextFromImage(image);
            setGeneratedText(description);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleEnhancePrompt = async () => {
        if (!basePrompt) return;
        setIsEnhancing(true);
        setError(null);
        setEnhancedPositivePrompt('');
        setEnhancedNegativePrompt('');
        try {
            const result = await enhancePrompt(basePrompt, negativePrompt, selectedModel, selectedStyles.join(', '));
            const [positive, negative] = result.split('---');
            setEnhancedPositivePrompt(positive?.trim() || '');
            setEnhancedNegativePrompt(negative?.trim() || 'No negative prompt was generated.');
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleStyleToggle = (style: string) => {
        setSelectedStyles(prev => 
            prev.includes(style) 
            ? prev.filter(s => s !== style) 
            : [...prev, style]
        );
    };

    return (
        <div className="w-full max-w-7xl">
            {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center mb-6" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image to Text Section */}
                <div className="bg-base-200 p-6 rounded-xl shadow-lg space-y-4">
                    <h2 className="text-2xl font-bold text-content-100 flex items-center">
                        <span className="text-2xl mr-2">🖼️➡️✍️</span> Image to Text
                    </h2>
                    <ImageViewer title="Your Image" imageUrl={image} onClear={() => setImage(null)}>
                        <ImageUploader onImageUpload={handleImageUpload} hasImage={!!image} />
                    </ImageViewer>
                    <button
                        onClick={handleGenerateDescription}
                        disabled={!image || isGenerating}
                        className="w-full text-lg font-bold py-3 px-6 rounded-lg bg-brand-primary text-white shadow-md hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isGenerating ? 'Generating...' : 'Generate Description'}
                    </button>
                    <div className="relative">
                        <textarea
                            readOnly
                            value={generatedText}
                            className="w-full h-32 p-3 bg-base-300 border-2 border-base-300 rounded-lg text-content-100 resize-none focus:outline-none"
                            placeholder="Generated image description will appear here..."
                            aria-label="Generated description from image"
                        />
                         {isGenerating && <LoadingSpinner text="Analyzing..." />}
                         <CopyButton textToCopy={generatedText} />
                    </div>
                </div>

                {/* Prompt Enhancer Section */}
                <div className="bg-base-200 p-6 rounded-xl shadow-lg space-y-4">
                    <h2 className="text-2xl font-bold text-content-100 flex items-center">
                        <span className="text-2xl mr-2">🚀</span> Prompt Enhancer
                    </h2>
                    
                    <div>
                        <label className="block text-md font-semibold text-content-100 mb-2">1. Your Base Prompt</label>
                        <textarea
                            value={basePrompt}
                            onChange={(e) => setBasePrompt(e.target.value)}
                            className="w-full h-24 p-3 bg-base-300 border-2 border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 text-content-100 resize-none"
                            placeholder="e.g., a robot cat in a futuristic city"
                        />
                    </div>
                     <div>
                        <label className="block text-md font-semibold text-content-100 mb-2">2. Negative Prompt (Optional)</label>
                        <textarea
                            value={negativePrompt}
                            onChange={(e) => setNegativePrompt(e.target.value)}
                            className="w-full h-16 p-3 bg-base-300 border-2 border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 text-content-100 resize-none"
                            placeholder="e.g., blurry, extra limbs, bad lighting"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-md font-semibold text-content-100 mb-2">3. Select AI Model</label>
                         <div className="flex items-center space-x-2 p-1 bg-base-300 rounded-lg">
                            {MODELS.map((model) => (
                                <button key={model.id} onClick={() => setSelectedModel(model.id)}
                                className={`w-full px-3 py-1 text-sm font-semibold rounded-md transition-all duration-200 ${selectedModel === model.id ? 'bg-brand-primary text-white shadow' : 'text-content-200 hover:bg-base-100/50'}`}>
                                    {model.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                     <div>
                        <div className="flex justify-between items-center mb-2">
                           <label className="block text-md font-semibold text-content-100">4. Select Style(s)</label>
                           {selectedStyles.length > 0 && (
                                <button 
                                    onClick={() => setSelectedStyles([])}
                                    className="text-xs font-semibold text-content-200 hover:text-brand-secondary transition-colors"
                                >
                                    Clear
                                </button>
                           )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {STYLES.map(style => (
                                <button key={style} onClick={() => handleStyleToggle(style)}
                                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${selectedStyles.includes(style) ? 'bg-brand-secondary text-white' : 'bg-base-300 hover:bg-brand-secondary/80 text-content-100'}`}>
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleEnhancePrompt}
                        disabled={!basePrompt || isEnhancing}
                        className="w-full text-lg font-bold py-3 px-6 rounded-lg bg-brand-secondary text-white shadow-md hover:bg-brand-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isEnhancing ? 'Enhancing...' : 'Enhance Prompt'}
                    </button>
                    <div className="relative space-y-4">
                        <div>
                           <label className="block text-sm font-semibold text-content-100 mb-1">Enhanced Positive Prompt</label>
                           <div className="relative">
                               <textarea
                                   readOnly
                                   value={enhancedPositivePrompt}
                                   className="w-full h-28 p-3 bg-base-300 border-2 border-base-300 rounded-lg text-content-100 resize-none focus:outline-none"
                                   placeholder="Your enhanced positive prompt will appear here..."
                                   aria-label="Enhanced positive prompt"
                               />
                               <CopyButton textToCopy={enhancedPositivePrompt} />
                           </div>
                        </div>
                         <div>
                           <label className="block text-sm font-semibold text-content-100 mb-1">Generated Negative Prompt</label>
                            <div className="relative">
                                <textarea
                                    readOnly
                                    value={enhancedNegativePrompt}
                                    className="w-full h-20 p-3 bg-base-300 border-2 border-base-300 rounded-lg text-content-100 resize-none focus:outline-none"
                                    placeholder="Your generated negative prompt will appear here..."
                                    aria-label="Generated negative prompt"
                                />
                                <CopyButton textToCopy={enhancedNegativePrompt} />
                            </div>
                        </div>
                        {isEnhancing && <LoadingSpinner text="Enhancing..." />}
                    </div>
                </div>
            </div>
        </div>
    );
};
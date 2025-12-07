import React, { useState } from 'react';
import { Header } from './components/Header';
import { ImageEnhancer } from './components/ImageEnhancer';
import { CameraMotionPanel } from './components/CameraMotionPanel';
import { ImageToTextPanel } from './components/ImageToTextPanel';

type Tab = 'enhancer' | 'camera' | 'img2txt';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('enhancer');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'enhancer':
        return <ImageEnhancer />;
      case 'camera':
        return <CameraMotionPanel />;
      case 'img2txt':
        return <ImageToTextPanel />;
      default:
        return <ImageEnhancer />;
    }
  };

  return (
    <div className="min-h-screen bg-base-100 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <Header />
      
      <div className="w-full max-w-7xl mt-6">
        <div className="flex justify-center border-b border-base-300 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab('enhancer')}
            className={`px-4 py-3 text-md sm:text-lg font-semibold transition-all duration-200 border-b-4 ${
              activeTab === 'enhancer' ? 'text-brand-primary border-brand-primary' : 'text-content-200 border-transparent hover:text-content-100'
            }`}
            aria-current={activeTab === 'enhancer'}
          >
            Image Upscaler
          </button>
          <button
            onClick={() => setActiveTab('img2txt')}
            className={`px-4 py-3 text-md sm:text-lg font-semibold transition-all duration-200 border-b-4 ${
              activeTab === 'img2txt' ? 'text-brand-primary border-brand-primary' : 'text-content-200 border-transparent hover:text-content-100'
            }`}
            aria-current={activeTab === 'img2txt'}
          >
            Image to Text & Prompting
          </button>
          <button
            onClick={() => setActiveTab('camera')}
            className={`px-4 py-3 text-md sm:text-lg font-semibold transition-all duration-200 border-b-4 ${
              activeTab === 'camera' ? 'text-brand-primary border-brand-primary' : 'text-content-200 border-transparent hover:text-content-100'
            }`}
             aria-current={activeTab === 'camera'}
          >
            Camera Motion Prompts
          </button>
        </div>
      </div>
      
      <main className="w-full flex-grow flex justify-center">
        {renderTabContent()}
      </main>
    </div>
  );
}
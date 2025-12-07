import React, { useState, useCallback } from 'react';
import { enhanceVideoPrompt } from '../services/geminiService';

const CAMERA_MOTIONS = [
  { name: 'Pan Left', prompt: 'A smooth camera pan from right to left, revealing the scene.' },
  { name: 'Pan Right', prompt: 'A smooth camera pan from left to right, revealing the scene.' },
  { name: 'Tilt Up', prompt: 'A smooth camera tilt upwards, starting from a low angle and moving high.' },
  { name: 'Tilt Down', prompt: 'A smooth camera tilt downwards, starting from a high angle and moving low.' },
  { name: 'Zoom In', prompt: 'A steady and slow zoom in on the main subject, creating focus and tension.' },
  { name: 'Zoom Out', prompt: 'A steady and slow zoom out, revealing the broader context of the environment.' },
  { name: 'Dolly Forward', prompt: 'A dolly shot moving forward, smoothly advancing towards the subject.' },
  { name: 'Crane Shot', prompt: 'A crane shot that starts low and moves high up, providing an aerial perspective of the scene.' },
  { name: 'Tracking Shot', prompt: 'A tracking shot that follows a moving subject, keeping them centered in the frame.' },
  { name: 'Orbit Shot', prompt: 'An orbit shot circling the subject, capturing a 360-degree view of their form and surroundings.' },
  { name: 'Dutch Angle', prompt: 'A shot with a tilted camera angle, creating a sense of unease, tension, or dynamic action.' },
  { name: 'Crash Zoom', prompt: 'A very fast zoom-in, creating a jarring, dramatic, or comedic effect.' },
  { name: 'Slow Motion', prompt: 'The scene is captured in slow motion, emphasizing every detail of the action.' },
  { name: 'Time-lapse', prompt: 'A time-lapse shot, showing a long period of time passing quickly.' },
  { name: 'First-Person POV', prompt: 'A point-of-view shot, showing the scene from the perspective of a character.' },
];

export const CameraMotionPanel: React.FC = () => {
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedMotion, setSelectedMotion] = useState<{ name: string; prompt: string } | null>(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState('1. Describe a scene. 2. Select a motion. 3. Click Enhance for extra AI detail!');
  const [copySuccess, setCopySuccess] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleCopy = useCallback(() => {
    if (navigator.clipboard && enhancedPrompt) {
        navigator.clipboard.writeText(enhancedPrompt).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Failed');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    }
  }, [enhancedPrompt]);

  const handleMotionClick = (motion: { name: string; prompt: string }) => {
    setError(null);
    setSelectedMotion(motion);
    if (userPrompt) {
        setEnhancedPrompt(`"${userPrompt}". ${motion.prompt}`);
    } else {
        setEnhancedPrompt(motion.prompt);
    }
  };
  
  const handleUserPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setError(null);
      const newPrompt = e.target.value;
      setUserPrompt(newPrompt);
      if (selectedMotion) {
          if (newPrompt) {
            setEnhancedPrompt(`"${newPrompt}". ${selectedMotion.prompt}`);
          } else {
            setEnhancedPrompt(selectedMotion.prompt);
          }
      } else if (!newPrompt) {
        setEnhancedPrompt('1. Describe a scene. 2. Select a motion. 3. Click Enhance for extra AI detail!');
      }
  };
  
  const handleEnhance = async () => {
      if (!userPrompt || !selectedMotion) return;

      setIsEnhancing(true);
      setError(null);
      
      const currentPrompt = `"${userPrompt}". ${selectedMotion.prompt}`;
      // Set the combined prompt first for context, before it gets enhanced
      setEnhancedPrompt(currentPrompt); 

      try {
          const result = await enhanceVideoPrompt(currentPrompt);
          setEnhancedPrompt(result);
      } catch (err) {
          setError(err instanceof Error ? err.message : "An unknown error occurred during enhancement.");
      } finally {
          setIsEnhancing(false);
      }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-base-200 p-6 rounded-xl shadow-lg space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-content-100 flex items-center">
            <span className="text-2xl mr-2">🎥</span> Camera Motion Prompt Generator
        </h2>
        <p className="text-content-200">
            Craft the perfect AI video prompt. Describe your scene, select a motion, then enhance it with AI for extra detail.
        </p>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div>
        <label htmlFor="user-prompt" className="block text-lg font-semibold text-content-100 mb-2">1. Describe Your Scene</label>
        <textarea
            id="user-prompt"
            value={userPrompt}
            onChange={handleUserPromptChange}
            className="w-full h-24 p-3 bg-base-300 border-2 border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 text-content-100 resize-none"
            placeholder="e.g., A majestic dragon flying over a medieval castle"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-content-100 mb-3">2. Select a Camera Motion</h3>
        <div className="flex flex-wrap gap-3">
          {CAMERA_MOTIONS.map((motion) => (
            <button
              key={motion.name}
              onClick={() => handleMotionClick(motion)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-200 focus:ring-brand-primary ${
                selectedMotion?.name === motion.name ? 'bg-brand-primary text-white shadow' : 'bg-base-300 hover:bg-brand-primary/80 text-content-100'
              }`}
            >
              {motion.name}
            </button>
          ))}
        </div>
      </div>
      
      <button 
        onClick={handleEnhance}
        disabled={!userPrompt || !selectedMotion || isEnhancing}
        className="w-full flex items-center justify-center text-lg font-bold py-3 px-6 rounded-lg bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
      >
        {isEnhancing ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding Detail...
            </>
        ) : (
            "✨ Enhance with AI Detail"
        )}
      </button>

      <div>
        <h3 className="text-lg font-semibold text-content-100 mb-2">Generated Prompt</h3>
        <div className="relative">
          <textarea
            readOnly
            value={enhancedPrompt}
            className="w-full h-32 p-3 bg-base-300 border-2 border-base-300 rounded-lg text-content-100 resize-none focus:outline-none"
            aria-label="Generated camera motion prompt"
          />
          {isEnhancing && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-200/50 backdrop-blur-sm z-10">
                <div className="w-12 h-12 border-4 border-t-transparent border-brand-primary rounded-full animate-spin"></div>
                <p className="mt-3 text-md font-semibold text-content-100">Enhancing...</p>
            </div>
          )}
          <button 
            onClick={handleCopy}
            className="absolute top-3 right-3 flex items-center text-sm font-medium bg-base-100 text-content-200 py-1 px-3 rounded-md hover:bg-brand-primary hover:text-white transition-colors"
            aria-label="Copy prompt to clipboard"
          >
            {copySuccess ? copySuccess : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
import React from 'react';

const Tip: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <li className="flex items-start space-x-4">
        <div className="flex-shrink-0 text-2xl">{icon}</div>
        <div>
            <h4 className="font-semibold text-content-100">{title}</h4>
            <p className="text-sm text-content-200">{children}</p>
        </div>
    </li>
);

export const TipsPanel: React.FC = () => {
  return (
    <div className="bg-base-200 p-6 rounded-xl shadow-lg h-full">
      <h3 className="text-2xl font-bold mb-4 text-content-100 flex items-center">
        <span className="text-2xl mr-2">💡</span> Best Practices
      </h3>
      <ul className="space-y-5">
        <Tip icon="🖼️" title="Start with Quality">
            For best results, upload a clear, well-lit image. The AI works best when it has good details to enhance.
        </Tip>
        <Tip icon="✍️" title="Be Descriptive">
            Modify the prompt to guide the AI. Try phrases like "enhance the facial details", "make the colors more vibrant", or "add a cinematic feel".
        </Tip>
        <Tip icon="🔍" title="Powerful Upscaling">
            Use the "Upscale 2x" option to dramatically increase your image's dimensions. The AI will intelligently add new details for a crisp, high-resolution result.
        </Tip>
        <Tip icon="🧪" title="Experiment & Iterate">
            Don't be afraid to try the same image with different prompts. Small changes in wording can lead to unique and interesting results.
        </Tip>
        <Tip icon="✨" title="Subtle is often Better">
            The default prompt aims for subtle, realistic enhancement. Overly aggressive prompts might introduce artifacts.
        </Tip>
         <Tip icon="patience" title="Patience is Key">
            The enhancement process can take a moment, especially for larger images. The high-quality result is worth the wait!
        </Tip>
      </ul>
    </div>
  );
};
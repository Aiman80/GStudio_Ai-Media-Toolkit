import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="w-full max-w-7xl text-center relative">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
                AI Media Toolkit
            </h1>
            <p className="mt-2 text-lg text-content-200">
                Enhance images and generate video prompts with the power of AI.
            </p>
        </header>
    );
};
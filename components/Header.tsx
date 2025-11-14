import React from 'react';

const SafetyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a12.02 12.02 0 009 3c4.524 0 8.36-2.544 10.038-6.326a11.955 11.955 0 01-1.42-8.618z" />
    </svg>
);

export const Header: React.FC = () => {
    return (
        <header className="bg-emerald-900/50 backdrop-blur-sm shadow-lg w-full sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4 flex items-center justify-center">
                <SafetyIcon />
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white text-center">
                    Gerador de Imagens de Segurança do Trabalho
                </h1>
            </div>
        </header>
    );
};
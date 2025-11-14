import React from 'react';

interface ImageDisplayProps {
    image: string | null;
    isLoading: boolean;
    error: string | null;
}

const LoadingState: React.FC = () => (
    <div className="w-full aspect-square bg-emerald-900/50 rounded-xl flex flex-col items-center justify-center animate-pulse">
        <div className="w-20 h-20 border-4 border-dashed border-emerald-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-semibold">Gerando sua obra de arte...</p>
        <p className="text-slate-500 text-sm mt-1">Isso pode levar alguns segundos.</p>
    </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
    <div className="w-full aspect-square bg-red-900/20 border-2 border-red-500 rounded-xl flex flex-col items-center justify-center p-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-400 font-bold text-lg text-center">Ocorreu um Erro</p>
        <p className="text-red-300 text-center mt-2 text-sm">{message}</p>
    </div>
);

const DefaultState: React.FC = () => (
    <div className="w-full aspect-square bg-emerald-900/50 border-2 border-dashed border-emerald-800 rounded-xl flex flex-col items-center justify-center p-4 text-center">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-emerald-800 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        <p className="text-slate-400 font-semibold">Sua imagem aparecerá aqui</p>
        <p className="text-slate-500 text-sm mt-1">Insira um tema e clique em "Gerar Material" para começar.</p>
    </div>
);

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ image, isLoading, error }) => {
    return (
        <div className="w-full max-w-xl mx-auto">
            {isLoading ? (
                <LoadingState />
            ) : error ? (
                <ErrorState message={error} />
            ) : image ? (
                 <div className="w-full aspect-square bg-black rounded-xl overflow-hidden shadow-lg border-4 border-emerald-500/50">
                    <img src={image} alt="Imagem gerada pela IA sobre segurança do trabalho" className="w-full h-full object-contain" />
                </div>
            ) : (
                <DefaultState />
            )}
        </div>
    );
};
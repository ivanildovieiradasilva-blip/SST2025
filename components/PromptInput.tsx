import React from 'react';

interface PromptInputProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
}

const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const ExamplePrompts: React.FC<{ setPrompt: (prompt: string) => void; isLoading: boolean }> = ({ setPrompt, isLoading }) => {
    const examples = [
        "Trabalhador usando capacete e cinto de segurança em uma viga.",
        "Cientista em laboratório usando óculos de proteção e jaleco.",
        "Eletricista com luvas isolantes consertando fiação elétrica.",
    ];

    return (
        <div className="mt-4 text-sm text-slate-400">
            <p className="font-semibold mb-2">Sugestões de prompt:</p>
            <div className="flex flex-wrap gap-2">
                {examples.map((ex, index) => (
                    <button
                        key={index}
                        onClick={() => setPrompt(ex)}
                        className="bg-emerald-800 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:opacity-50 px-3 py-1 rounded-full text-xs transition-colors"
                        disabled={isLoading}
                    >
                        {ex}
                    </button>
                ))}
            </div>
        </div>
    );
};


export const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onGenerate, isLoading }) => {
    return (
        <div className="bg-emerald-900 p-6 rounded-xl shadow-2xl mb-8">
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Um bombeiro usando equipamento de respiração completo em um prédio em chamas."
                className="w-full h-28 p-4 bg-emerald-950 border-2 border-emerald-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-slate-100 placeholder-slate-500 resize-none"
                disabled={isLoading}
            />
            <ExamplePrompts setPrompt={setPrompt} isLoading={isLoading} />
            <button
                onClick={onGenerate}
                disabled={isLoading || !prompt.trim()}
                className="mt-6 w-full flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:scale-100 shadow-lg"
            >
                {isLoading ? (
                    <>
                        <LoadingSpinner />
                        Gerando Material...
                    </>
                ) : (
                    'Gerar Material'
                )}
            </button>
        </div>
    );
};
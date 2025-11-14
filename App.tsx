import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { PromptInput } from './components/PromptInput';
import { ImageDisplay } from './components/ImageDisplay';
import { DDSDisplay } from './components/DDSDisplay';
import { Footer } from './components/Footer';
import { generateContent, DDSContent } from './services/geminiService';

const App: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [ddsContent, setDdsContent] = useState<DDSContent | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateContent = useCallback(async () => {
        if (!prompt.trim()) {
            setError("Por favor, insira um prompt.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        setDdsContent(null);

        try {
            const { imageUrl, ddsContent } = await generateContent(prompt);
            setGeneratedImage(imageUrl);
            setDdsContent(ddsContent);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(`Falha ao gerar o conteúdo. Tente novamente. Detalhes: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, [prompt]);

    return (
        <div className="min-h-screen bg-emerald-950 text-slate-100 flex flex-col font-sans">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
                <div className="w-full max-w-3xl">
                    <p className="text-center text-lg text-slate-300 mb-8">
                        Descreva uma cena ou tema de segurança do trabalho para gerar uma imagem ilustrativa e um roteiro para DDS (Diálogo Diário de Segurança).
                    </p>
                    <PromptInput
                        prompt={prompt}
                        setPrompt={setPrompt}
                        onGenerate={handleGenerateContent}
                        isLoading={isLoading}
                    />
                    <div className="mt-8 space-y-12">
                        <ImageDisplay
                            image={generatedImage}
                            isLoading={isLoading}
                            error={error}
                        />
                        <DDSDisplay
                            content={ddsContent}
                            image={generatedImage}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default App;
import React, { useState } from 'react';
import type { DDSContent } from '../services/geminiService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DDSDisplayProps {
    content: DDSContent | null;
    image: string | null;
    isLoading: boolean;
}

// Added 'pdf-block' class for the new PDF generation logic
const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-emerald-900 p-6 rounded-xl shadow-lg pdf-section pdf-block">
        <div className="flex items-center mb-4">
            <div className="mr-3 text-emerald-400 pdf-text-accent">{icon}</div>
            <h3 className="text-xl font-bold text-slate-100 pdf-text-primary">{title}</h3>
        </div>
        <div className="text-slate-300 space-y-3 pdf-text-secondary">{children}</div>
    </div>
);

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
    <ul className="list-disc list-inside space-y-2">
        {items.map((item, index) => <li key={index}>{item}</li>)}
    </ul>
);

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-emerald-800 rounded-md w-3/4"></div>
        <div className="space-y-3">
            <div className="h-4 bg-emerald-800 rounded-md"></div>
            <div className="h-4 bg-emerald-800 rounded-md w-5/6"></div>
        </div>
        <div className="h-24 bg-emerald-800 rounded-md"></div>
        <div className="h-24 bg-emerald-800 rounded-md"></div>
    </div>
);

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const SavingSpinner: React.FC = () => (
     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


export const DDSDisplay: React.FC<DDSDisplayProps> = ({ content, image, isLoading }) => {
    const [isSaving, setIsSaving] = useState(false);

    const getTitleSizeClass = (title: string): string => {
        const length = title.length;
        if (length > 45) { // For very long titles (46-60 chars)
            return 'text-xl';
        }
        if (length > 30) { // For medium titles (31-45 chars)
            return 'text-2xl';
        }
        return 'text-3xl'; // For short titles (<= 30 chars)
    };

    const handleSaveAsPDF = async () => {
        const elementToCapture = document.getElementById('dds-content-to-print');
        if (!elementToCapture || !content) return;
    
        setIsSaving(true);
        elementToCapture.classList.add('pdf-export-mode');
    
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const margin = 10;
            const contentWidth = pdfWidth - margin * 2;
            let currentY = margin;

            // Natively render the header using jsPDF's text functions for reliability
            const headerBlock = elementToCapture.querySelector('header.pdf-block');
            if (headerBlock instanceof HTMLElement) {
                const subtitle = headerBlock.querySelector('.pdf-header-subtitle')?.textContent || '';
                const title = headerBlock.querySelector('.pdf-header-title')?.textContent || '';

                // Render Subtitle
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(10);
                pdf.setTextColor('#059669'); // Corresponds to .pdf-header-subtitle color
                pdf.text(subtitle, pdfWidth / 2, currentY, { align: 'center' });
                currentY += 6;

                // Render Title
                const titleSizeClass = getTitleSizeClass(title);
                let titleFontSize = 24;
                if (titleSizeClass === 'text-2xl') titleFontSize = 20;
                if (titleSizeClass === 'text-xl') titleFontSize = 18;

                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(titleFontSize);
                pdf.setTextColor('#1f2937'); // Corresponds to .pdf-header-title color
                
                const titleLines = pdf.splitTextToSize(title, contentWidth);
                pdf.text(titleLines, pdfWidth / 2, currentY, { align: 'center' });
                
                const titleHeight = pdf.getTextDimensions(titleLines).h;
                currentY += titleHeight + 8; // Add space after title
            }

            // Render all other blocks (image, sections) using html2canvas
            const blocks = elementToCapture.querySelectorAll('.pdf-block:not(header)');
    
            for (const block of Array.from(blocks)) {
                if (!(block instanceof HTMLElement)) continue;
    
                const isImageBlock = block.id === 'pdf-image-block';
                // Reverted image size back to its previous state
                const blockContentWidth = isImageBlock ? contentWidth * 0.8 : contentWidth; 
                const blockMargin = isImageBlock ? (pdfWidth - blockContentWidth) / 2 : margin;

                const canvas = await html2canvas(block, { scale: 2, useCORS: true, backgroundColor: null });
                
                const totalImgHeightMM = (canvas.height * blockContentWidth) / canvas.width;
                
                const pageContentHeight = pdfHeight - margin * 2;
                if (currentY > margin && (currentY + totalImgHeightMM > pdfHeight - margin) && totalImgHeightMM <= pageContentHeight) {
                    pdf.addPage();
                    currentY = margin;
                }
    
                let canvasSourceY = 0;
                while (canvasSourceY < canvas.height) {
                    const remainingPageHeightMM = pdfHeight - currentY - margin;
                    
                    if (remainingPageHeightMM < 1) {
                         pdf.addPage();
                         currentY = margin;
                         continue;
                    }
                    
                    const remainingPageHeightPx = (remainingPageHeightMM * canvas.width) / blockContentWidth;
                    const sliceHeightPx = Math.min(canvas.height - canvasSourceY, remainingPageHeightPx);
                    
                    const sliceCanvas = document.createElement('canvas');
                    sliceCanvas.width = canvas.width;
                    sliceCanvas.height = sliceHeightPx;
                    const context = sliceCanvas.getContext('2d');
                    if (!context) continue;
                    
                    context.drawImage(canvas, 0, canvasSourceY, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);
    
                    const sliceImgData = sliceCanvas.toDataURL('image/png');
                    const sliceImgHeightMM = (sliceCanvas.height * blockContentWidth) / sliceCanvas.width;
    
                    pdf.addImage(sliceImgData, 'PNG', blockMargin, currentY, blockContentWidth, sliceImgHeightMM);
                    
                    canvasSourceY += sliceHeightPx;
                    currentY += sliceImgHeightMM;
                }
                
                currentY += 5; 
            }
    
            const safeFileName = content.titulo.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'DDS_Seguranca';
            pdf.save(`${safeFileName}.pdf`);
    
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            alert("Ocorreu um erro ao gerar o PDF. Tente novamente.");
        } finally {
            setIsSaving(false);
            elementToCapture.classList.remove('pdf-export-mode');
        }
    };
    
    if (isLoading) {
        return (
            <div className="w-full bg-emerald-900/50 p-6 rounded-xl shadow-2xl">
                <LoadingSkeleton />
            </div>
        );
    }
    
    if (!content) {
        return null;
    }

    return (
        <div className="w-full">
            <div id="dds-content-to-print" className="p-4 sm:p-8 bg-emerald-950">
                 {image && (
                    <div id="pdf-image-block" className="mb-8 w-full aspect-square bg-black rounded-xl overflow-hidden shadow-lg border-2 border-emerald-700 pdf-block">
                        <img src={image} alt={`Imagem sobre ${content.titulo}`} className="w-full h-full object-contain" crossOrigin="anonymous"/>
                    </div>
                )}
                <div className="w-full space-y-8">
                    {/* Added 'pdf-block' class */}
                    <header className="text-center pdf-block">
                        <span className="text-sm font-semibold text-emerald-400 tracking-widest uppercase pdf-header-subtitle">Diálogo Diário de Segurança</span>
                        <h2 className={`${getTitleSizeClass(content.titulo)} font-extrabold text-white mt-2 pdf-header-title`}>{content.titulo}</h2>
                    </header>

                    <Section title="Introdução" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                        <p>{content.introducao}</p>
                    </Section>

                    <Section title="Caso Real para Reflexão" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                        <p className="italic">"{content.caso_real}"</p>
                    </Section>
                    
                    <Section title="Pontos-Chave" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}>
                        <BulletList items={content.pontos_chave} />
                    </Section>

                    <Section title="Como Prevenir?" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                        <BulletList items={content.como_prevenir} />
                    </Section>

                    <Section title="Perguntas para a Equipe" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                        <BulletList items={content.perguntas_reflexao} />
                    </Section>
                    
                    {/* Added 'pdf-block' class */}
                    <div className="text-center bg-emerald-900 p-6 rounded-xl shadow-lg border-t-4 border-emerald-500 pdf-final-message-box pdf-block">
                        <p className="text-lg font-semibold text-slate-200 pdf-text-primary">{content.mensagem_final}</p>
                        <p className="text-sm text-slate-400 mt-4 pdf-text-secondary">Norma Relacionada: <span className="font-bold">{content.nr_relacionada}</span></p>
                    </div>
                </div>
            </div>

            <button
                onClick={handleSaveAsPDF}
                disabled={isSaving}
                className="fixed bottom-8 right-8 z-50 flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-5 rounded-full transition-all duration-300 ease-in-out transform hover:scale-110 shadow-xl"
                aria-label="Salvar como PDF"
            >
                {isSaving ? (
                    <>
                        <SavingSpinner />
                        Salvando...
                    </>
                ) : (
                    <>
                        <DownloadIcon />
                        Salvar como PDF
                    </>
                )}
            </button>
        </div>
    );
};

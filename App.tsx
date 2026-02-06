
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Flashcard from './components/Flashcard';
import QuizMode from './components/QuizMode';
import StudyMode from './components/StudyMode';
import { AppStatus, GenerationResult } from './types';
import { generateFlashcardsFromDocument, fileToBase64 } from './services/geminiService';
import { jsPDF } from 'jspdf';

const THEMES: Record<string, { primary: string; primaryHover: string; secondary: string; shadow: string }> = {
  Indigo: { primary: "79 70 229", primaryHover: "67 56 202", secondary: "238 242 255", shadow: "199 210 254" },
  Emerald: { primary: "16 185 129", primaryHover: "5 150 105", secondary: "236 253 245", shadow: "167 243 208" },
  Rose: { primary: "225 29 72", primaryHover: "190 18 60", secondary: "255 241 242", shadow: "254 205 211" },
  Amber: { primary: "245 158 11", primaryHover: "217 119 6", secondary: "255 251 235", shadow: "253 230 138" },
  Midnight: { primary: "30 41 59", primaryHover: "15 23 42", secondary: "241 245 249", shadow: "203 213 225" },
};

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cardCount, setCardCount] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const [themeName, setThemeName] = useState('Indigo');

  useEffect(() => {
    const theme = THEMES[themeName];
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-primary-hover', theme.primaryHover);
    root.style.setProperty('--theme-secondary', theme.secondary);
    root.style.setProperty('--theme-shadow', theme.shadow);
  }, [themeName]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus(AppStatus.UPLOADING);
    setError(null);

    try {
      const base64 = await fileToBase64(file);
      setStatus(AppStatus.GENERATING);
      
      const generationData = await generateFlashcardsFromDocument(base64, file.type, cardCount);
      setResult(generationData);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to process document. Please try again with a smaller file or PDF.');
      setStatus(AppStatus.ERROR);
    }
  };

  const handleExportPDF = () => {
    if (!result) return;
    setIsExporting(true);

    try {
      const doc = new jsPDF();
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      let cursorY = 20;

      const themeColors = THEMES[themeName].primary.split(' ').map(Number);

      const addWrappedText = (text: string, fontSize: number, isBold: boolean = false) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        if (cursorY + lines.length * (fontSize * 0.5) > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          cursorY = margin;
        }
        doc.text(lines, margin, cursorY);
        cursorY += lines.length * (fontSize * 0.5) + 5;
      };

      doc.setTextColor(themeColors[0], themeColors[1], themeColors[2]);
      addWrappedText('LuminaCard Study Guide', 22, true);
      doc.setTextColor(100, 116, 139);
      addWrappedText(`Generated on ${new Date().toLocaleDateString()}`, 10);
      cursorY += 5;

      doc.setTextColor(30, 41, 59);
      addWrappedText('Executive Summary', 16, true);
      doc.setTextColor(71, 85, 105);
      addWrappedText(result.summary, 11);
      cursorY += 5;

      doc.setTextColor(30, 41, 59);
      addWrappedText('Key Takeaways', 16, true);
      result.keyTakeaways.forEach((point, index) => {
        doc.setTextColor(71, 85, 105);
        addWrappedText(`${index + 1}. ${point}`, 11);
      });
      cursorY += 10;

      doc.setTextColor(30, 41, 59);
      addWrappedText('Flashcards', 16, true);
      
      result.flashcards.forEach((card, index) => {
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, cursorY - 2, pageWidth - margin, cursorY - 2);
        cursorY += 5;
        doc.setTextColor(themeColors[0], themeColors[1], themeColors[2]);
        addWrappedText(`Q${index + 1}: ${card.question}`, 11, true);
        doc.setTextColor(30, 41, 59);
        addWrappedText(`A: ${card.answer}`, 11);
        cursorY += 5;
      });

      doc.save(`LuminaCard-${themeName}-Guide.pdf`);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('Could not generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const reset = () => {
    setStatus(AppStatus.IDLE);
    setResult(null);
    setError(null);
  };

  const startQuiz = () => {
    if (result) setStatus(AppStatus.QUIZ);
  };

  const startStudy = () => {
    if (result) setStatus(AppStatus.STUDY);
  };

  const exitMode = () => {
    setStatus(AppStatus.SUCCESS);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header 
        currentTheme={themeName} 
        onThemeChange={setThemeName} 
        onPlayDeck={startQuiz}
        hasResult={!!result}
      />

      {status === AppStatus.QUIZ && result && (
        <QuizMode flashcards={result.flashcards} onExit={exitMode} />
      )}

      {status === AppStatus.STUDY && result && (
        <StudyMode flashcards={result.flashcards} onExit={exitMode} />
      )}

      <main className="flex-grow container mx-auto max-w-7xl px-4 py-8 md:py-12">
        {(status === AppStatus.IDLE || status === AppStatus.ERROR) ? (
          <div className="max-w-2xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                Master any subject with <span className="text-theme-primary transition-colors duration-300">AI-generated</span> flashcards
              </h1>
              <p className="text-lg text-slate-600 max-w-xl mx-auto">
                Upload your study guides, lecture notes, or textbooks and get personalized flashcards and a comprehensive study summary in seconds.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-slate-200 shadow-xl shadow-slate-200/50 hover:border-theme-primary transition-colors group relative">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                onChange={handleFileUpload}
                accept=".pdf,.docx,.txt,.jpg,.png"
              />
              <div className="space-y-4">
                <div className="w-16 h-16 bg-theme-secondary text-theme-primary rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-800">Drop your file here or click to browse</p>
                  <p className="text-sm text-slate-500 mt-1">Supports PDF, DOCX, TXT, and Images</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
               <label className="text-sm font-medium text-slate-700">Cards to generate:</label>
               <select 
                 value={cardCount} 
                 onChange={(e) => setCardCount(Number(e.target.value))}
                 className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-theme-primary outline-none transition-all duration-300"
               >
                 <option value={5}>5 Cards</option>
                 <option value={10}>10 Cards</option>
                 <option value={15}>15 Cards</option>
                 <option value={20}>20 Cards</option>
               </select>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
          </div>
        ) : (status === AppStatus.UPLOADING || status === AppStatus.GENERATING) ? (
          <div className="max-w-md mx-auto py-20 text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-theme-primary rounded-full border-t-transparent animate-spin transition-colors duration-300"></div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">
                {status === AppStatus.UPLOADING ? 'Uploading document...' : 'AI is reading your document...'}
              </h2>
              <p className="text-slate-500 animate-pulse">
                Building your custom study guide and flashcards.
              </p>
            </div>
          </div>
        ) : (status === AppStatus.SUCCESS) && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
              <div className="space-y-1">
                <button 
                  onClick={reset}
                  className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-theme-primary transition-colors mb-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Analyze another document
                </button>
                <h2 className="text-3xl font-extrabold text-slate-900">Your Learning Dashboard</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isExporting ? (
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent animate-spin rounded-full"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  )}
                  {isExporting ? 'Exporting...' : 'Export PDF'}
                </button>
                <button 
                  onClick={startStudy}
                  className="px-5 py-2.5 bg-white border border-theme-primary text-theme-primary rounded-xl font-semibold shadow-sm hover:bg-theme-secondary transition-all flex items-center gap-2"
                >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Study Mode
                </button>
                <button 
                  onClick={startQuiz}
                  className="px-5 py-2.5 bg-theme-primary text-white rounded-xl font-semibold shadow-theme bg-theme-primary-hover transition-all flex items-center gap-2"
                >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Quiz
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Study Summary
                  </h3>
                  <div className="prose prose-slate prose-sm">
                    <p className="text-slate-600 leading-relaxed">
                      {result?.summary}
                    </p>
                  </div>
                </div>

                <div className="bg-theme-secondary rounded-2xl border border-theme-primary/10 p-6 shadow-sm transition-colors duration-300">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Key Takeaways
                  </h3>
                  <ul className="space-y-3">
                    {result?.keyTakeaways.map((point, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-700 font-medium">
                        <span className="w-5 h-5 rounded-full bg-theme-primary/10 text-theme-primary flex items-center justify-center text-[10px] shrink-0 mt-0.5">{i+1}</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>

              <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800">
                    Flashcards <span className="text-slate-400 font-normal ml-1">({result?.flashcards.length})</span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result?.flashcards.map((card) => (
                    <Flashcard key={card.id} card={card} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-8 border-t border-slate-200 bg-white mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© 2024 LuminaCard. Study smarter, not harder.</p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-theme-primary text-sm">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-theme-primary text-sm">Terms</a>
            <a href="#" className="text-slate-400 hover:text-theme-primary text-sm">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

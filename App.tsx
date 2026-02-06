
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Flashcard from './components/Flashcard';
import { AppStatus, Flashcard as FlashcardType, GenerationResult } from './types';
import { generateFlashcardsFromDocument, fileToBase64 } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cardCount, setCardCount] = useState(10);

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

  const reset = () => {
    setStatus(AppStatus.IDLE);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-grow container mx-auto max-w-7xl px-4 py-8 md:py-12">
        {status === AppStatus.IDLE || status === AppStatus.ERROR ? (
          <div className="max-w-2xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                Master any subject with <span className="text-indigo-600">AI-generated</span> flashcards
              </h1>
              <p className="text-lg text-slate-600 max-w-xl mx-auto">
                Upload your study guides, lecture notes, or textbooks and get personalized flashcards and a comprehensive study summary in seconds.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-slate-200 shadow-xl shadow-slate-200/50 hover:border-indigo-400 transition-colors group relative">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                onChange={handleFileUpload}
                accept=".pdf,.docx,.txt,.jpg,.png"
              />
              <div className="space-y-4">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
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
                 className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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
        ) : status === AppStatus.UPLOADING || status === AppStatus.GENERATING ? (
          <div className="max-w-md mx-auto py-20 text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
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
        ) : (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Success Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
              <div className="space-y-1">
                <button 
                  onClick={reset}
                  className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Analyze another document
                </button>
                <h2 className="text-3xl font-extrabold text-slate-900">Your Learning Dashboard</h2>
              </div>
              <div className="flex gap-3">
                <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export PDF
                </button>
                <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Play Deck
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left Column: Summarized Overview */}
              <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Study Summary
                  </h3>
                  <div className="prose prose-slate prose-sm">
                    <p className="text-slate-600 leading-relaxed leading-7">
                      {result?.summary}
                    </p>
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Key Takeaways
                  </h3>
                  <ul className="space-y-3">
                    {result?.keyTakeaways.map((point, i) => (
                      <li key={i} className="flex gap-3 text-sm text-indigo-800 font-medium">
                        <span className="w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-[10px] shrink-0 mt-0.5">{i+1}</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>

              {/* Right Column: Flashcards */}
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
            <a href="#" className="text-slate-400 hover:text-indigo-600 text-sm">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 text-sm">Terms</a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 text-sm">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

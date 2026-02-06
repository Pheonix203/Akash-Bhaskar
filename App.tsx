
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

    // Supported formats check
    const supportedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    
    // Note: While Word/PPT are complex, Gemini's document processing helps. 
    // Best results usually come from PDFs or raw text for most LLMs.
    
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

      <main className="flex-grow container mx-auto max-w-6xl px-4 py-8 md:py-12">
        {status === AppStatus.IDLE || status === AppStatus.ERROR ? (
          <div className="max-w-2xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                Master any subject with <span className="text-indigo-600">AI-generated</span> flashcards
              </h1>
              <p className="text-lg text-slate-600 max-w-xl mx-auto">
                Upload your study guides, lecture notes, or textbooks and get personalized flashcards in seconds.
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
                Thinking hard to extract the best knowledge nuggets for you.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-1 bg-indigo-200 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 animate-[loading_1.5s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.2}s` }}></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <button 
                  onClick={reset}
                  className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-4"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Upload another document
                </button>
                <h2 className="text-3xl font-extrabold text-slate-900">Your Flashcards</h2>
                <p className="text-slate-600 italic">"{result?.summary}"</p>
              </div>
              <div className="flex gap-2">
                <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Study Session
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {result?.flashcards.map((card) => (
                <Flashcard key={card.id} card={card} />
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="py-8 border-t border-slate-200 bg-white mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© 2024 LuminaCard. Powered by Gemini AI.</p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-indigo-600 text-sm">Privacy Policy</a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 text-sm">Terms of Service</a>
            <a href="#" className="text-slate-400 hover:text-indigo-600 text-sm">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

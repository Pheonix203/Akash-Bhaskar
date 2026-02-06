
import React, { useState, useEffect } from 'react';
import { Flashcard as FlashcardType, AdditionalInfo } from '../types';
import Flashcard from './Flashcard';
import { getMoreTopicInfo } from '../services/geminiService';

interface StudyModeProps {
  flashcards: FlashcardType[];
  onExit: () => void;
}

const StudyMode: React.FC<StudyModeProps> = ({ flashcards, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [extraInfo, setExtraInfo] = useState<AdditionalInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  // Reset extra info when switching cards
  useEffect(() => {
    setExtraInfo(null);
    setShowPanel(false);
    setIsLoadingInfo(false);
  }, [currentIndex]);

  const handleLearnMore = async () => {
    if (extraInfo) {
      setShowPanel(!showPanel);
      return;
    }

    setIsLoadingInfo(true);
    setShowPanel(true);
    try {
      const info = await getMoreTopicInfo(currentCard.question);
      setExtraInfo(info);
    } catch (error) {
      console.error("Failed to fetch more info", error);
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-50 flex flex-col overflow-hidden">
      {/* Study Header */}
      <div className="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-10">
        <button 
          onClick={onExit}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors flex items-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Exit Study
        </button>
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-theme-primary uppercase tracking-widest">Study Mode</span>
          <span className="text-sm font-bold text-slate-700">{currentIndex + 1} / {flashcards.length}</span>
        </div>
        <div className="w-24"></div> 
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-slate-100 z-10">
        <div 
          className="h-full bg-theme-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row h-full overflow-hidden">
        {/* Main Content Area */}
        <main className={`flex-grow flex flex-col items-center justify-center p-6 transition-all duration-500 ${showPanel ? 'lg:w-1/2' : 'w-full'}`}>
          <div className="w-full max-w-2xl mb-8 animate-in fade-in slide-in-from-bottom-4 duration-300" key={currentIndex}>
            <Flashcard card={currentCard} />
          </div>

          <div className="w-full max-w-2xl flex flex-col gap-4">
            <button 
              onClick={handleLearnMore}
              disabled={isLoadingInfo}
              className={`w-full py-4 flex items-center justify-center gap-3 rounded-2xl border-2 transition-all font-bold ${
                showPanel 
                  ? 'bg-slate-800 text-white border-slate-800' 
                  : 'bg-white text-theme-primary border-theme-primary/20 hover:border-theme-primary hover:bg-theme-secondary'
              }`}
            >
              {isLoadingInfo ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {showPanel ? 'Hide Research' : 'Explain More & Sources'}
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={prevCard}
                disabled={currentIndex === 0}
                className="flex items-center justify-center gap-3 p-5 rounded-2xl border-2 border-slate-200 hover:border-theme-primary hover:bg-theme-secondary text-slate-700 hover:text-theme-primary transition-all disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:bg-transparent disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-bold">Previous</span>
              </button>

              <button 
                onClick={nextCard}
                disabled={currentIndex === flashcards.length - 1}
                className="flex items-center justify-center gap-3 p-5 rounded-2xl border-2 border-slate-200 hover:border-theme-primary hover:bg-theme-secondary text-slate-700 hover:text-theme-primary transition-all disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:bg-transparent disabled:cursor-not-allowed"
              >
                <span className="font-bold">Next</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="py-8 text-center text-slate-400 text-sm">
            <div className="flex items-center justify-center gap-4 text-xs">
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">←</kbd> Back</span>
              <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">→</kbd> Next</span>
            </div>
          </div>
        </main>

        {/* Deep Dive Panel */}
        <aside 
          className={`fixed lg:relative bottom-0 right-0 w-full lg:w-1/2 h-[70vh] lg:h-full bg-white border-t lg:border-t-0 lg:border-l border-slate-200 shadow-2xl transition-transform duration-500 ease-in-out z-20 overflow-y-auto ${
            showPanel ? 'translate-y-0 lg:translate-x-0' : 'translate-y-full lg:translate-x-full'
          }`}
        >
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="p-2 bg-theme-secondary text-theme-primary rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                Topic Research
              </h3>
              <button 
                onClick={() => setShowPanel(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {isLoadingInfo ? (
              <div className="space-y-6">
                <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-slate-100 rounded animate-pulse w-5/6"></div>
                <div className="h-32 bg-slate-50 rounded-2xl animate-pulse"></div>
              </div>
            ) : extraInfo ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="prose prose-slate">
                  <p className="text-slate-700 leading-relaxed text-lg italic border-l-4 border-theme-primary pl-4 py-1">
                    "{currentCard.question}"
                  </p>
                  <div className="mt-6 text-slate-600 leading-relaxed space-y-4">
                    {extraInfo.explanation.split('\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>

                {extraInfo.sources.length > 0 && (
                  <div className="space-y-4 pt-6 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sources & References</h4>
                    <div className="flex flex-wrap gap-3">
                      {extraInfo.sources.map((source, i) => (
                        <a 
                          key={i} 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-theme-secondary border border-slate-200 hover:border-theme-primary text-slate-600 hover:text-theme-primary rounded-xl transition-all text-sm font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          {source.title.length > 20 ? source.title.substring(0, 20) + '...' : source.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400">
                <p>Click "Explain More" to research this topic in-depth.</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StudyMode;

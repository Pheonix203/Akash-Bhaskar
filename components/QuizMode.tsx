
import React, { useState } from 'react';
import { Flashcard as FlashcardType, QuizState } from '../types';
import Flashcard from './Flashcard';

interface QuizModeProps {
  flashcards: FlashcardType[];
  onExit: () => void;
}

const QuizMode: React.FC<QuizModeProps> = ({ flashcards, onExit }) => {
  const [state, setState] = useState<QuizState>({
    currentIndex: 0,
    knownIds: new Set(),
    unknownIds: new Set(),
    isFinished: false,
  });

  const currentCard = flashcards[state.currentIndex];
  const progress = ((state.currentIndex + 1) / flashcards.length) * 100;

  const handleScore = (known: boolean) => {
    const cardId = currentCard.id;
    setState(prev => {
      const nextKnown = new Set(prev.knownIds);
      const nextUnknown = new Set(prev.unknownIds);

      if (known) {
        nextKnown.add(cardId);
        nextUnknown.delete(cardId);
      } else {
        nextUnknown.add(cardId);
        nextKnown.delete(cardId);
      }

      if (prev.currentIndex === flashcards.length - 1) {
        return { ...prev, knownIds: nextKnown, unknownIds: nextUnknown, isFinished: true };
      }

      return {
        ...prev,
        currentIndex: prev.currentIndex + 1,
        knownIds: nextKnown,
        unknownIds: nextUnknown,
      };
    });
  };

  if (state.isFinished) {
    return (
      <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Quiz Completed!</h2>
              <p className="text-slate-500">You've reviewed all {flashcards.length} cards in this deck.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <p className="text-sm font-medium text-emerald-700">Mastered</p>
                <p className="text-3xl font-bold text-emerald-800">{state.knownIds.size}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-sm font-medium text-amber-700">Needs Review</p>
                <p className="text-3xl font-bold text-amber-800">{state.unknownIds.size}</p>
              </div>
            </div>

            <button 
              onClick={onExit}
              className="w-full py-4 bg-theme-primary text-white rounded-2xl font-bold bg-theme-primary-hover shadow-lg shadow-theme transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-slate-50 flex flex-col">
      {/* Quiz Header */}
      <div className="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between">
        <button 
          onClick={onExit}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Progress</span>
          <span className="text-sm font-bold text-slate-700">{state.currentIndex + 1} / {flashcards.length}</span>
        </div>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-slate-100">
        <div 
          className="h-full bg-theme-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Quiz Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
        <div className="w-full mb-12">
          <Flashcard card={currentCard} />
        </div>

        <div className="w-full grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleScore(false)}
            className="group flex flex-col items-center gap-2 p-6 rounded-3xl border-2 border-slate-200 hover:border-amber-400 hover:bg-amber-50 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-amber-100 flex items-center justify-center text-slate-500 group-hover:text-amber-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-slate-700 group-hover:text-amber-800">Review Later</span>
          </button>

          <button 
            onClick={() => handleScore(true)}
            className="group flex flex-col items-center gap-2 p-6 rounded-3xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center text-slate-500 group-hover:text-emerald-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-bold text-slate-700 group-hover:text-emerald-800">Got It!</span>
          </button>
        </div>
      </main>

      {/* Footer Instructions */}
      <div className="py-6 text-center text-slate-400 text-sm">
        <p>Tip: Focus on the concept before flipping the card!</p>
      </div>
    </div>
  );
};

export default QuizMode;

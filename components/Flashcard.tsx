
import React, { useState } from 'react';
import { Flashcard as FlashcardType } from '../types';

interface Props {
  card: FlashcardType;
}

const Flashcard: React.FC<Props> = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className={`relative h-64 w-full perspective-1000 cursor-pointer group ${isFlipped ? 'flashcard-flipped' : ''}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="flashcard-inner relative w-full h-full text-center transition-all duration-500 shadow-lg rounded-2xl">
        {/* Front Face */}
        <div className="flashcard-front absolute w-full h-full bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center justify-center">
          {card.category && (
            <span className="absolute top-4 left-4 px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded">
              {card.category}
            </span>
          )}
          <h3 className="text-lg font-semibold text-slate-800 leading-relaxed">
            {card.question}
          </h3>
          <p className="mt-4 text-xs text-slate-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Click to reveal answer
          </p>
        </div>

        {/* Back Face */}
        <div className="flashcard-back absolute w-full h-full bg-indigo-600 rounded-2xl border border-indigo-500 p-8 flex flex-col items-center justify-center overflow-auto">
          <h3 className="text-white text-lg font-medium leading-relaxed">
            {card.answer}
          </h3>
          <p className="mt-4 text-xs text-indigo-200 font-medium">
            Click to see question
          </p>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;

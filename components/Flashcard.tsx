
import React, { useState } from 'react';
import { Flashcard as FlashcardType, FlipAnimation } from '../types';

interface Props {
  card: FlashcardType;
  animation: FlipAnimation;
}

const Flashcard: React.FC<Props> = ({ card, animation }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Define animation-specific wrapper classes
  const animClass = `anim-${animation}`;

  return (
    <div 
      className={`relative h-64 w-full perspective-1000 cursor-pointer group ${animClass} ${isFlipped ? 'flashcard-flipped' : ''}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="flashcard-inner relative w-full h-full text-center shadow-lg rounded-2xl overflow-hidden">
        {/* Front Face */}
        <div className="flashcard-front absolute w-full h-full bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center justify-center">
          {card.category && (
            <span className="absolute top-4 left-4 px-2 py-1 bg-theme-secondary text-theme-primary text-[10px] font-bold uppercase tracking-wider rounded transition-colors duration-300">
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
        <div className="flashcard-back absolute w-full h-full bg-theme-primary rounded-2xl border border-white/10 p-8 flex flex-col items-center justify-center overflow-auto transition-colors duration-500">
          <h3 className="text-white text-lg font-medium leading-relaxed">
            {card.answer}
          </h3>
          <p className="mt-4 text-xs text-white/60 font-medium">
            Click to see question
          </p>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;

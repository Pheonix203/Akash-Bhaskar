
import React from 'react';
import { FlipAnimation } from '../types';

interface HeaderProps {
  currentTheme: string;
  onThemeChange: (themeName: string) => void;
  currentAnimation: FlipAnimation;
  onAnimationChange: (animation: FlipAnimation) => void;
}

const themes: { name: string; color: string }[] = [
  { name: 'Indigo', color: 'bg-indigo-600' },
  { name: 'Emerald', color: 'bg-emerald-600' },
  { name: 'Rose', color: 'bg-rose-600' },
  { name: 'Amber', color: 'bg-amber-500' },
  { name: 'Midnight', color: 'bg-slate-800' },
];

const Header: React.FC<HeaderProps> = ({ 
  currentTheme, 
  onThemeChange, 
  currentAnimation, 
  onAnimationChange 
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-theme-primary rounded-lg flex items-center justify-center transition-colors duration-300">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
            LuminaCard
          </span>
        </div>
        
        <div className="flex items-center gap-4 md:gap-8">
          {/* Animation Selector */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-2">Animation:</span>
            {(['3d-flip', 'fade', 'slide', 'zoom'] as FlipAnimation[]).map((anim) => (
              <button
                key={anim}
                onClick={() => onAnimationChange(anim)}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                  currentAnimation === anim 
                  ? 'bg-theme-primary text-white shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                {anim.replace('3d-', '')}
              </button>
            ))}
          </div>

          {/* Theme Selector */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-full gap-1">
            {themes.map((t) => (
              <button
                key={t.name}
                onClick={() => onThemeChange(t.name)}
                title={t.name}
                className={`w-6 h-6 rounded-full ${t.color} transition-transform hover:scale-110 ${
                  currentTheme === t.name ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : ''
                }`}
              />
            ))}
          </div>
          
          <button className="px-4 py-2 bg-theme-primary text-white rounded-full text-sm font-medium bg-theme-primary-hover transition-all shadow-sm shadow-theme">
            Sign In
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

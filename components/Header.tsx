
import React from 'react';

interface HeaderProps {
  currentTheme: string;
  onThemeChange: (themeName: string) => void;
  onPlayDeck?: () => void;
  hasResult: boolean;
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
  onPlayDeck,
  hasResult
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
        
        <div className="flex items-center gap-3 md:gap-6">
          {hasResult && onPlayDeck && (
            <button 
              onClick={onPlayDeck}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-theme-primary bg-theme-secondary rounded-lg hover:bg-theme-primary hover:text-white transition-all border border-theme-primary/10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
              Play Deck
            </button>
          )}

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

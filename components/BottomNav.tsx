import React from 'react';
import { BookUser, Star, Plus } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChangeView }) => {
  const navItemClass = (view: ViewState) =>
    `flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
      currentView === view 
        ? 'text-blue-600 scale-105' 
        : 'text-gray-400 hover:text-gray-600'
    }`;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg border-t border-gray-200 pb-safe pt-2 px-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-40">
      <div className="flex justify-between items-center h-16 max-w-md mx-auto relative">
        
        <button
          onClick={() => onChangeView(ViewState.HOME)}
          className={navItemClass(ViewState.HOME)}
        >
          <BookUser size={26} strokeWidth={currentView === ViewState.HOME ? 2.5 : 2} />
          <span className="text-[10px] font-semibold mt-1">Directorio</span>
        </button>

        {/* Floating Add Button in the middle */}
        <div className="relative -top-6">
          <button
            onClick={() => onChangeView(ViewState.ADD)}
            className={`flex items-center justify-center w-14 h-14 rounded-full shadow-xl shadow-blue-500/30 transition-transform active:scale-90 ${
              currentView === ViewState.ADD 
                ? 'bg-gray-800 text-white' 
                : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
            }`}
          >
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>

        <button
          onClick={() => onChangeView(ViewState.FAVORITES)}
          className={navItemClass(ViewState.FAVORITES)}
        >
          <Star size={26} strokeWidth={currentView === ViewState.FAVORITES ? 2.5 : 2} />
          <span className="text-[10px] font-semibold mt-1">Favoritos</span>
        </button>

      </div>
    </div>
  );
};

export default BottomNav;
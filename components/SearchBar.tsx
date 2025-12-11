import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, X, MicOff } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

// Type definition for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recog = new window.webkitSpeechRecognition();
      recog.continuous = false;
      recog.lang = 'es-ES';
      recog.interimResults = false;

      recog.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onChange(transcript);
        setIsListening(false);
      };

      recog.onerror = () => {
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    }
  }, [onChange]);

  const toggleListening = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!recognition) {
      alert("Tu navegador no soporta búsqueda por voz.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleClear = () => {
    onChange('');
    setIsListening(false);
    inputRef.current?.focus();
  };

  return (
    <div className="sticky top-0 z-50 px-4 pt-4 pb-2 bg-gray-50/90 backdrop-blur-md transition-all duration-300">
      <div className="relative flex items-center w-full shadow-lg rounded-2xl bg-white overflow-hidden border border-gray-100 ring-1 ring-gray-100/50">
        
        <div className="pl-4 text-blue-500">
          <Search size={22} strokeWidth={2.5} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          className="w-full py-4 px-3 text-gray-700 font-medium text-lg leading-tight focus:outline-none placeholder-gray-400 bg-transparent"
          placeholder="Buscar servicio o nº..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        
        {value && (
          <button 
            onClick={handleClear}
            className="p-2 mr-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Borrar búsqueda"
          >
            <X size={20} />
          </button>
        )}
        
        <button
          onClick={toggleListening}
          className={`p-3 m-1 rounded-xl transition-all duration-300 ${
            isListening 
              ? 'bg-red-500 text-white shadow-md animate-pulse' 
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
        >
          {isListening ? <MicOff size={22} /> : <Mic size={22} />}
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
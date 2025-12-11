import React, { useState, useEffect, useMemo } from 'react';
import { searchContacts, parseCSV } from './utils';
import { Contact, ViewState } from './types';
import SearchBar from './components/SearchBar';
import ContactCard from './components/ContactCard';
import BottomNav from './components/BottomNav';
import AddContactForm from './components/AddContactForm';
import { 
  Info, Database, Activity, Pill, Siren, Monitor, Baby, 
  Wrench, Star, Settings, Plus, Trash2, Check, Tag as TagIcon, Download 
} from 'lucide-react';

// Interface for Quick Tags
interface QuickTag {
  id: string;
  label: string;
  term: string;
  color: string;
  iconName: string; 
}

const MAX_TAGS = 8; 

// Defined outside component to prevent re-creation issues
const DEFAULT_TAGS: QuickTag[] = [
  { id: '1', label: 'Urgencias', iconName: 'Siren', color: 'bg-red-100 text-red-600', term: 'Urgencias' },
  { id: '2', label: 'Farmacia', iconName: 'Pill', color: 'bg-green-100 text-green-600', term: 'Farmacia' },
  { id: '3', label: 'Informática', iconName: 'Monitor', color: 'bg-blue-100 text-blue-600', term: 'Informatica' },
  { id: '4', label: 'Paritorios', iconName: 'Baby', color: 'bg-pink-100 text-pink-600', term: 'Paritorio' },
  { id: '5', label: 'Laboratorio', iconName: 'Activity', color: 'bg-purple-100 text-purple-600', term: 'Laboratorio' },
  { id: '6', label: 'Mantenimiento', iconName: 'Wrench', color: 'bg-orange-100 text-orange-600', term: 'Mantenimiento' },
];

const App: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [visibleLimit, setVisibleLimit] = useState(50);
  const [showDirectory, setShowDirectory] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Quick Tags State
  const [quickTags, setQuickTags] = useState<QuickTag[]>([]);
  const [isManagingTags, setIsManagingTags] = useState(false);
  const [selectedTagsToDelete, setSelectedTagsToDelete] = useState<string[]>([]);
  
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState('');
  const [newTagTerm, setNewTagTerm] = useState('');

  // PWA Install Prompt State
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  const loadDefaultContacts = async () => {
    try {
      const response = await fetch('assets/MATERNO-2025.csv');
      if (!response.ok) throw new Error('No se pudo cargar el archivo CSV');
      const text = await response.text();
      const initial = parseCSV(text);
      setContacts(initial);
    } catch (error) {
      console.error("Error loading default CSV", error);
      // Don't alert on error, just fail silently to empty state if offline/missing
    }
  };

  useEffect(() => {
    const initData = async () => {
      // Load Contacts
      const storedContacts = localStorage.getItem('app_contacts');
      if (storedContacts) {
        try {
          const parsed = JSON.parse(storedContacts);
          setContacts(parsed);
        } catch (e) {
          console.error("Error loading contacts", e);
          await loadDefaultContacts();
        }
      } else {
        await loadDefaultContacts();
      }

      // Load Favorites
      const savedFavs = localStorage.getItem('favorites');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      // Load Tags
      const savedTags = localStorage.getItem('app_quick_tags');
      if (savedTags) {
        try {
          setQuickTags(JSON.parse(savedTags));
        } catch (e) {
          setQuickTags(DEFAULT_TAGS);
        }
      } else {
        setQuickTags(DEFAULT_TAGS);
      }

      setIsLoaded(true);
    };
    initData();

    // Listen for PWA install event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('app_contacts', JSON.stringify(contacts));
  }, [contacts, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('app_quick_tags', JSON.stringify(quickTags));
  }, [quickTags, isLoaded]);

  useEffect(() => {
    setVisibleLimit(50);
  }, [searchQuery, currentView, showDirectory]);

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const handleDelete = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    if (favorites.includes(id)) setFavorites(favorites.filter(f => f !== id));
  };

  const handleEditStart = (contact: Contact) => {
    setEditingContact(contact);
    setCurrentView(ViewState.EDIT);
  };

  const handleSaveContact = (savedContact: Contact) => {
    if (currentView === ViewState.EDIT) {
      setContacts(contacts.map(c => c.id === savedContact.id ? savedContact : c));
    } else {
      setContacts([savedContact, ...contacts]);
    }
    setEditingContact(null);
    setCurrentView(ViewState.HOME);
    setSearchQuery(savedContact.servicio);
  };

  const handleViewChange = (view: ViewState) => {
    if (view === ViewState.HOME) {
      if (currentView === ViewState.HOME) {
        if (searchQuery) {
          setSearchQuery('');
        } else if (showDirectory) {
           setShowDirectory(false);
        } else {
           setShowDirectory(true);
        }
      } else {
        setShowDirectory(true);
        setSearchQuery('');
      }
    } else {
      setShowDirectory(false);
    }
    setCurrentView(view);
  };

  const handleLoadMore = () => {
    setVisibleLimit(prev => prev + 50);
    if (!showDirectory && !searchQuery && currentView === ViewState.HOME) {
      setShowDirectory(true);
    }
  };

  const handleInstallClick = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        setInstallPrompt(null);
      }
    });
  };

  // --- Tag Management ---
  
  const toggleManagementMode = () => {
    setIsManagingTags(!isManagingTags);
    setSelectedTagsToDelete([]); // Clear selection when toggling
  };

  const handleTagClick = (tag: QuickTag) => {
    if (isManagingTags) {
      // Logic for Selection Mode
      if (selectedTagsToDelete.includes(tag.id)) {
        setSelectedTagsToDelete(prev => prev.filter(id => id !== tag.id));
      } else {
        setSelectedTagsToDelete(prev => [...prev, tag.id]);
      }
    } else {
      // Logic for Normal Mode (Search)
      setSearchQuery(tag.term);
      setShowDirectory(false);
    }
  };

  const deleteSelectedTags = () => {
    if (selectedTagsToDelete.length === 0) return;
    
    // DIRECT DELETE: Removed window.confirm to avoid Android WebView blocking issues.
    // The explicit "Delete" button action is confirmation enough.
    
    const newTags = quickTags.filter(t => !selectedTagsToDelete.includes(t.id));
    setQuickTags(newTags);
    
    // Exit management mode to show feedback that action is done
    setIsManagingTags(false);
    setSelectedTagsToDelete([]);
  };

  const handleAddTag = () => {
    if (quickTags.length >= MAX_TAGS) {
      alert(`Has alcanzado el límite máximo de ${MAX_TAGS} accesos directos.`);
      return;
    }
    if (!newTagLabel.trim() || !newTagTerm.trim()) return;
    
    const newTag: QuickTag = {
      id: Date.now().toString(),
      label: newTagLabel,
      term: newTagTerm,
      color: 'bg-gray-100 text-gray-600',
      iconName: 'Tag'
    };
    
    setQuickTags([...quickTags, newTag]);
    setNewTagLabel('');
    setNewTagTerm('');
    setShowAddTagModal(false);
  };

  const renderIcon = (name: string) => {
    switch (name) {
      case 'Siren': return <Siren size={18} />;
      case 'Pill': return <Pill size={18} />;
      case 'Monitor': return <Monitor size={18} />;
      case 'Baby': return <Baby size={18} />;
      case 'Activity': return <Activity size={18} />;
      case 'Wrench': return <Wrench size={18} />;
      default: return <TagIcon size={18} />;
    }
  };

  const filteredContacts = useMemo(() => {
    let result = contacts;
    if (currentView === ViewState.FAVORITES) {
      result = result.filter(c => favorites.includes(c.id));
    }
    return searchContacts(result, searchQuery);
  }, [contacts, searchQuery, currentView, favorites]);

  const shouldShowList = currentView === ViewState.FAVORITES || searchQuery.length > 0 || showDirectory;

  if (currentView === ViewState.ADD || currentView === ViewState.EDIT) {
    return (
      <AddContactForm 
        initialData={editingContact}
        onSave={handleSaveContact} 
        onCancel={() => {
          setEditingContact(null);
          setCurrentView(ViewState.HOME);
        }} 
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      
      {/* Main Container */}
      <div className="flex-1 flex flex-col z-10 overflow-hidden">
        
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {/* 
            Background Decoration - Moved inside the scroll view or relative container 
            but kept absolute to sit behind content.
            Sized to hug the 'Listín' card.
        */}
        <main className="flex-1 overflow-y-auto pb-24 px-4 pt-2 scroll-smooth no-scrollbar relative">
          
          {/* Blue Background Decoration */}
          <div className="absolute top-0 left-0 w-full h-[100px] bg-gradient-to-br from-blue-600 to-indigo-800 rounded-b-[20px] shadow-lg -z-10"></div>
          
          {/* Welcome / Dashboard State */}
          {!shouldShowList && currentView === ViewState.HOME && (
            <div className="animate-fadeIn">
              
              {/* Stats Card */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 py-3 px-3 rounded-2xl text-white shadow-lg relative overflow-hidden group">
                <div className="relative z-10 flex flex-col items-center text-center">
                  <h1 className="text-xl font-bold mb-0.5">Listín Telefónico</h1>
                  <p className="text-blue-100 text-xs mb-2">Hospital Materno & Insular</p>
                  
                  <div className="flex items-center justify-center gap-2">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium flex items-center backdrop-blur-md border border-white/10">
                      <Database size={12} className="mr-1.5 opacity-80" />
                      {contacts.length} contactos
                    </span>
                    
                    {/* INSTALL BUTTON: Only visible if browser supports it */}
                    {installPrompt && (
                      <button 
                        onClick={handleInstallClick}
                        className="bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-md animate-pulse hover:scale-105 transition-transform"
                      >
                        <Download size={12} className="mr-1.5" />
                        INSTALAR APP
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions Header - Increased margin top to push away from blue bg */}
              <div className="flex justify-between items-center mb-3 px-2 mt-6">
                <div className="flex items-center">
                  <h2 className="text-gray-800 font-bold text-lg">
                    {isManagingTags ? 'Selecciona para borrar' : 'Accesos Rápidos'}
                  </h2>
                </div>
                
                <button 
                  onClick={toggleManagementMode}
                  className={`px-3 py-1.5 rounded-full transition-all text-xs font-bold flex items-center gap-1 ${
                    isManagingTags 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {isManagingTags ? (
                    <>
                      <Check size={14} /> HECHO
                    </>
                  ) : (
                    <>
                      <Settings size={14} /> EDITAR
                    </>
                  )}
                </button>
              </div>
              
              {/* Quick Action Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6 transition-all">
                {quickTags.map((tag) => {
                  const isSelected = selectedTagsToDelete.includes(tag.id);
                  
                  return (
                    <div key={tag.id} className="relative group animate-fadeIn">
                      <button
                        onClick={() => handleTagClick(tag)}
                        className={`w-full p-4 rounded-2xl shadow-sm border flex items-center space-x-3 transition-all text-left relative overflow-hidden ${
                          isManagingTags
                            ? isSelected
                              ? 'bg-red-50 border-red-500 ring-2 ring-red-500 opacity-100 scale-[1.02]' // Selected Style
                              : 'bg-white border-gray-200 opacity-70 grayscale-[0.3]' // Selectable Style
                            : 'bg-white border-gray-100 hover:shadow-md active:scale-95' // Normal Style
                        }`}
                      >
                        {/* Selection Indicator Overlay */}
                        {isManagingTags && (
                          <div className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-red-500 border-red-500' : 'border-gray-300 bg-white'
                          }`}>
                            {isSelected && <Check size={12} className="text-white" strokeWidth={4} />}
                          </div>
                        )}

                        <div className={`p-3 rounded-full transition-colors ${
                          isManagingTags && isSelected ? 'bg-red-100 text-red-600' : tag.color
                        }`}>
                          {renderIcon(tag.iconName)}
                        </div>
                        <span className={`font-semibold text-sm truncate transition-colors ${
                           isManagingTags && isSelected ? 'text-red-700' : 'text-gray-700'
                        }`}>
                          {tag.label}
                        </span>
                      </button>
                    </div>
                  );
                })}
                
                {/* Add Tag Button */}
                {!isManagingTags && quickTags.length < MAX_TAGS && (
                  <button
                    onClick={() => setShowAddTagModal(true)}
                    className="bg-gray-100 p-4 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-white hover:border-blue-400 hover:text-blue-500 transition-colors animate-fadeIn"
                  >
                    <Plus size={24} />
                    <span className="text-xs font-bold mt-1">Añadir</span>
                  </button>
                )}
              </div>

              {/* Bulk Delete Action Button - Only visible in Manage Mode */}
              {isManagingTags && (
                 <div className="animate-in slide-in-from-bottom-4 duration-300 fixed bottom-24 left-0 w-full px-6 z-30">
                    <button
                      onClick={deleteSelectedTags}
                      disabled={selectedTagsToDelete.length === 0}
                      className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl transition-all ${
                        selectedTagsToDelete.length > 0
                          ? 'bg-red-600 text-white hover:bg-red-700 active:scale-95'
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-80'
                      }`}
                    >
                      <Trash2 size={20} />
                      {selectedTagsToDelete.length > 0 
                        ? `ELIMINAR ${selectedTagsToDelete.length} SELECCIONADOS` 
                        : 'SELECCIONA PARA ELIMINAR'}
                    </button>
                 </div>
              )}

              {/* Footer Tip (only in normal mode) */}
              {!isManagingTags && (
                <div className="text-center text-gray-400 text-xs mt-4 opacity-60">
                  <p>Usa el micrófono 🎙️ para buscar por voz</p>
                </div>
              )}
            </div>
          )}

          {/* List View */}
          {shouldShowList && (
            <div className="space-y-1 mt-2">
              {currentView === ViewState.HOME && (
                 <div className="flex justify-between items-center px-2 mb-2 animate-fadeIn">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {filteredContacts.length} {filteredContacts.length === 1 ? 'Resultado' : 'Resultados'}
                    </span>
                 </div>
              )}
              
              {filteredContacts.slice(0, visibleLimit).map(contact => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  isFavorite={favorites.includes(contact.id)}
                  onToggleFavorite={toggleFavorite}
                  onEdit={handleEditStart}
                  onDelete={handleDelete}
                />
              ))}
              
              {filteredContacts.length > visibleLimit && (
                <button 
                  onClick={handleLoadMore}
                  className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-medium text-sm mt-4 hover:bg-blue-100 transition-colors"
                >
                  Cargar más resultados ({filteredContacts.length - visibleLimit} restantes)...
                </button>
              )}

              {filteredContacts.length === 0 && searchQuery !== '' && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Info size={48} className="mb-4 opacity-20" />
                  <p>No encontramos nada para "{searchQuery}"</p>
                  <button onClick={() => setSearchQuery('')} className="mt-4 text-blue-500 font-bold">
                    Limpiar búsqueda
                  </button>
                </div>
              )}
            </div>
          )}

           {/* Empty Favorites Placeholder */}
           {currentView === ViewState.FAVORITES && filteredContacts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 mt-20">
              <Star size={64} className="opacity-20 mb-4" />
              <p className="font-medium">Aún no tienes favoritos</p>
              <p className="text-sm text-center mt-2 max-w-xs opacity-70">
                Pulsa la estrella en cualquier contacto para guardarlo aquí.
              </p>
            </div>
          )}
          
        </main>
      </div>
      
      {/* Add Tag Modal Overlay */}
      {showAddTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddTagModal(false)}></div>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm relative z-10 shadow-xl animate-in fade-in zoom-in duration-200">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Nuevo Acceso Rápido</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del botón</label>
                <input 
                  type="text" 
                  value={newTagLabel}
                  onChange={(e) => setNewTagLabel(e.target.value)}
                  placeholder="Ej. Rayos"
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Término de búsqueda</label>
                <input 
                  type="text" 
                  value={newTagTerm}
                  onChange={(e) => setNewTagTerm(e.target.value)}
                  placeholder="Ej. Radiología"
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
                <p className="text-[10px] text-gray-400 mt-1">Esto es lo que buscará la app automáticamente.</p>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setShowAddTagModal(false)}
                  className="flex-1 py-3 text-gray-500 font-medium hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAddTag}
                  disabled={!newTagLabel || !newTagTerm}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Añadir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav currentView={currentView} onChangeView={handleViewChange} />
    </div>
  );
};

export default App;
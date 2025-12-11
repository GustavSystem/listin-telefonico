import React, { useState, useEffect } from 'react';
import { Phone, Star, PhoneForwarded, MapPin, Pencil, Trash2, Copy, Check, Share2 } from 'lucide-react';
import { Contact } from '../types';

interface ContactCardProps {
  contact: Contact;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ 
  contact, 
  isFavorite, 
  onToggleFavorite,
  onEdit,
  onDelete
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const hasExternal = contact.externo && contact.externo.trim() !== '';
  const hasInternal = contact.interno && contact.interno.trim() !== '' && contact.interno.trim() !== 'X';
  const isMaterno = contact.centro.toUpperCase().includes('MATERNO');

  // Auto-reset delete confirmation after 3 seconds
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isDeleting) {
      timeout = setTimeout(() => {
        setIsDeleting(false);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [isDeleting]);

  // Reset copied state
  useEffect(() => {
    if (copiedField) {
      const timer = setTimeout(() => setCopiedField(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedField]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) {
      onDelete(contact.id);
    } else {
      setIsDeleting(true);
      if (navigator.vibrate) navigator.vibrate(50);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(contact);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.vibrate) navigator.vibrate(50);
    onToggleFavorite(contact.id);
  }

  const handleCopy = (e: React.MouseEvent, text: string, field: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: contact.servicio,
          text: `Contacto Hospital: ${contact.servicio}\nInterno: ${contact.interno}\nExterno: ${contact.externo}`,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      // Fallback if share not supported (copy details)
      const text = `${contact.servicio} (Int: ${contact.interno} / Ext: ${contact.externo})`;
      navigator.clipboard.writeText(text);
      alert('Detalles copiados al portapapeles');
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-l-4 p-4 mb-3 relative animate-fadeIn transition-transform active:scale-[0.99] ${
      isMaterno ? 'border-l-pink-500' : 'border-l-teal-500'
    }`}>
      
      <div className="flex justify-between items-start mb-2">
        <div className="pr-4"> 
          <div className="flex flex-wrap gap-2 mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              isMaterno ? 'bg-pink-50 text-pink-600' : 'bg-teal-50 text-teal-600'
            }`}>
              {contact.centro}
            </span>
            {contact.edificio && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 flex items-center">
                <MapPin size={8} className="mr-1" />
                {contact.edificio} {contact.planta ? `• P${contact.planta}` : ''}
              </span>
            )}
          </div>
          <h3 className="font-bold text-gray-800 text-lg leading-snug pr-12">
            {contact.servicio}
          </h3>
        </div>
        
        {/* Action Buttons Group - Moved UP to top-2 right-2 to clear text */}
        <div className="absolute top-2 right-2 flex items-center gap-1 z-10 bg-white/95 backdrop-blur-sm rounded-lg p-0.5 shadow-sm border border-gray-100">
           {/* Share Button */}
           {!isDeleting && (
            <button
              onClick={handleShare}
              className="p-1.5 text-gray-400 hover:text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
              title="Compartir"
            >
              <Share2 size={16} />
            </button>
           )}

           {/* Fav Button */}
           {!isDeleting && (
            <button
              type="button"
              onClick={handleFavorite}
              className={`p-1.5 rounded-full transition-colors ${
                isFavorite ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
              }`}
            >
              <Star size={18} fill={isFavorite ? "currentColor" : "none"} />
            </button>
           )}

           {/* Edit Button */}
           {!isDeleting && (
             <button onClick={handleEdit} className="p-1.5 text-gray-300 hover:text-blue-500">
                <Pencil size={16} />
             </button>
           )}

           {/* Delete Button */}
           <button
            type="button"
            onClick={handleDeleteClick}
            className={`p-1.5 rounded-full transition-all duration-200 flex items-center justify-center ${
              isDeleting 
                ? 'bg-red-500 text-white shadow-md w-auto px-2' 
                : 'text-gray-300 hover:text-red-500'
            }`}
          >
            {isDeleting ? <Trash2 size={14} /> : <Trash2 size={16} />}
          </button>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        {hasInternal && (
          <div className="flex-1 relative group">
            <a
              href={`tel:${contact.interno}`}
              className="flex flex-col items-center justify-center bg-blue-50 text-blue-700 py-3 rounded-xl hover:bg-blue-100 transition-colors w-full h-full"
            >
              <Phone size={20} className="mb-1" />
              <span className="text-sm font-bold tracking-tight">Ext. {contact.interno}</span>
            </a>
            {/* Copy Button Overlay */}
            <button
              onClick={(e) => handleCopy(e, contact.interno, 'internal')}
              className="absolute top-1 right-1 p-1.5 rounded-full text-blue-300 hover:text-blue-600 hover:bg-blue-200/50 transition-all"
            >
               {copiedField === 'internal' ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        )}
        
        {hasExternal ? (
          <div className="flex-1 relative group">
            <a
              href={`tel:${contact.externo}`}
              className="flex flex-col items-center justify-center bg-green-50 text-green-700 py-3 rounded-xl hover:bg-green-100 transition-colors w-full h-full"
            >
              <PhoneForwarded size={20} className="mb-1" />
              <span className="text-sm font-bold tracking-tight">{contact.externo}</span>
            </a>
             {/* Copy Button Overlay */}
             <button
              onClick={(e) => handleCopy(e, contact.externo, 'external')}
              className="absolute top-1 right-1 p-1.5 rounded-full text-green-300 hover:text-green-600 hover:bg-green-200/50 transition-all"
            >
               {copiedField === 'external' ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        ) : (
             <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-300 py-3 rounded-xl border border-dashed border-gray-200 cursor-not-allowed">
            <PhoneForwarded size={20} className="mb-1 opacity-50" />
            <span className="text-xs font-medium">Sin externo</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactCard;
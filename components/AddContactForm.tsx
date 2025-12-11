import React, { useState, useEffect } from 'react';
import { Contact } from '../types';
import { Save, ArrowLeft, AlertTriangle } from 'lucide-react';
import { generateId } from '../utils';

interface AddContactFormProps {
  initialData?: Contact | null;
  onSave: (contact: Contact) => void;
  onCancel: () => void;
}

const AddContactForm: React.FC<AddContactFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Contact>({
    id: '',
    centro: 'MATERNO',
    edificio: '',
    planta: '',
    servicio: '',
    interno: '',
    externo: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        id: '',
        centro: 'MATERNO',
        edificio: '',
        planta: '',
        servicio: '',
        interno: '',
        externo: ''
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.servicio) {
      alert('El nombre del servicio es obligatorio');
      return;
    }

    const contactToSave: Contact = {
      ...formData,
      id: formData.id || generateId()
    };
    onSave(contactToSave);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-blue-600 p-4 text-white flex items-center shadow-md sticky top-0 z-10">
        <button type="button" onClick={onCancel} className="mr-3">
          <ArrowLeft />
        </button>
        <h2 className="text-lg font-bold">{initialData ? 'Editar Contacto' : 'Añadir Contacto'}</h2>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-6">
        
        {/* Manual Entry Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            
            <div className="flex items-center text-sm text-gray-400 mb-2">
              <AlertTriangle size={14} className="mr-1" />
              <span>Edición manual</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Centro</label>
              <select
                name="centro"
                value={formData.centro}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="MATERNO">MATERNO</option>
                <option value="INSULAR">INSULAR</option>
                <option value="ANEXO">ANEXO</option>
                <option value="OTRO">OTRO</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Servicio / Departamento *</label>
              <input
                type="text"
                name="servicio"
                value={formData.servicio}
                onChange={handleChange}
                placeholder="Ej. Cardiología Consulta 1"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zona / Edificio</label>
                <input
                  type="text"
                  name="edificio"
                  value={formData.edificio}
                  onChange={handleChange}
                  placeholder="Ej. NORTE"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Planta</label>
                <input
                  type="text"
                  name="planta"
                  value={formData.planta}
                  onChange={handleChange}
                  placeholder="Ej. 3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tlf. Interno</label>
                <input
                  type="tel"
                  name="interno"
                  value={formData.interno}
                  onChange={handleChange}
                  placeholder="Ej. 74000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nº Público</label>
                <input
                  type="tel"
                  name="externo"
                  value={formData.externo}
                  onChange={handleChange}
                  placeholder="Ej. 928..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex justify-center items-center"
          >
            <Save className="mr-2" />
            {initialData ? 'Actualizar Contacto' : 'Guardar Contacto'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddContactForm;
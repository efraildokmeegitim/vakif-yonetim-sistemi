import React, { useState } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

export interface PickerOption {
  id: number | string;
  name: string;
  description?: string;
  badge?: string;
}

interface ItemPickerProps {
  options: PickerOption[];
  value: number | string;
  onChange: (value: number | string) => void;
  placeholder?: string;
  label?: string;
  onAddNew?: (search: string) => void;
}

export default function ItemPicker({ options, value, onChange, placeholder = 'Seçiniz...', label, onAddNew }: ItemPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedOption = options.find(o => o.id === value);

  const filteredOptions = options.filter(o => 
    o.name.toLowerCase().includes(search.toLowerCase()) || 
    (o.description && o.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="relative">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div 
        className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all"
        onClick={() => setIsOpen(true)}
      >
        <span className={selectedOption ? 'text-gray-900 font-medium' : 'text-gray-400'}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <Search className="h-5 w-5 text-gray-400" />
              <input 
                autoFocus
                type="text" 
                placeholder="Arama yapın..." 
                className="w-full focus:outline-none text-gray-700 bg-transparent"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="max-h-96 overflow-y-auto p-2">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">Sonuç bulunamadı.</div>
              ) : (
                filteredOptions.map((option, index) => (
                  <div 
                    key={`${option.id}-${index}`}
                    onClick={() => {
                      onChange(option.id);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`p-3 rounded-xl cursor-pointer flex items-center justify-between transition-colors ${
                      value === option.id ? 'bg-emerald-50 border border-emerald-100' : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div>
                      <div className={`font-medium ${value === option.id ? 'text-emerald-800' : 'text-gray-800'}`}>
                        {option.name}
                      </div>
                      {option.description && (
                        <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {option.badge && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] rounded uppercase font-bold tracking-wider">
                          {option.badge}
                        </span>
                      )}
                      {value === option.id && <Check className="h-5 w-5 text-emerald-600" />}
                    </div>
                  </div>
                ))
              )}
            </div>
            {onAddNew && (
              <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsOpen(false);
                    onAddNew(search);
                  }}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  + Yeni Kayıt Ekle "{search}"
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

interface ItemPickerProps {
  items: any[];
  value: any;
  onChange: (val: any) => void;
  displayKey?: string;
  valueKey?: string;
  placeholder?: string;
  disabled?: boolean;
  onQuickCreate?: (search: string) => void;
  quickCreateLabel?: string;
}

export default function ItemPicker({ 
  items, value, onChange, displayKey = 'name', valueKey = 'id', 
  placeholder = 'Seçiniz...', disabled = false, onQuickCreate, quickCreateLabel = 'Hızlı Ekle' 
}: ItemPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedItem = items.find(i => i[valueKey] === value);
  const filteredItems = items.filter(i => 
    (i[displayKey] || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={wrapperRef}>
      <div 
        className={`w-full border p-2 rounded flex justify-between items-center bg-white ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-500'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={selectedItem ? "text-gray-900" : "text-gray-400"}>
          {selectedItem ? selectedItem[displayKey] : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-60 flex flex-col">
          <div className="p-2 border-b flex items-center gap-2 sticky top-0 bg-white rounded-t-lg">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              className="flex-1 outline-none text-sm" 
              placeholder="Ara..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1 p-1">
            {filteredItems.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">Sonuç bulunamadı</div>
            ) : (
              filteredItems.map(item => (
                <div 
                  key={item[valueKey]}
                  className={`p-2 text-sm rounded cursor-pointer flex justify-between items-center hover:bg-blue-50 ${value === item[valueKey] ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}
                  onClick={() => {
                    onChange(item[valueKey]);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  {item[displayKey]}
                  {value === item[valueKey] && <Check className="w-4 h-4 text-blue-600" />}
                </div>
              ))
            )}
          </div>
          {onQuickCreate && search.trim() && (
            <button
              type="button"
              onClick={() => {
                onQuickCreate(search.trim());
                setIsOpen(false);
                setSearch('');
              }}
              className="w-full text-left px-3 py-2 text-xs text-blue-600 font-bold hover:bg-blue-50 border-t flex items-center gap-1 bg-gray-50 rounded-b-lg transition-colors"
            >
              + {quickCreateLabel} "{search.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}

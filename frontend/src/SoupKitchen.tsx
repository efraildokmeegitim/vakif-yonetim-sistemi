import React, { useState, useEffect } from 'react';
import { api } from './api';
import { ChefHat, Plus, Utensils, Users, Calendar, Trash2, Edit, Search, CheckCircle, Clock } from 'lucide-react';
import ItemPicker from './components/ItemPicker';
import QuickCreateHouseholdModal from './QuickCreateHouseholdModal';
import { usePluginContext } from './PluginContext';

export default function SoupKitchen() {
  const { activePlugins } = usePluginContext();
  const [menus, setMenus] = useState<any[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<any>(null);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [menuForm, setMenuForm] = useState({ date: new Date().toISOString().split('T')[0], meals: '', totalPortions: 0 });

  const [showDistModal, setShowDistModal] = useState(false);
  const [distForm, setDistForm] = useState<any>({ householdId: null, anonymousName: '', portionCount: 1, notes: '' });

  const [households, setHouseholds] = useState<any[]>([]);
  const [isQuickCreateHouseholdOpen, setIsQuickCreateHouseholdOpen] = useState(false);
  const [quickCreateHouseholdSearch, setQuickCreateHouseholdSearch] = useState('');

  const loadMenus = async () => {
    try {
      const res = await api.get('/soup-kitchen/menus');
      setMenus(res.data);
      if (res.data.length > 0 && !selectedMenu) {
        handleSelectMenu(res.data[0]);
      } else if (selectedMenu) {
        handleSelectMenu(selectedMenu);
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const loadHouseholds = async () => {
    try {
      const res = await api.get('/households');
      setHouseholds(res.data.households || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { 
    loadMenus(); 
    loadHouseholds();
  }, []);

  const handleSelectMenu = async (m: any) => {
    try {
      const res = await api.get(`/soup-kitchen/menus/${m.id}`);
      setSelectedMenu(res.data);
    } catch (e) { console.error(e); }
  };

  const handleSaveMenu = async () => {
    try {
      await api.post('/soup-kitchen/menus', menuForm);
      setShowMenuModal(false);
      loadMenus();
    } catch (e) { alert('Hata oluştu'); }
  };

  const handleDeleteMenu = async (id: number) => {
    if (!confirm('Emin misiniz?')) return;
    try {
      await api.delete(`/soup-kitchen/menus/${id}`);
      if (selectedMenu?.id === id) setSelectedMenu(null);
      loadMenus();
    } catch (e) { alert('Hata oluştu'); }
  };

  const handleSaveDist = async () => {
    if (!selectedMenu) return;
    try {
      await api.post('/soup-kitchen/distributions', { ...distForm, menuId: selectedMenu.id });
      setShowDistModal(false);
      setDistForm({ householdId: null, anonymousName: '', portionCount: 1, notes: '' });
      handleSelectMenu(selectedMenu);
      loadMenus();
    } catch (e) { alert('Hata oluştu'); }
  };

  const handleDeleteDist = async (id: number) => {
    if (!confirm('Emin misiniz?')) return;
    try {
      await api.delete(`/soup-kitchen/distributions/${id}`);
      handleSelectMenu(selectedMenu);
      loadMenus();
    } catch (e) { alert('Hata oluştu'); }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex gap-6 h-[calc(100vh-100px)]">
      
      {/* Sol Panel: Menü Listesi */}
      <div className="w-1/3 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-orange-600" /> Günlük Menüler
          </h2>
          <button onClick={() => setShowMenuModal(true)} className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {menus.map(m => (
            <div 
              key={m.id} 
              onClick={() => handleSelectMenu(m)}
              className={`p-4 rounded-xl cursor-pointer border transition-all ${
                selectedMenu?.id === m.id ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100 hover:border-orange-100'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold flex items-center gap-1 text-gray-700">
                  <Calendar className="w-4 h-4" /> {m.date}
                </span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                  {m.distributedPortions} / {m.totalPortions} Porsiyon
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{m.meals}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sağ Panel: Seçili Menü Detayı ve Dağıtımlar */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        {selectedMenu ? (
          <>
            <div className="p-6 border-b border-gray-100 bg-orange-50/30">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedMenu.date} Menüsü</h1>
                  <p className="text-gray-700 flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-orange-500" /> {selectedMenu.meals}
                  </p>
                </div>
                <button onClick={() => handleDeleteMenu(selectedMenu.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 flex gap-4">
                <div className="px-4 py-2 bg-white rounded-lg border text-sm font-medium">Hedef: {selectedMenu.totalPortions} Porsiyon</div>
                <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-100 text-sm font-medium">
                  Dağıtılan: {selectedMenu.distributedPortions}
                </div>
                <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 text-sm font-medium">
                  Kalan: {selectedMenu.totalPortions - selectedMenu.distributedPortions}
                </div>
              </div>
            </div>

            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" /> Dağıtım Kayıtları
              </h3>
              <button onClick={() => setShowDistModal(true)} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-orange-700">
                <Plus className="w-4 h-4" /> Dağıtım Ekle
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {selectedMenu.distributions?.length === 0 ? (
                <div className="text-center py-10 text-gray-400">Henüz dağıtım kaydı yok.</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Saat</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Alan Kişi / Hane</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">Porsiyon</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Not</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selectedMenu.distributions?.map((d: any) => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-500">{new Date(d.distributedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                        <td className="py-3 px-4">
                          {d.household ? (
                            <span className="font-medium text-blue-700">{d.household.name} (Hane)</span>
                          ) : (
                            <span className="text-gray-700">{d.anonymousName || 'İsimsiz'}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-gray-900">{d.portionCount}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{d.notes || '-'}</td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => handleDeleteDist(d.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <ChefHat className="w-16 h-16 mb-4 opacity-20" />
            <p>Detayları görmek için sol taraftan bir menü seçin.</p>
          </div>
        )}
      </div>

      {/* Yeni Menü Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-orange-600" />
                Yeni Günlük Menü
              </h2>
              <button onClick={() => setShowMenuModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Menü Tarihi</label>
                <input type="date" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-600 transition-all text-sm font-medium text-gray-700" value={menuForm.date} onChange={e => setMenuForm({...menuForm, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Yemekler</label>
                <textarea placeholder="Mercimek Çorbası, Tavuk Sote, Pilav..." className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-600 transition-all text-sm font-medium h-24 resize-none" rows={3} value={menuForm.meals} onChange={e => setMenuForm({...menuForm, meals: e.target.value})}></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Hedef Porsiyon (Toplam)</label>
                <input type="number" placeholder="0" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-600 transition-all text-sm font-bold text-gray-800" value={menuForm.totalPortions} onChange={e => setMenuForm({...menuForm, totalPortions: Number(e.target.value)})} />
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button onClick={() => setShowMenuModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button onClick={handleSaveMenu} className="px-6 py-2.5 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors shadow-md shadow-orange-600/10 text-sm">
                  Menüyü Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Yeni Dağıtım Modal */}
      {showDistModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md overflow-visible border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Utensils className="h-5 w-5 text-orange-600" />
                Yemek Dağıtımı / Çıkışı
              </h2>
              <button onClick={() => setShowDistModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              {activePlugins.includes('households') && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Kayıtlı Hane Seç (İsteğe Bağlı)</label>
                  <ItemPicker 
                    items={households} 
                    value={distForm.householdId} 
                    onChange={(val) => setDistForm({...distForm, householdId: val, anonymousName: ''})} 
                    placeholder="Hane Ara..." 
                    onAddNew={(search) => {
                      setQuickCreateHouseholdSearch(search);
                      setIsQuickCreateHouseholdOpen(true);
                    }}
                  />
                </div>
              )}
              
              {!distForm.householdId && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Kayıtsız Kişi / İsim</label>
                  <input type="text" placeholder="Ad Soyad" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-600 transition-all text-sm font-medium" value={distForm.anonymousName} onChange={e => setDistForm({...distForm, anonymousName: e.target.value})} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Porsiyon Sayısı</label>
                  <input type="number" min="1" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-600 transition-all text-sm font-bold text-gray-800" value={distForm.portionCount} onChange={e => setDistForm({...distForm, portionCount: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Not (Opsiyonel)</label>
                  <input type="text" placeholder="Not ekleyin..." className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-600 transition-all text-sm font-medium" value={distForm.notes} onChange={e => setDistForm({...distForm, notes: e.target.value})} />
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button onClick={() => setShowDistModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button onClick={handleSaveDist} className="px-6 py-2.5 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors shadow-md shadow-orange-600/10 text-sm">
                  Dağıtımı Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <QuickCreateHouseholdModal
        isOpen={isQuickCreateHouseholdOpen}
        initialName={quickCreateHouseholdSearch}
        onClose={() => setIsQuickCreateHouseholdOpen(false)}
        onCreated={(newHousehold) => {
          api.get('/households').then(res => setHouseholds(res.data.households || [])).catch(console.error);
          if (newHousehold && newHousehold.id) setDistForm({ ...distForm, householdId: newHousehold.id });
          setIsQuickCreateHouseholdOpen(false);
        }}
      />
    </div>
  );
}

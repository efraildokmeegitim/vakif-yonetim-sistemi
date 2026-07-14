import React, { useState, useEffect } from 'react';
import { api } from './api';
import { CheckSquare, Plus, Clock, CheckCircle, ChevronRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import ItemPicker from './components/ItemPicker';
import QuickCreateCurrentAccountModal from './QuickCreateCurrentAccountModal';
import QuickCreateProjectModal from './QuickCreateProjectModal';
import QuickCreateCostCenterModal from './QuickCreateCostCenterModal';
import { usePluginContext } from './PluginContext';

export default function Tasks() {
  const { activePlugins } = usePluginContext();
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState({ activeTasks: 0, completedTasks: 0 });
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [currentAccounts, setCurrentAccounts] = useState<any[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [quickCreateSearch, setQuickCreateSearch] = useState('');

  const [isQuickCreateProjectOpen, setIsQuickCreateProjectOpen] = useState(false);
  const [quickCreateProjectSearch, setQuickCreateProjectSearch] = useState('');

  const [isQuickCreateCostCenterOpen, setIsQuickCreateCostCenterOpen] = useState(false);
  const [quickCreateCostCenterSearch, setQuickCreateCostCenterSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>({
    title: '', description: '', personnel_id: '', project_id: '', current_account_id: '', cost_center_id: '', due_date: ''
  });

  const loadData = async () => {
    try {
      const [tasksRes] = await Promise.all([
        api.get('/tasks')
      ]);
      setTasks(tasksRes.data.tasks);
      setStats(tasksRes.data.stats);
      api.get('/api/personnel').then(res => setPersonnel(res.data)).catch(console.error);
      api.get('/projects?search=&archived=false').then(res => setProjects(res.data.projects || [])).catch(console.error);
      api.get('/api/current-accounts').then(res => setCurrentAccounts(res.data)).catch(console.error);
      api.get('/api/cost-centers').then(res => setCostCenters(res.data)).catch(console.error);
    } catch (e: any) {
      if (e.response?.status === 403) alert(e.response.data.message);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    try {
      await api.post('/tasks', form);
      setShowModal(false);
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Hata oluştu');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <CheckSquare className="w-8 h-8 text-teal-600" />
          Görev Yönetimi
        </h1>
        <button 
          onClick={() => { setForm({ title: '', description: '', personnel_id: '', project_id: '', current_account_id: '', cost_center_id: '', due_date: '' }); setShowModal(true); }} 
          className="px-5 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Yeni Görev
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-xl"><Activity className="w-8 h-8 text-blue-600" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Devam Eden Görevler</p>
            <p className="text-3xl font-bold text-gray-900">{stats.activeTasks}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-4 bg-green-50 rounded-xl"><CheckCircle className="w-8 h-8 text-green-600" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tamamlanan Görevler</p>
            <p className="text-3xl font-bold text-gray-900">{stats.completedTasks}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left py-4 px-6">Görev Başlığı</th>
              <th className="text-left py-4 px-6">Görevli Personel</th>
              <th className="text-left py-4 px-6">Son Tarih</th>
              <th className="text-left py-4 px-6">Durum</th>
              <th className="text-right py-4 px-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tasks.map(t => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                <td className="py-4 px-6 font-medium text-gray-900">{t.title}</td>
                <td className="py-4 px-6 text-gray-600">{t.personnel_name}</td>
                <td className="py-4 px-6 text-gray-600">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '-'}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    t.status === 'Hesap Kapatıldı' || t.status === 'Tamamlandı' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <Link to={`/tasks/${t.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-800 opacity-0 group-hover:opacity-100 transition-opacity">
                    Detay <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-500">Görev bulunamadı.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-teal-50 to-emerald-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-teal-600" />
                Yeni Görev Oluştur
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Görev Başlığı</label>
                <input type="text" placeholder="Görevi tanımlayan kısa başlık" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 transition-all text-sm font-medium" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Açıklama</label>
                <textarea placeholder="Görev detayları ve talimatları..." className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 transition-all text-sm font-medium h-20 resize-none" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Görevlendirilen Personel</label>
                  <ItemPicker items={personnel} value={form.personnel_id} onChange={(v) => setForm({...form, personnel_id: v})} placeholder="Personel Seçin..." />
                </div>
                {activePlugins.includes('projects') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">İlişkili Proje (Opsiyonel)</label>
                    <ItemPicker 
                      items={projects} 
                      value={form.project_id} 
                      onChange={(v) => setForm({...form, project_id: v})} 
                      placeholder="Proje Seçin..." 
                      onAddNew={(search) => {
                        setQuickCreateProjectSearch(search);
                        setIsQuickCreateProjectOpen(true);
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {activePlugins.includes('current-accounts') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">İlgili Cari (Opsiyonel)</label>
                    <ItemPicker 
                      items={currentAccounts} 
                      value={form.current_account_id} 
                      onChange={(v) => setForm({...form, current_account_id: v})} 
                      placeholder="Cari Seçin..." 
                      onAddNew={(search) => {
                        setQuickCreateSearch(search);
                        setIsQuickCreateOpen(true);
                      }}
                    />
                  </div>
                )}
                {activePlugins.includes('cost-centers') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Masraf Merkezi (Opsiyonel)</label>
                    <ItemPicker 
                      items={costCenters} 
                      value={form.cost_center_id} 
                      onChange={(v) => setForm({...form, cost_center_id: v})} 
                      placeholder="Seçin..." 
                      onAddNew={(search) => {
                        setQuickCreateCostCenterSearch(search);
                        setIsQuickCreateCostCenterOpen(true);
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Son Tarih (Termin)</label>
                <input type="date" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 transition-all text-sm font-medium text-gray-700" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} />
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button onClick={handleSave} className="px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors shadow-md shadow-teal-600/10 text-sm">Görev Oluştur</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <QuickCreateCurrentAccountModal
        isOpen={isQuickCreateOpen}
        initialName={quickCreateSearch}
        defaultTypeName="Genel Cari"
        onClose={() => setIsQuickCreateOpen(false)}
        onCreated={(newAccount) => {
          api.get('/api/current-accounts').then(res => setCurrentAccounts(res.data)).catch(console.error);
          setForm({ ...form, current_account_id: newAccount.id });
          setIsQuickCreateOpen(false);
        }}
      />

      <QuickCreateProjectModal
        isOpen={isQuickCreateProjectOpen}
        initialName={quickCreateProjectSearch}
        onClose={() => setIsQuickCreateProjectOpen(false)}
        onCreated={(newProject) => {
          api.get('/projects?search=&archived=false').then(res => setProjects(res.data.projects || [])).catch(console.error);
          if(newProject && newProject.id) setForm({ ...form, project_id: newProject.id });
          setIsQuickCreateProjectOpen(false);
        }}
      />

      <QuickCreateCostCenterModal
        isOpen={isQuickCreateCostCenterOpen}
        initialName={quickCreateCostCenterSearch}
        onClose={() => setIsQuickCreateCostCenterOpen(false)}
        onCreated={(newCostCenter) => {
          api.get('/api/cost-centers').then(res => setCostCenters(res.data)).catch(console.error);
          if(newCostCenter && newCostCenter.id) setForm({ ...form, cost_center_id: newCostCenter.id });
          setIsQuickCreateCostCenterOpen(false);
        }}
      />
    </div>
  );
}

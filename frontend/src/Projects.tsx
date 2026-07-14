import React, { useState, useEffect } from 'react';
import { api } from './api';
import { FolderKanban, Plus, Search, Archive, Briefcase, Activity, CheckCircle, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({ active_projects: 0, completed_projects: 0, total_projects: 0 });
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>({ name: '', description: '', is_campaign: false });

  const loadData = async () => {
    try {
      const res = await api.get(`/projects?search=${search}&archived=${showArchived}`);
      setProjects(res.data.projects);
      setStats(res.data.stats);
    } catch (e: any) {
      if (e.response?.status === 403) alert(e.response.data.message);
    }
  };

  useEffect(() => { loadData(); }, [search, showArchived]);

  const handleSave = async () => {
    try {
      await api.post('/projects', form);
      setShowModal(false);
      loadData();
    } catch (e: any) { alert('Hata oluştu'); }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FolderKanban className="w-8 h-8 text-blue-600" />
          Proje Yönetimi
        </h1>
        <div className="flex gap-3">
          <button onClick={() => setShowArchived(!showArchived)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 flex items-center gap-2 font-medium">
            <Archive className="w-4 h-4" /> {showArchived ? 'Aktif Projeleri Göster' : 'Arşivi Göster'}
          </button>
          <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 font-medium">
            <Plus className="w-5 h-5" /> Yeni Proje
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-xl"><Briefcase className="w-8 h-8 text-blue-600" /></div>
          <div><p className="text-sm font-medium text-gray-500">Toplam Proje</p><p className="text-3xl font-bold text-gray-900">{stats.total_projects}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-4 bg-green-50 rounded-xl"><Activity className="w-8 h-8 text-green-600" /></div>
          <div><p className="text-sm font-medium text-gray-500">Devam Eden</p><p className="text-3xl font-bold text-gray-900">{stats.active_projects}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-4 bg-purple-50 rounded-xl"><CheckCircle className="w-8 h-8 text-purple-600" /></div>
          <div><p className="text-sm font-medium text-gray-500">Tamamlanan</p><p className="text-3xl font-bold text-gray-900">{stats.completed_projects}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text" placeholder="Proje Ara..." className="flex-1 outline-none text-sm"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Proje Adı</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Kategori</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Durum</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Başlangıç</th>
              <th className="text-right py-4 px-6 text-sm font-medium text-gray-500">Gelir / Gider (TL)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {projects.map(p => {
              const tlFin = p.financials?.find((f: any) => f.currency === 'TL') || { total_income: 0, total_expense: 0 };
              return (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="py-4 px-6">
                    <Link to={`/projects/${p.id}`} className="font-semibold text-gray-900 hover:text-blue-600 flex items-center gap-2">
                      {p.name} {p.isCampaign ? <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] rounded-full uppercase tracking-wide font-bold">Kampanya</span> : ''}
                    </Link>
                    {p.location && <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {p.location}</p>}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{p.category?.name || '-'}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      p.status === 'Tamamlandı' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{p.startDate ? new Date(p.startDate).toLocaleDateString() : '-'}</td>
                  <td className="py-4 px-6 text-right">
                    <p className="text-sm font-bold text-green-600">+{tlFin.total_income}</p>
                    <p className="text-sm font-bold text-red-600">-{tlFin.total_expense}</p>
                  </td>
                </tr>
              );
            })}
            {projects.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-500">Proje bulunamadı.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-blue-600" />
                Yeni Proje Tanımla
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Proje Adı</label>
                <input type="text" placeholder="Örn: Afrika Su Kuyusu Projesi" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-50/10 focus:border-blue-600 transition-all text-sm font-medium" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              
              <label className="flex items-center gap-3 p-3 bg-blue-50/30 border border-blue-100/60 rounded-xl cursor-pointer hover:bg-blue-50/60 transition-colors">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20" checked={form.is_campaign} onChange={e => setForm({...form, is_campaign: e.target.checked})} />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-blue-900">Bu bir Bağış Kampanyasıdır</p>
                  <p className="text-[10px] text-gray-500">Kasalarla ilişkilendirilebilir bağış takibi sağlar.</p>
                </div>
              </label>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/10 text-sm">
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

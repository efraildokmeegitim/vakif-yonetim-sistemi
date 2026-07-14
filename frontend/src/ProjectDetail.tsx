import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from './api';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Info, Archive, FileText, HandHeart } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);

  const loadData = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setData(res.data);
    } catch (e: any) {
      if (e.response?.status === 404) navigate('/projects');
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleArchive = async () => {
    if (!confirm('Projeyi arşivlemek istediğinize emin misiniz?')) return;
    try {
      await api.post(`/projects/${id}/archive`);
      navigate('/projects');
    } catch (e) { alert('Hata oluştu'); }
  };

  if (!data) return <div className="p-8">Yükleniyor...</div>;
  const { project, transactions, financials, budgetItems, sponsorships, metadata } = data;

  const handleUpdateMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const payload = {
      beneficiary_count: fd.get('beneficiary_count') ? parseInt(fd.get('beneficiary_count') as string) : undefined,
      region_population: fd.get('region_population') ? parseInt(fd.get('region_population') as string) : undefined,
      muslim_population_percent: fd.get('muslim_population_percent') ? parseInt(fd.get('muslim_population_percent') as string) : undefined,
      muslim_population: fd.get('muslim_population') ? parseInt(fd.get('muslim_population') as string) : undefined,
      notes_on_region: fd.get('notes_on_region') as string,
      similar_projects_nearby: fd.get('similar_projects_nearby') as string,
    };
    try {
      await api.post(`/projects/${id}/metadata`, payload);
      alert('Kaydedildi');
      setIsEditingMetadata(false);
      loadData();
    } catch (err) {
      alert('Hata oluştu');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Projelere Dön
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
            <p className="text-gray-500">{project.category_name} &bull; {project.location || 'Konum Belirtilmemiş'}</p>
          </div>
          <div className="flex gap-3">
            <span className="px-4 py-2 rounded-full text-sm font-bold bg-blue-100 text-blue-800">{project.status}</span>
            <button onClick={handleArchive} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"><Archive className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-gray-100 mb-6">
          <div><p className="text-sm text-gray-500 mb-1">Faydanlanıcı Sayısı</p><p className="font-semibold">{project.beneficiaryCount || '-'}</p></div>
          <div><p className="text-sm text-gray-500 mb-1">Müslüman Oranı</p><p className="font-semibold">{project.muslimPopulationPercent ? `%${project.muslimPopulationPercent}` : '-'}</p></div>
          <div><p className="text-sm text-gray-500 mb-1">Başlangıç</p><p className="font-semibold">{project.startDate ? new Date(project.startDate).toLocaleDateString() : '-'}</p></div>
          <div><p className="text-sm text-gray-500 mb-1">Bitiş</p><p className="font-semibold">{project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}</p></div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold flex items-center gap-2"><Info className="w-5 h-5 text-gray-400" /> Proje Detayı</h3>
            <button onClick={() => setIsEditingMetadata(!isEditingMetadata)} className="text-sm text-blue-600 hover:underline">
              {isEditingMetadata ? 'İptal' : 'Detayları Düzenle'}
            </button>
          </div>
          <p className="text-gray-600 text-sm whitespace-pre-line mb-4">{project.description || 'Açıklama bulunmuyor.'}</p>

          {isEditingMetadata ? (
            <form onSubmit={handleUpdateMetadata} className="bg-gray-50 p-4 rounded-xl border grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Faydanlanıcı Sayısı</label>
                <input name="beneficiary_count" type="number" defaultValue={metadata?.beneficiaryCount} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bölge Nüfusu</label>
                <input name="region_population" type="number" defaultValue={metadata?.regionPopulation} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Müslüman Nüfus</label>
                <input name="muslim_population" type="number" defaultValue={metadata?.muslimPopulation} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Müslüman Oranı (%)</label>
                <input name="muslim_population_percent" type="number" defaultValue={metadata?.muslimPopulationPercent} className="w-full border p-2 rounded" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Bölge Notları</label>
                <textarea name="notes_on_region" defaultValue={metadata?.notesOnRegion} className="w-full border p-2 rounded" rows={3}></textarea>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Yakındaki Benzer Projeler</label>
                <textarea name="similar_projects_nearby" defaultValue={metadata?.similarProjectsNearby} className="w-full border p-2 rounded" rows={2}></textarea>
              </div>
              <div className="col-span-2 text-right">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">Kaydet</button>
              </div>
            </form>
          ) : metadata && (
            <div className="bg-gray-50 p-4 rounded-xl border text-sm grid grid-cols-2 gap-4">
              <div><p className="text-gray-500 mb-1">Bölge Nüfusu</p><p className="font-semibold">{metadata.regionPopulation || '-'}</p></div>
              <div><p className="text-gray-500 mb-1">Müslüman Nüfus</p><p className="font-semibold">{metadata.muslimPopulation || '-'}</p></div>
              <div className="col-span-2"><p className="text-gray-500 mb-1">Bölge Notları</p><p>{metadata.notesOnRegion || '-'}</p></div>
              <div className="col-span-2"><p className="text-gray-500 mb-1">Benzer Projeler</p><p>{metadata.similarProjectsNearby || '-'}</p></div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Sol Kolon: Finansal Özler ve İşlemler */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Wallet className="w-6 h-6 text-blue-600" /> Finansal Durum</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {financials.map((f: any) => (
                <div key={f.currency} className="p-4 border rounded-xl bg-gray-50">
                  <p className="text-sm font-bold text-gray-800 mb-2 border-b pb-2">{f.currency} Kasası</p>
                  <p className="text-sm flex justify-between"><span className="text-gray-500">Gelir:</span> <span className="text-green-600 font-bold">+{f.total_income}</span></p>
                  <p className="text-sm flex justify-between"><span className="text-gray-500">Gider:</span> <span className="text-red-600 font-bold">-{f.total_expense}</span></p>
                  <p className="text-sm flex justify-between mt-2 pt-2 border-t"><span className="text-gray-500 font-medium">Bakiye:</span> <span className="font-bold">{f.balance}</span></p>
                </div>
              ))}
              {financials.length === 0 && <p className="text-gray-500 text-sm">Finansal hareket bulunmuyor.</p>}
            </div>

            <h3 className="font-bold mb-4">Son İşlemler</h3>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((t: any) => (
                <div key={t.id} className="flex justify-between items-center p-3 border rounded-lg text-sm">
                  <div className="flex items-center gap-3">
                    {t.type === 'income' ? <TrendingUp className="w-5 h-5 text-green-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
                    <div>
                      <p className="font-medium">{t.description || t.type_name}</p>
                      <p className="text-xs text-gray-500">{new Date(t.transaction_date || t.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'}{t.amount} {t.currency}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Bütçe ve Sponsorluklar */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-teal-600" /> Tahmini Bütçe</h2>
            <div className="space-y-3 text-sm">
              {budgetItems.map((b: any) => (
                <div key={b.id} className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">{b.description}</span>
                  <span className="font-bold">{b.estimatedAmount} {b.currency}</span>
                </div>
              ))}
              {budgetItems.length === 0 && <p className="text-gray-500">Bütçe kalemi yok.</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><HandHeart className="w-5 h-5 text-pink-600" /> Sponsorlar</h2>
            <div className="space-y-3 text-sm">
              {sponsorships.map((s: any) => (
                <div key={s.id} className="p-3 bg-pink-50 rounded-lg border border-pink-100">
                  <p className="font-bold text-gray-900">{s.sponsor_name}</p>
                  <p className="text-pink-600 font-bold mt-1">{s.amount} {s.currency}</p>
                </div>
              ))}
              {sponsorships.length === 0 && <p className="text-gray-500">Sponsor bulunmuyor.</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

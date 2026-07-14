import React, { useState, useEffect } from 'react';
import { Target, HeartHandshake } from 'lucide-react';
import api from './api';

export default function CurrentAccountPartnershipTab({ accountId }: { accountId: string }) {
  const [projects, setProjects] = useState<any[]>([]);
  const [sponsorships, setSponsorships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartnershipData = async () => {
      try {
        const [projRes, sponRes] = await Promise.all([
          api.get(`/projects?partnerId=${accountId}`),
          api.get(`/sponsorships?sponsorId=${accountId}`)
        ]);
        
        // Ensure we properly extract projects array based on the API response structure
        const projData = Array.isArray(projRes.data) ? projRes.data : (projRes.data?.projects || []);
        setProjects(projData);
        setSponsorships(sponRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (accountId) fetchPartnershipData();
  }, [accountId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Ortaklık bilgileri yükleniyor...</div>;

  return (
    <div className="space-y-6">
      
      {/* İstatistikler */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Projeler (Partner)</p>
            <p className="text-2xl font-bold text-blue-800">{projects.length}</p>
          </div>
          <Target className="w-8 h-8 text-blue-300" />
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Sponsorluklar</p>
            <p className="text-2xl font-bold text-purple-800">{sponsorships.length}</p>
          </div>
          <HeartHandshake className="w-8 h-8 text-purple-300" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Projeler */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" /> Ortak Olunan Projeler
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {projects.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">Kayıtlı proje ortaklığı bulunmuyor.</div>
            ) : (
              projects.map(p => (
                <div key={p.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-900">{p.name}</h4>
                    <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider ${p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                      {p.isActive ? 'Devam Ediyor' : 'Tamamlandı'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-2">{p.description}</p>
                  <div className="mt-3 text-xs text-gray-500 font-medium">
                    Başlangıç: {new Date(p.startDate).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sponsorluklar */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-purple-500" /> Sponsorluklar
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {sponsorships.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">Kayıtlı sponsorluk bulunmuyor.</div>
            ) : (
              sponsorships.map(s => (
                <div key={s.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-900">{s.name}</h4>
                    <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider ${s.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                      {s.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mt-2">{Number(s.amount).toLocaleString('tr-TR')} {s.currency}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500 font-medium">
                    <span>Faydalanıcı: {s.beneficiary ? s.beneficiary.name : '-'}</span>
                    <span>{new Date(s.startDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

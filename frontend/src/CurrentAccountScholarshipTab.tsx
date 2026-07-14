import React, { useState, useEffect } from 'react';
import { GraduationCap, Wallet, Calendar } from 'lucide-react';
import api from './api';

export default function CurrentAccountScholarshipTab({ accountId }: { accountId: string }) {
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScholarships = async () => {
      try {
        const res = await api.get(`/scholarships?studentCaId=${accountId}`);
        setScholarships(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (accountId) fetchScholarships();
  }, [accountId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Burs bilgileri yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-500" /> Burs Bilgileri
        </h3>
      </div>
      
      {scholarships.length === 0 ? (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center text-gray-500">
          Bu kişiye ait burs kaydı bulunmamaktadır.
        </div>
      ) : (
        <div className="grid gap-4">
          {scholarships.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-base font-bold text-gray-900">{s.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{s.type} • {s.monthlyAmount} {s.currency} / Ay</p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider ${
                  s.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {s.status}
                </span>
              </div>
              <div className="flex gap-6 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Başlangıç: <span className="font-medium text-gray-900">{new Date(s.startDate).toLocaleDateString('tr-TR')}</span></span>
                </div>
                {s.endDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Bitiş: <span className="font-medium text-gray-900">{new Date(s.endDate).toLocaleDateString('tr-TR')}</span></span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-gray-400" />
                  <span>Tutar: <span className="font-medium text-gray-900">{s.monthlyAmount} {s.currency}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

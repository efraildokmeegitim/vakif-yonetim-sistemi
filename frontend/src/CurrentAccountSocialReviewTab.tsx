import React, { useState, useEffect } from 'react';
import { Heart, Users, DollarSign, Activity, Gift } from 'lucide-react';
import api from './api';

export default function CurrentAccountSocialReviewTab({ accountId }: { accountId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSocialData = async () => {
      try {
        const res = await api.get(`/households/current-account/${accountId}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (accountId) fetchSocialData();
  }, [accountId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Sosyal inceleme verileri yükleniyor...</div>;
  if (!data) return <div className="p-8 text-center text-gray-500">Veri bulunamadı.</div>;

  return (
    <div className="space-y-6">
      {/* İnceleme Özeti */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1"><Users className="w-3 h-3"/> Hane Halkı</p>
          <p className="text-lg font-bold text-gray-900">{data.members?.length || 0} Kişi</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1"><Activity className="w-3 h-3"/> Sağlık Sorunları</p>
          <p className="text-lg font-bold text-gray-900">{data.healthConditions?.length || 0} Kayıt</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1"><Heart className="w-3 h-3"/> İhtiyaçlar</p>
          <p className="text-lg font-bold text-gray-900">{data.needs?.length || 0} İhtiyaç</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1"><Gift className="w-3 h-3"/> Dış Yardımlar</p>
          <p className="text-lg font-bold text-gray-900">{data.aids?.length || 0} Kurum</p>
        </div>
      </div>

      {/* Sosyal Durum (Cari) */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Kişi / Aile Durumu</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 font-medium">Medeni Durum</p>
            <p className="text-sm text-gray-900">{data.socialData?.marital_status || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Eğitim Durumu</p>
            <p className="text-sm text-gray-900">{data.socialData?.education_status || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Çalışma Durumu</p>
            <p className="text-sm text-gray-900">{data.socialData?.work_status || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Meslek</p>
            <p className="text-sm text-gray-900">{data.socialData?.job || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Barınma / Ev Tipi</p>
            <p className="text-sm text-gray-900">{data.socialData?.housing_type || '-'} ({data.socialData?.housing_status || '-'})</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Sosyal Güvence</p>
            <p className="text-sm text-gray-900">{data.socialData?.social_security_status || '-'}</p>
          </div>
        </div>
      </div>

      {/* Hane Halkı Tablosu */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Users className="w-4 h-4 text-blue-500" /> Hane Halkı Bireyleri</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-xs font-medium text-gray-500">Ad Soyad</th>
                <th className="px-4 py-2 text-xs font-medium text-gray-500">Yakınlık</th>
                <th className="px-4 py-2 text-xs font-medium text-gray-500">Yaş / D.Tarihi</th>
                <th className="px-4 py-2 text-xs font-medium text-gray-500">Eğitim</th>
                <th className="px-4 py-2 text-xs font-medium text-gray-500">İş / Gelir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.members?.map((m: any) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{m.name}</td>
                  <td className="px-4 py-3 text-gray-600">{m.relationship}</td>
                  <td className="px-4 py-3 text-gray-600">{m.birth_date ? new Date(m.birth_date).toLocaleDateString('tr-TR') : '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{m.education_status || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{m.job || '-'} {m.monthly_income ? `(${m.monthly_income} TL)` : ''}</td>
                </tr>
              ))}
              {(!data.members || data.members.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Hane halkı bilgisi bulunmuyor.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { api } from './api';
import { BookOpen, ShoppingBag, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Publications() {
  const [stats, setStats] = useState({ totalPublications: 0, activeSubscriptions: 0, totalBooksSold: 0 });

  useEffect(() => {
    api.get('/publications/stats').then(res => setStats(res.data)).catch(console.error);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-indigo-600" />
        Yayınlar Yönetimi
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-4 bg-indigo-50 rounded-xl"><BookOpen className="w-8 h-8 text-indigo-600" /></div>
          <div><p className="text-sm font-medium text-gray-500">Katalogdaki Yayınlar</p><p className="text-3xl font-bold text-gray-900">{stats.totalPublications}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-xl"><Users className="w-8 h-8 text-blue-600" /></div>
          <div><p className="text-sm font-medium text-gray-500">Aktif Aboneler</p><p className="text-3xl font-bold text-gray-900">{stats.activeSubscriptions}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-4 bg-green-50 rounded-xl"><ShoppingBag className="w-8 h-8 text-green-600" /></div>
          <div><p className="text-sm font-medium text-gray-500">Satılan Kitap (Adet)</p><p className="text-3xl font-bold text-gray-900">{stats.totalBooksSold}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/publications/catalog" className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-indigo-500 hover:shadow-md transition-all flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors"><BookOpen className="w-6 h-6" /></div>
            <div><h3 className="font-bold text-lg">Katalog</h3><p className="text-sm text-gray-500">Kitap ve Dergi Tanımları</p></div>
          </div>
          <ChevronRight className="text-gray-300 group-hover:text-indigo-500" />
        </Link>
        <Link to="/publications/subscriptions" className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"><Users className="w-6 h-6" /></div>
            <div><h3 className="font-bold text-lg">Abonelikler</h3><p className="text-sm text-gray-500">Dergi Abonelikleri ve Hediye</p></div>
          </div>
          <ChevronRight className="text-gray-300 group-hover:text-blue-500" />
        </Link>
        <Link to="/publications/pos" className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-green-500 hover:shadow-md transition-all flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-green-50 group-hover:text-green-600 transition-colors"><ShoppingBag className="w-6 h-6" /></div>
            <div><h3 className="font-bold text-lg">Kitap Satışı (POS)</h3><p className="text-sm text-gray-500">Hızlı Satış ve Stok Düşümü</p></div>
          </div>
          <ChevronRight className="text-gray-300 group-hover:text-green-500" />
        </Link>
      </div>
    </div>
  );
}

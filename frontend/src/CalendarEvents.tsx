import React, { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import api from './api';

export default function CalendarEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', start: '', end: '', color: '#3788d8', department: '' });
  
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSave = async () => {
    await api.post('/events', form);
    setShowModal(false);
    setForm({ title: '', description: '', start: '', end: '', color: '#3788d8', department: '' });
    fetchEvents();
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Pazartesi = 0
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50/30 border border-gray-100 rounded-lg"></div>);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const dayEvents = events.filter(e => e.start && e.start.startsWith(dateStr));
    
    days.push(
      <div key={`day-${i}`} className="h-24 p-2 bg-white border border-gray-200 rounded-lg overflow-y-auto hover:shadow-sm transition-shadow group relative">
        <div className="text-xs font-bold text-gray-500 mb-1">{i}</div>
        <div className="space-y-1">
          {dayEvents.map(ev => (
            <div key={ev.id} className="text-[10px] px-1.5 py-1 rounded text-white truncate cursor-pointer" style={{ backgroundColor: ev.color || '#3788d8' }} title={ev.title}>
              {ev.title}
            </div>
          ))}
        </div>
        <button 
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-opacity"
          onClick={() => {
            setForm({...form, start: `${dateStr}T10:00`, end: `${dateStr}T11:00`});
            setShowModal(true);
          }}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Takvim</h1>
          <p className="text-gray-500 text-sm mt-1">Vakıf etkinlikleri, toplantılar ve görevler</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          Yeni Etkinlik
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            {monthNames[month]} {year}
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-sm text-gray-700">
              Bugün
            </button>
            <button onClick={nextMonth} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
            <div key={day} className="text-center text-xs font-bold text-gray-500 py-2 uppercase tracking-wider">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                Yeni Etkinlik Ekle
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Etkinlik Başlığı</label>
                <input type="text" placeholder="Toplantı, Konferans vb." className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Açıklama</label>
                <textarea placeholder="Etkinlik ayrıntıları..." className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium h-20 resize-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Başlangıç</label>
                  <input type="datetime-local" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium text-gray-700" value={form.start} onChange={e => setForm({...form, start: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Bitiş</label>
                  <input type="datetime-local" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium text-gray-700" value={form.end} onChange={e => setForm({...form, end: e.target.value})} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Departman</label>
                  <input type="text" placeholder="Muhasebe vb." className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium" value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Renk Etiketi</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" className="w-12 h-10 border border-gray-200 rounded-xl p-1 bg-gray-50/50 cursor-pointer" value={form.color} onChange={e => setForm({...form, color: e.target.value})} />
                    <span className="text-xs text-gray-400 font-mono uppercase">{form.color}</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/10 text-sm">
                  Etkinliği Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

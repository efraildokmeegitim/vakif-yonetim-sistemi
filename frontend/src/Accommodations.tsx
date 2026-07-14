import React, { useState, useEffect } from 'react';
import { api } from './api';
import { 
  Hotel, Plus, Calendar, Users, LogIn, LogOut, Check, X, FileText, 
  AlertTriangle, CheckCircle, Info, CalendarRange, Download, Edit2, Trash2
} from 'lucide-react';
import ItemPicker from './ItemPicker';
import QuickCreateCurrentAccountModal from './QuickCreateCurrentAccountModal';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Room {
  id: number;
  name: string;
  capacity: number;
  room_type: 'Erkek' | 'Kadın' | 'Aile' | 'Karma';
  status: 'Kullanılabilir' | 'Bakımda' | 'Kapalı';
  notes: string | null;
  cleaning_status: 'Temiz' | 'Kirli' | 'Temizleniyor';
  is_reserved_exclusively: boolean;
  occupied_beds: number;
  available_beds: number;
}

interface GuestDetail {
  tc_no?: string;
  ad_soyad: string;
  dogum_tarihi?: string;
  cinsiyet?: string;
  telefon?: string;
  adres?: string;
  notlar?: string;
}

interface Reservation {
  id: number;
  guestCaId: number;
  guestAccount?: { id: number; name: string; phone?: string };
  roomId: number;
  room?: Room;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  status: 'Aktif' | 'Tamamlandı' | 'İptal Edildi';
  notes: string | null;
  reserves_entire_room: number;
  guests: GuestDetail[];
}

export default function Accommodations() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentAccounts, setCurrentAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rooms' | 'reservations' | 'report' | 'calendar' | 'housekeeping' | 'detailed_report'>('rooms');
  const [detailedReports, setDetailedReports] = useState<any>(null);
  const [selectedReservations, setSelectedReservations] = useState<number[]>([]);

  const fetchDetailedReports = async () => {
    try {
      const res = await api.get('/accommodations/reports/detailed');
      setDetailedReports(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCleaningStatus = async (roomId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Temiz' ? 'Kirli' : 'Temiz';
    try {
      await api.patch(`/accommodations/rooms/${roomId}/cleaning-status`, { status: newStatus });
      fetchRoomsAndReservations();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'detailed_report') {
      fetchDetailedReports();
    }
  }, [activeTab]);

  // Stats
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    activeGuests: 0,
    todayArrivals: 0,
    todayDepartures: 0
  });

  // Modals
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Forms
  const [roomForm, setRoomForm] = useState({
    name: '',
    capacity: 2,
    room_type: 'Karma' as Room['room_type'],
    status: 'Kullanılabilir' as Room['status'],
    notes: ''
  });

  const [resForm, setResForm] = useState({
    guest_ca_id: '',
    room_ids: [] as string[],
    check_in_date: new Date().toISOString().split('T')[0],
    check_out_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    guest_count: 1,
    reserves_entire_room: 0,
    notes: '',
    guest_details: [] as GuestDetail[]
  });

  // Daily Report
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);

  // Edit Guests State
  const [editingGuestsReservation, setEditingGuestsReservation] = useState<any>(null);
  const [editGuestsForm, setEditGuestsForm] = useState<any[]>([]);

  const fetchRoomsAndReservations = async () => {
    try {
      const [roomsRes, resRes] = await Promise.all([
        api.get('/accommodations/rooms'),
        api.get('/accommodations/reservations')
      ]);
      setRooms(roomsRes.data);
      setReservations(resRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Quick Create Account
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false);
  const [quickCreateSearch, setQuickCreateSearch] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsRes, resRes, caRes, statsRes] = await Promise.all([
        api.get('/accommodations/rooms'),
        api.get('/accommodations/reservations'),
        api.get('/current-accounts'),
        api.get('/accommodations/stats')
      ]);
      setRooms(roomsRes.data);
      setReservations(resRes.data);
      setCurrentAccounts(caRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'report') {
      api.get(`/accommodations/daily-report?date=${reportDate}`)
        .then(res => setReportData(res.data))
        .catch(console.error);
    }
  }, [activeTab, reportDate]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedRoom) {
        await api.patch(`/accommodations/rooms/${selectedRoom.id}`, roomForm);
      } else {
        await api.post('/accommodations/rooms', roomForm);
      }
      setShowRoomModal(false);
      setSelectedRoom(null);
      setRoomForm({ name: '', capacity: 2, room_type: 'Karma', status: 'Kullanılabilir', notes: '' });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Hata oluştu');
    }
  };

  const handleResSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resForm.room_ids.length === 0) {
      alert('Lütfen en az bir oda seçiniz.');
      return;
    }
    
    try {
      if (resForm.room_ids.length > 1) {
        // Bulk reservation
        const payload = {
          ...resForm,
          guest_ca_id: Number(resForm.guest_ca_id),
          room_ids: resForm.room_ids.map(Number)
        };
        await api.post('/accommodations/reservations/bulk', payload);
      } else {
        // Single reservation
        const payload = {
          ...resForm,
          guest_ca_id: Number(resForm.guest_ca_id),
          room_id: Number(resForm.room_ids[0])
        };
        await api.post('/accommodations/reservations', payload);
      }
      
      setShowReservationModal(false);
      setResForm({ guest_ca_id: '', room_ids: [], check_in_date: new Date().toISOString().split('T')[0], check_out_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], guest_count: 1, reserves_entire_room: 0, notes: '', guest_details: [] });
      fetchRoomsAndReservations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Rezervasyon eklenirken hata oluştu');
    }
  };

  const handleCheckout = async (id: number) => {
    if (!confirm('Misafirin çıkış işlemini onaylıyor musunuz?')) return;
    try {
      await api.post(`/accommodations/reservations/${id}/checkout`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelReservation = async (id: number) => {
    if (!confirm('Rezervasyonu iptal etmek istediğinize emin misiniz?')) return;
    try {
      await api.post(`/accommodations/reservations/${id}/cancel`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRoom = async (id: number) => {
    if (!confirm('Odayı silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/accommodations/rooms/${id}`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Hata oluştu');
    }
  };

  const handleBulkCheckout = async () => {
    if (selectedReservations.length === 0) return;
    if (!confirm(`${selectedReservations.length} rezervasyon için toplu çıkış yapmak istediğinize emin misiniz?`)) return;
    try {
      await api.post('/accommodations/reservations/bulk-checkout', { reservation_ids: selectedReservations });
      setSelectedReservations([]);
      fetchRoomsAndReservations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Toplu çıkış işlemi sırasında hata oluştu');
    }
  };

  const handleBulkCancel = async () => {
    if (selectedReservations.length === 0) return;
    if (!confirm(`${selectedReservations.length} rezervasyonu iptal etmek istediğinize emin misiniz?`)) return;
    try {
      await api.post('/accommodations/reservations/bulk-cancel', { reservation_ids: selectedReservations });
      setSelectedReservations([]);
      fetchRoomsAndReservations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Toplu iptal işlemi sırasında hata oluştu');
    }
  };

  const openEditGuestsModal = (reservation: any) => {
    setEditingGuestsReservation(reservation);
    setEditGuestsForm([...(reservation.guests || [])]);
  };

  const handleEditGuestsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuestsReservation) return;
    try {
      await api.patch(`/accommodations/reservations/${editingGuestsReservation.id}/guests`, {
        guest_details: editGuestsForm
      });
      setEditingGuestsReservation(null);
      fetchRoomsAndReservations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Misafir güncellenirken hata oluştu');
    }
  };

  const getDaysRemaining = (checkOutDate: string, status: string) => {
    if (status !== 'Aktif') return null;
    const diff = new Date(checkOutDate).getTime() - new Date().setHours(0, 0, 0, 0);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleExportCSV = () => {
    const csvHeader = 'Oda,Ad Soyad,TC Kimlik No,Doğum Tarihi,Cinsiyet,Telefon,Adres,Giriş Tarihi,Çıkış Tarihi,Notlar\n';
    
    const rows = reportData.flatMap(res => {
      const mainGuest = {
        room: res.room?.name || '',
        name: res.guestAccount?.name || '',
        tc: '',
        dob: '',
        gender: '',
        phone: res.guestAccount?.phone || '',
        address: '',
        checkIn: res.check_in_date,
        checkOut: res.check_out_date,
        notes: res.notes || ''
      };

      const additionalGuests = (res.guests || []).map(g => ({
        room: res.room?.name || '',
        name: g.ad_soyad,
        tc: g.tc_no || '',
        dob: g.dogum_tarihi || '',
        gender: g.cinsiyet || '',
        phone: g.telefon || '',
        address: g.adres || '',
        checkIn: res.check_in_date,
        checkOut: res.check_out_date,
        notes: g.notlar || ''
      }));

      return [mainGuest, ...additionalGuests];
    });

    const csvRows = rows.map(r => {
      const escape = (str: string) => `"${(str || '').replace(/"/g, '""')}"`;
      return [
        escape(r.room),
        escape(r.name),
        escape(r.tc),
        escape(r.dob),
        escape(r.gender),
        escape(r.phone),
        escape(r.address),
        escape(r.checkIn),
        escape(r.checkOut),
        escape(r.notes)
      ].join(',');
    }).join('\n');

    const blob = new Blob(['\ufeff' + csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `misafir_bildirim_kbs_${reportDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getReportRows = () => {
    return reportData.flatMap(res => {
      const mainGuest = {
        room: res.room?.name || '',
        name: res.guestAccount?.name || '',
        tc: '', dob: '', gender: '',
        phone: res.guestAccount?.phone || '',
        address: '', checkIn: res.check_in_date, checkOut: res.check_out_date,
        notes: res.notes || ''
      };
      const additionalGuests = (res.guests || []).map(g => ({
        room: res.room?.name || '',
        name: g.ad_soyad, tc: g.tc_no || '', dob: g.dogum_tarihi || '',
        gender: g.cinsiyet || '', phone: g.telefon || '',
        address: g.adres || '', checkIn: res.check_in_date, checkOut: res.check_out_date,
        notes: g.notlar || ''
      }));
      return [mainGuest, ...additionalGuests];
    });
  };

  const handleExportTXT = () => {
    const rows = getReportRows();
    let txt = `OdaNo|AdSoyad|TCKimlik|DogumTarihi|Cinsiyet|Telefon|GirisTarihi|CikisTarihi\n`;
    rows.forEach(r => {
      txt += `${r.room}|${r.name}|${r.tc}|${r.dob}|${r.gender}|${r.phone}|${r.checkIn}|${r.checkOut}\n`;
    });
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kbs_bildirim_${reportDate}.txt`;
    link.click();
  };

  const handleExportXML = () => {
    const rows = getReportRows();
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<Gonderilenler>\n`;
    rows.forEach(r => {
      xml += `  <Misafir>\n`;
      xml += `    <OdaNo>${r.room}</OdaNo>\n`;
      xml += `    <AdSoyad>${r.name}</AdSoyad>\n`;
      xml += `    <TCKimlik>${r.tc}</TCKimlik>\n`;
      xml += `    <DogumTarihi>${r.dob}</DogumTarihi>\n`;
      xml += `    <Cinsiyet>${r.gender}</Cinsiyet>\n`;
      xml += `    <Telefon>${r.phone}</Telefon>\n`;
      xml += `    <GirisTarihi>${r.checkIn}</GirisTarihi>\n`;
      xml += `    <CikisTarihi>${r.checkOut}</CikisTarihi>\n`;
      xml += `  </Misafir>\n`;
    });
    xml += `</Gonderilenler>`;
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kbs_bildirim_${reportDate}.xml`;
    link.click();
  };

  const checkGenderWarning = () => {
    if (resForm.room_ids.length === 0) return false;
    const selectedR = rooms.find(r => r.id === Number(resForm.room_ids[0]));
    if (!selectedR) return false;
    
    // Check main guest gender
    const mainGuestObj = currentAccounts.find(ca => ca.id === Number(resForm.guest_ca_id));
    const mainGender = mainGuestObj?.metadata?.gender || '';

    const hasMismatch = (selectedR.room_type === 'Erkek' && mainGender === 'Kadın') ||
                        (selectedR.room_type === 'Kadın' && mainGender === 'Erkek');

    if (hasMismatch) return true;

    // Check additional guests genders
    for (const g of resForm.guest_details) {
      if (selectedR.room_type === 'Erkek' && g.cinsiyet === 'Kadın') return true;
      if (selectedR.room_type === 'Kadın' && g.cinsiyet === 'Erkek') return true;
    }

    return false;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-emerald-600 to-teal-700 p-8 rounded-3xl shadow-xl text-white">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <Hotel className="w-10 h-10" /> Misafirhane Yönetim Paneli
          </h1>
          <p className="text-emerald-100 mt-2 text-sm font-medium">Oda kapasiteleri, konaklama kayıtları ve emniyet kimlik bildirim dökümleri.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setSelectedRoom(null);
              setRoomForm({ name: '', capacity: 2, room_type: 'Karma', status: 'Kullanılabilir', notes: '' });
              setShowRoomModal(true);
            }}
            className="px-5 py-3 bg-white/20 backdrop-blur border border-white/30 rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Yeni Oda Ekle
          </button>
          <button 
            onClick={() => {
              setResForm({
                guest_ca_id: '',
                room_ids: [],
                check_in_date: new Date().toISOString().split('T')[0],
                check_out_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                guest_count: 1,
                reserves_entire_room: 0,
                notes: '',
                guest_details: []
              });
              setShowReservationModal(true);
            }}
            className="px-5 py-3 bg-white text-emerald-800 rounded-xl font-bold hover:bg-emerald-50 transition-all shadow-md flex items-center gap-2"
          >
            <LogIn className="w-5 h-5" /> Rezervasyon Yap
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Toplam Oda</p>
          <p className="text-2xl font-black text-gray-900 mt-2">{stats.totalRooms}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Kullanılabilir Oda</p>
          <p className="text-2xl font-black text-emerald-600 mt-2">{stats.availableRooms}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Aktif Misafir</p>
          <p className="text-2xl font-black text-indigo-600 mt-2">{stats.activeGuests}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Bugün Giriş</p>
          <p className="text-2xl font-black text-amber-500 mt-2">{stats.todayArrivals} Kişi</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Bugün Çıkış</p>
          <p className="text-2xl font-black text-rose-500 mt-2">{stats.todayDepartures} Kişi</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('rooms')}
          className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 ${activeTab === 'rooms' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
        >
          Odalar & Doluluk Durumu
        </button>
        <button 
          onClick={() => setActiveTab('reservations')}
          className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 ${activeTab === 'reservations' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
        >
          Konaklama / Rezervasyon Kayıtları
        </button>
        <button 
          onClick={() => setActiveTab('report')}
          className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 ${activeTab === 'report' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
        >
          Günlük Misafir Dökümü (KBS)
        </button>
        <button 
          onClick={() => setActiveTab('calendar')}
          className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 ${activeTab === 'calendar' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
        >
          Takvim Görünümü
        </button>
        <button 
          onClick={() => setActiveTab('housekeeping')}
          className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 ${activeTab === 'housekeeping' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
        >
          Kat Hizmetleri
        </button>
        <button 
          onClick={() => setActiveTab('detailed_report')}
          className={`pb-4 px-2 font-bold text-sm transition-all border-b-2 ${activeTab === 'detailed_report' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
        >
          Raporlar
        </button>
      </div>

      {/* Rooms Tab */}
      {activeTab === 'rooms' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rooms.map(room => {
            const isMaintenance = room.status === 'Bakımda';
            const isClosed = room.status === 'Kapalı';
            
            let statusColor = 'border-emerald-500 bg-emerald-50 text-emerald-700'; // Boş (Yeşil)
            if (isMaintenance || isClosed) {
              statusColor = 'border-yellow-500 bg-yellow-50 text-yellow-700'; // Kullanılmayacak (Sarı)
            } else if (room.is_reserved_exclusively || room.occupied_beds >= room.capacity) {
              statusColor = 'border-red-500 bg-red-50 text-red-700'; // Aileye ayrılmış veya Dolu (Kırmızı)
            } else if (room.occupied_beds > 0) {
              // İçerideki misafir cinsiyetine göre Pembe / Mavi
              const activeRes = reservations.filter(r => r.roomId === room.id && r.status === 'Aktif');
              let hasFemale = false;
              let hasMale = false;
              activeRes.forEach(r => {
                const mainGuestObj = currentAccounts.find(ca => ca.id === r.guestCaId);
                if (mainGuestObj?.metadata?.gender === 'Kadın') hasFemale = true;
                if (mainGuestObj?.metadata?.gender === 'Erkek') hasMale = true;
                if (r.guests) {
                  r.guests.forEach(g => {
                    if (g.cinsiyet === 'Kadın') hasFemale = true;
                    if (g.cinsiyet === 'Erkek') hasMale = true;
                  });
                }
              });

              if (hasFemale && !hasMale) statusColor = 'border-pink-500 bg-pink-50 text-pink-700'; // Sadece Kadın
              else if (hasMale && !hasFemale) statusColor = 'border-blue-500 bg-blue-50 text-blue-700'; // Sadece Erkek
              else statusColor = 'border-blue-500 bg-blue-50 text-blue-700'; // Karma / Bilinmiyor
            }

            return (
              <div key={room.id} className={`border-2 rounded-2xl p-6 transition-all flex flex-col justify-between hover:shadow-md ${statusColor}`}>
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-gray-900">{room.name}</h3>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 text-xs font-bold rounded-lg bg-white/80 border text-gray-700">{room.room_type}</span>
                      <span className="px-2 py-1 text-xs font-bold rounded-lg bg-white/80 border text-gray-700">{room.status}</span>
                    </div>
                  </div>
                  
                  {/* Occupied Bed Info */}
                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-gray-600">
                      <span>Yatak Kapasitesi:</span>
                      <span>{room.occupied_beds} / {room.capacity} Dolu</span>
                    </div>
                    <div className="w-full bg-gray-200/50 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${room.is_reserved_exclusively || room.occupied_beds >= room.capacity ? 'bg-red-600' : 'bg-emerald-600'}`} 
                        style={{ width: `${(room.occupied_beds / room.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {room.is_reserved_exclusively && (
                    <p className="text-xs font-bold text-purple-700 mt-3 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" /> Aileye Kapatılmıştır (Özel Rezervasyon)
                    </p>
                  )}

                  {room.notes && (
                    <p className="text-xs text-gray-500 italic mt-3 bg-white/40 p-2 rounded-lg border border-gray-100">
                      <strong>Not:</strong> {room.notes}
                    </p>
                  )}

                  {room.cleaning_status === 'Kirli' && (
                    <p className="text-xs font-bold text-rose-600 mt-3 flex items-center gap-1 bg-rose-100 p-2 rounded-lg border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5" /> Temizlenmesi Gerekiyor!
                    </p>
                  )}
                  {room.cleaning_status === 'Temizleniyor' && (
                    <p className="text-xs font-bold text-amber-600 mt-3 flex items-center gap-1 bg-amber-100 p-2 rounded-lg border border-amber-200">
                      <Info className="w-3.5 h-3.5" /> Temizleniyor...
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200/40 flex justify-between gap-2">
                  <button 
                    onClick={() => {
                      setSelectedRoom(room);
                      setRoomForm({
                        name: room.name,
                        capacity: room.capacity,
                        room_type: room.room_type,
                        status: room.status,
                        notes: room.notes || ''
                      });
                      setShowRoomModal(true);
                    }}
                    className="flex-1 py-2 border rounded-xl hover:bg-white transition-colors text-xs font-bold flex justify-center items-center gap-1.5 text-gray-700 bg-white/50"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Düzenle
                  </button>
                  <button 
                    onClick={() => handleDeleteRoom(room.id)}
                    className="py-2 px-3 border rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors text-xs font-bold text-gray-500 bg-white/50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 overflow-hidden">
          <div className="mb-4">
            <h2 className="font-extrabold text-lg text-gray-900">Rezervasyon Takvimi</h2>
            <p className="text-gray-500 text-xs">Oda doluluk durumu ve rezervasyon planlaması.</p>
          </div>
          <div className="calendar-container w-full min-h-[600px] overflow-x-auto">
            <FullCalendar
              schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
              plugins={[resourceTimelinePlugin, interactionPlugin, dayGridPlugin]}
              initialView="resourceTimelineMonth"
              headerToolbar={{
                left: 'today prev,next',
                center: 'title',
                right: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth,dayGridMonth'
              }}
              locale="tr"
              resourceAreaWidth="220px"
              resourceAreaHeaderContent="Odalar"
              height="600px"
              selectable={true}
              select={(info) => {
                const startDate = info.startStr.split('T')[0];
                const endDate = info.endStr.split('T')[0];
                const roomId = info.resource ? info.resource.id : '';
                
                setResForm({
                  guest_ca_id: '',
                  room_ids: roomId ? [roomId] : [],
                  check_in_date: startDate,
                  check_out_date: endDate,
                  guest_count: 1,
                  reserves_entire_room: 0,
                  notes: '',
                  guest_details: []
                });
                setShowReservationModal(true);
              }}
              resources={rooms.map(r => ({
                id: r.id.toString(),
                title: r.name,
                roomType: r.room_type,
                capacity: r.capacity
              }))}
              events={reservations.filter(r => r.status === 'Aktif').map(r => {
                const endDate = new Date(r.check_out_date);
                endDate.setDate(endDate.getDate() + 1); // Fullcalendar end dates are exclusive

                let bgColor = '#10b981'; // Green fallback
                let borderColor = '#059669';

                // İlgili odanın doluluk durumunu kontrol et
                const roomInfo = rooms.find(rm => rm.id === r.roomId);
                const isRoomFull = roomInfo ? (roomInfo.occupied_beds >= roomInfo.capacity) : false;

                if (r.reserves_entire_room || isRoomFull) {
                  bgColor = '#ef4444'; // Red for Family/Full
                  borderColor = '#dc2626';
                } else {
                  const mainGuestObj = currentAccounts.find(ca => ca.id === r.guestCaId);
                  let hasFemale = false;
                  let hasMale = false;

                  const mainGender = mainGuestObj?.metadata?.gender;
                  if (mainGender === 'Kadın') hasFemale = true;
                  if (mainGender === 'Erkek') hasMale = true;

                  if (r.guests) {
                    r.guests.forEach(g => {
                      if (g.cinsiyet === 'Kadın') hasFemale = true;
                      if (g.cinsiyet === 'Erkek') hasMale = true;
                    });
                  }

                  if (hasFemale && hasMale) {
                    bgColor = '#eab308'; // Yellow mixed
                    borderColor = '#ca8a04';
                  } else if (hasFemale) {
                    bgColor = '#ec4899'; // Pink female
                    borderColor = '#db2777';
                  } else if (hasMale) {
                    bgColor = '#3b82f6'; // Blue male
                    borderColor = '#2563eb';
                  }
                }

                return {
                  id: r.id.toString(),
                  resourceId: r.roomId.toString(),
                  title: r.guestAccount?.name || 'Misafir',
                  start: r.check_in_date,
                  end: endDate.toISOString().split('T')[0],
                  backgroundColor: bgColor,
                  borderColor: borderColor,
                  extendedProps: {
                    guestCount: r.guest_count,
                    phone: r.guestAccount?.phone,
                    notes: r.notes
                  }
                };
              })}
              eventClick={(info) => {
                const { title, extendedProps, start, end } = info.event;
                const startDate = start ? start.toLocaleDateString('tr-TR') : '-';
                const endDate = end ? new Date(end.getTime() - 86400000).toLocaleDateString('tr-TR') : '-'; // minus 1 day because it was exclusive
                alert(`Misafir: ${title}\nGiriş: ${startDate}\nÇıkış: ${endDate}\nKişi Sayısı: ${extendedProps.guestCount}\nİletişim: ${extendedProps.phone || '-'}\nNotlar: ${extendedProps.notes || '-'}`);
              }}
              resourceLabelContent={(arg) => (
                <div className="flex flex-col py-1">
                  <span className="font-bold text-gray-800 text-sm leading-tight">{arg.resource.title}</span>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-1">{arg.resource.extendedProps.roomType} - {arg.resource.extendedProps.capacity} Kişi</span>
                </div>
              )}
            />
          </div>
        </div>
      )}

      {/* Reservations Tab */}
      {activeTab === 'reservations' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-extrabold text-lg text-gray-900">Konaklama Hareket Listesi</h2>
            {selectedReservations.length > 0 && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleBulkCancel}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 transition-colors shadow-sm flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> İptal Et
                </button>
                <button 
                  onClick={handleBulkCheckout}
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Seçili {selectedReservations.length} Çıkış Yap
                </button>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-[10px] tracking-wider border-b">
                <tr>
                  <th className="p-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedReservations(reservations.filter(r => r.status === 'Aktif').map(r => r.id));
                        } else {
                          setSelectedReservations([]);
                        }
                      }}
                      checked={selectedReservations.length > 0 && selectedReservations.length === reservations.filter(r => r.status === 'Aktif').length}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer" 
                    />
                  </th>
                  <th className="p-4">Misafir (Cari Hesap)</th>
                  <th className="p-4">Oda</th>
                  <th className="p-4">Giriş Tarihi</th>
                  <th className="p-4">Çıkış Tarihi</th>
                  <th className="p-4">Kişi Sayısı</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4">Kalan Süre</th>
                  <th className="p-4 text-right">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reservations.map(res => {
                  const daysRemaining = getDaysRemaining(res.check_out_date, res.status);
                  const isOverdue = daysRemaining !== null && daysRemaining < 0;

                  return (
                    <tr key={res.id} className={`hover:bg-gray-50/50 ${selectedReservations.includes(res.id) ? 'bg-emerald-50/50' : ''}`}>
                      <td className="p-4 text-center">
                        {res.status === 'Aktif' && (
                          <input 
                            type="checkbox" 
                            checked={selectedReservations.includes(res.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedReservations([...selectedReservations, res.id]);
                              } else {
                                setSelectedReservations(selectedReservations.filter(id => id !== res.id));
                              }
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer" 
                          />
                        )}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-gray-900">{res.guestAccount?.name || 'Bilinmeyen Cari'}</p>
                        {res.guestAccount?.phone && <p className="text-xs text-gray-500">{res.guestAccount.phone}</p>}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold bg-gray-100 text-gray-800 px-2.5 py-1 rounded-lg text-xs">{res.room?.name || 'Oda Belirtilmemiş'}</span>
                      </td>
                      <td className="p-4 font-medium text-gray-700">{new Date(res.check_in_date).toLocaleDateString('tr-TR')}</td>
                      <td className="p-4 font-medium text-gray-700">{new Date(res.check_out_date).toLocaleDateString('tr-TR')}</td>
                      <td className="p-4 font-semibold text-gray-900">{res.guest_count} Kişi</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          res.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700' :
                          res.status === 'Tamamlandı' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {daysRemaining !== null ? (
                          isOverdue ? (
                            <span className="text-rose-600 font-extrabold flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-4 h-4" /> {Math.abs(daysRemaining)} Gün Gecikti!
                            </span>
                          ) : (
                            <span className="text-gray-600 font-medium">{daysRemaining} Gün Kaldı</span>
                          )
                        ) : '-'}
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        {res.status === 'Aktif' && (
                          <>
                            <button 
                              onClick={() => handleCheckout(res.id)}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <LogOut className="w-3.5 h-3.5" /> Çıkış Yap
                            </button>
                            <button 
                              onClick={() => openEditGuestsModal(res)}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <Users className="w-3.5 h-3.5" /> Kişiler
                            </button>
                            <button 
                              onClick={() => handleCancelReservation(res.id)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" /> İptal Et
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Daily Report Tab */}
      {activeTab === 'report' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="font-extrabold text-lg text-gray-900">Günlük Konaklayan Misafir Dökümü</h2>
              <p className="text-gray-500 text-xs mt-1">Seçilen tarihte konaklamakta olan tüm aktif misafirlerin kimlik ve iletişim listesi.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <input 
                type="date" 
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="px-4 py-2 border rounded-xl font-bold text-gray-700"
              />
              <div className="flex justify-end gap-2 mb-6">
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> CSV İhracı
                </button>
                <button
                  onClick={handleExportTXT}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> TXT İhracı
                </button>
                <button
                  onClick={handleExportXML}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> XML İhracı (KBS)
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border rounded-2xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-[10px] tracking-wider border-b">
                <tr>
                  <th className="p-4">Oda</th>
                  <th className="p-4">Ad Soyad</th>
                  <th className="p-4">TC Kimlik No</th>
                  <th className="p-4">Doğum Tarihi</th>
                  <th className="p-4">Cinsiyet</th>
                  <th className="p-4">Telefon</th>
                  <th className="p-4">Adres</th>
                  <th className="p-4">Kalan Süre</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reportData.flatMap(res => {
                  const mainGuestRow = (
                    <tr key={`main-${res.id}`} className="hover:bg-gray-50/50">
                      <td className="p-4 font-bold text-gray-900">{res.room?.name || '-'}</td>
                      <td className="p-4 font-semibold text-emerald-800">{res.guestAccount?.name} (Grup Lideri)</td>
                      <td className="p-4 text-gray-500">-</td>
                      <td className="p-4 text-gray-500">-</td>
                      <td className="p-4 text-gray-500">-</td>
                      <td className="p-4 text-gray-500">{res.guestAccount?.phone || '-'}</td>
                      <td className="p-4 text-gray-500">-</td>
                      <td className="p-4 text-gray-500">{new Date(res.check_in_date).toLocaleDateString('tr-TR')} - {new Date(res.check_out_date).toLocaleDateString('tr-TR')}</td>
                    </tr>
                  );

                  const additionalRows = (res.guests || []).map(g => (
                    <tr key={`guest-${g.tc_no}-${g.ad_soyad}`} className="hover:bg-gray-50/50 bg-gray-50/20">
                      <td className="p-4 text-gray-500">{res.room?.name || '-'}</td>
                      <td className="p-4 pl-8 text-gray-700">— {g.ad_soyad}</td>
                      <td className="p-4 font-mono text-gray-600">{g.tc_no || '-'}</td>
                      <td className="p-4 text-gray-600">{g.dogum_tarihi ? new Date(g.dogum_tarihi).toLocaleDateString('tr-TR') : '-'}</td>
                      <td className="p-4 text-gray-600">{g.cinsiyet || '-'}</td>
                      <td className="p-4 text-gray-600">{g.telefon || '-'}</td>
                      <td className="p-4 text-gray-600 max-w-[200px] truncate">{g.adres || '-'}</td>
                      <td className="p-4 text-gray-500">-</td>
                    </tr>
                  ));

                  return [mainGuestRow, ...additionalRows];
                })}
                {reportData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500 font-medium">Bu tarihte konaklayan aktif misafir bulunmamaktadır.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Room Create / Edit Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
            <h2 className="text-2xl font-extrabold text-gray-900">{selectedRoom ? 'Odayı Düzenle' : 'Yeni Oda Ekle'}</h2>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Oda Adı / Numarası</label>
                <input 
                  type="text" 
                  value={roomForm.name}
                  onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                  placeholder="Örn: Oda 101, Erkek Lojman D2 vb."
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Yatak Kapasitesi</label>
                  <input 
                    type="number" 
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                    min={1}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Oda Türü</label>
                  <select 
                    value={roomForm.room_type}
                    onChange={(e) => setRoomForm({ ...roomForm, room_type: e.target.value as Room['room_type'] })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="Karma">Karma</option>
                    <option value="Erkek">Erkek</option>
                    <option value="Kadın">Kadın</option>
                    <option value="Aile">Aile</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Durum</label>
                <select 
                  value={roomForm.status}
                  onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value as Room['status'] })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="Kullanılabilir">Kullanılabilir</option>
                  <option value="Bakımda">Bakımda</option>
                  <option value="Kapalı">Kapalı</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Açıklama / Bakım Notu</label>
                <textarea 
                  value={roomForm.notes || ''}
                  onChange={(e) => setRoomForm({ ...roomForm, notes: e.target.value })}
                  placeholder="Varsa arıza bildirimi veya genel açıklama..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowRoomModal(false)}
                  className="flex-1 py-3 border rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Guests Modal */}
      {editingGuestsReservation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto my-8">
            <h2 className="text-2xl font-extrabold text-gray-900">Misafirleri Düzenle</h2>
            <form onSubmit={handleEditGuestsSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-700">Odaya Kayıtlı Ek Misafirler</h3>
                  <button
                    type="button"
                    onClick={() => {
                      if (1 + editGuestsForm.length >= (editingGuestsReservation.room?.capacity || 1)) {
                        alert(`Oda kapasitesi (${editingGuestsReservation.room?.capacity}) dolduğu için daha fazla kişi ekleyemezsiniz.`);
                        return;
                      }
                      setEditGuestsForm([...editGuestsForm, { ad_soyad: '', cinsiyet: 'Belirtilmemiş' }]);
                    }}
                    className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-200"
                  >
                    + Misafir Ekle
                  </button>
                </div>

                {editGuestsForm.length === 0 && (
                  <p className="text-sm text-gray-500 italic">Şu an bu odada ana misafir harici kayıtlı kimse yok.</p>
                )}

                {editGuestsForm.map((guest, i) => (
                  <div key={i} className="flex flex-col gap-2 p-3 border rounded-xl bg-gray-50">
                    <div className="flex justify-between">
                      <span className="text-xs font-bold text-gray-500">{i+1}. Ek Misafir</span>
                      <button 
                        type="button" 
                        onClick={() => {
                          const newG = [...editGuestsForm];
                          newG.splice(i, 1);
                          setEditGuestsForm(newG);
                        }}
                        className="text-rose-500 text-xs font-bold hover:underline"
                      >
                        Kaldır
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Ad Soyad</label>
                        <input 
                          type="text" 
                          value={guest.ad_soyad}
                          onChange={(e) => {
                            const newG = [...editGuestsForm];
                            newG[i].ad_soyad = e.target.value;
                            setEditGuestsForm(newG);
                          }}
                          required
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">Cinsiyet</label>
                        <select 
                          value={guest.cinsiyet}
                          onChange={(e) => {
                            const newG = [...editGuestsForm];
                            newG[i].cinsiyet = e.target.value;
                            setEditGuestsForm(newG);
                          }}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="Belirtilmemiş">Belirtilmemiş</option>
                          <option value="Erkek">Erkek</option>
                          <option value="Kadın">Kadın</option>
                          <option value="Erkek Çocuğu">Erkek Çocuğu</option>
                          <option value="Kız Çocuğu">Kız Çocuğu</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase">T.C. No (Opsiyonel)</label>
                        <input 
                          type="text" 
                          maxLength={11}
                          value={guest.tc_no || ''}
                          onChange={(e) => {
                            const newG = [...editGuestsForm];
                            newG[i].tc_no = e.target.value;
                            setEditGuestsForm(newG);
                          }}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setEditingGuestsReservation(null)}
                  className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-200"
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reservation Modal */}
      {showReservationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto my-8">
            <h2 className="text-2xl font-extrabold text-gray-900">Misafir Girişi (Check-in)</h2>
            <form onSubmit={handleResSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ana Misafir (Cari Hesap)</label>
                  <ItemPicker 
                    items={currentAccounts.map(ca => ({ ...ca, display: `${ca.name} (${ca.phone || 'Tel yok'})` }))}
                    value={resForm.guest_ca_id}
                    onChange={(val) => setResForm({ ...resForm, guest_ca_id: val })}
                    displayKey="display"
                    placeholder="Misafir Seçin..."
                    onQuickCreate={(search) => {
                      setQuickCreateSearch(search);
                      setShowQuickCreateModal(true);
                    }}
                    quickCreateLabel="Yeni Misafir Ekle"
                  />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Odalar (Birden fazla seçilebilir)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-2 bg-gray-50/50">
                      {rooms.filter(r => r.status === 'Kullanılabilir').map(room => (
                        <label key={room.id} className={`flex items-center gap-2 p-2 bg-white border rounded-lg cursor-pointer transition-all ${resForm.room_ids.includes(String(room.id)) ? 'border-emerald-500 bg-emerald-50/30 shadow-sm' : 'border-gray-200 hover:border-emerald-300'}`}>
                          <input 
                            type="checkbox" 
                            value={room.id}
                            checked={resForm.room_ids.includes(String(room.id))}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const val = String(room.id);
                              let newRoomIds = resForm.room_ids;
                              if (checked) {
                                newRoomIds = [...resForm.room_ids, val];
                              } else {
                                newRoomIds = resForm.room_ids.filter(id => id !== val);
                              }
                              
                              const newMaxCapacity = newRoomIds.reduce((sum, id) => {
                                return sum + (rooms.find(r => r.id === Number(id))?.available_beds || 0);
                              }, 0) || 1;

                              let newGuestCount = resForm.guest_count;
                              if (newGuestCount > newMaxCapacity) newGuestCount = newMaxCapacity;
                              
                              const newDetails = [...resForm.guest_details];
                              if (newGuestCount < 2) newDetails.length = 0;
                              else newDetails.length = newGuestCount - 1;

                              setResForm({ ...resForm, room_ids: newRoomIds, guest_count: newGuestCount, guest_details: newDetails });
                            }}
                            className="text-emerald-600 rounded focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                          />
                          <span className="text-sm font-bold text-gray-700">{room.name} <span className="text-[10px] text-gray-400 font-normal">({room.capacity} Kişi)</span></span>
                        </label>
                      ))}
                    </div>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Giriş Tarihi</label>
                  <input 
                    type="date" 
                    value={resForm.check_in_date}
                    onChange={(e) => setResForm({ ...resForm, check_in_date: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Çıkış Tarihi</label>
                  <input 
                    type="date" 
                    value={resForm.check_out_date}
                    onChange={(e) => setResForm({ ...resForm, check_out_date: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Toplam Misafir Sayısı</label>
                  <input 
                    type="number" 
                    value={resForm.guest_count}
                    onChange={(e) => {
                      let count = Number(e.target.value);
                      const maxCapacity = resForm.room_ids.reduce((sum, id) => {
                        return sum + (rooms.find(r => r.id === Number(id))?.available_beds || 0);
                      }, 0) || 1;
                      
                      if (count > maxCapacity) count = maxCapacity;

                      const currentDetails = [...resForm.guest_details];
                      // Adjust details array size
                      if (count > 1 && currentDetails.length < count - 1) {
                        const needed = count - 1 - currentDetails.length;
                        for (let i = 0; i < needed; i++) {
                          currentDetails.push({ ad_soyad: '', cinsiyet: 'Belirtilmemiş' });
                        }
                      } else if (count < 2) {
                        currentDetails.length = 0;
                      } else {
                        currentDetails.length = count - 1;
                      }
                      setResForm({ ...resForm, guest_count: count, guest_details: currentDetails });
                    }}
                    min={1}
                    max={resForm.room_ids.reduce((sum, id) => sum + (rooms.find(r => r.id === Number(id))?.available_beds || 0), 0) || 1}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input 
                    type="checkbox" 
                    id="reserves_entire_room"
                    checked={resForm.reserves_entire_room === 1}
                    onChange={(e) => setResForm({ ...resForm, reserves_entire_room: e.target.checked ? 1 : 0 })}
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="reserves_entire_room" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
                    Odayı Aileye / Tamamen Kapat
                  </label>
                </div>
              </div>

              {/* Gender warning message */}
              {checkGenderWarning() && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex gap-3 text-amber-800 text-sm font-semibold">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500" />
                  <div>
                    <p className="font-bold text-amber-900">Cinsiyet Uyuşmazlığı Uyarısı!</p>
                    <p className="text-xs text-amber-700 mt-1">Seçilen odanın türü ile misafirlerin belirtilen cinsiyeti uyuşmamaktadır. Lütfen oda türünü veya misafir bilgilerini kontrol edin.</p>
                  </div>
                </div>
              )}

              {resForm.room_ids.length > 1 && (
                <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-4 mt-6">
                  <p className="text-sm text-blue-700 font-bold">ℹ️ Toplu rezervasyon yapıyorsunuz.</p>
                  <p className="text-xs text-blue-600 mt-1">Toplu rezervasyonlarda "Kişi Sayısı" her bir oda için 1 (sadece asıl misafir) olarak kabul edilir ve diğer misafir bilgileri girilmez.</p>
                </div>
              )}

              {/* Additional Guests Fields */}
              {resForm.room_ids.length === 1 && resForm.guest_count > 1 && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    Diğer Misafir Bilgileri
                  </h3>
                  {resForm.guest_details.map((guest, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-2xl border space-y-3">
                      <p className="text-xs font-bold text-emerald-700">{idx + 2}. Misafir Bilgileri</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <input 
                          type="text" 
                          placeholder="Ad Soyad"
                          required
                          value={guest.ad_soyad}
                          onChange={(e) => {
                            const details = [...resForm.guest_details];
                            details[idx].ad_soyad = e.target.value;
                            setResForm({ ...resForm, guest_details: details });
                          }}
                          className="px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <input 
                          type="text" 
                          placeholder="TC Kimlik No (Opsiyonel)"
                          maxLength={11}
                          value={guest.tc_no || ''}
                          onChange={(e) => {
                            const details = [...resForm.guest_details];
                            details[idx].tc_no = e.target.value;
                            setResForm({ ...resForm, guest_details: details });
                          }}
                          className="px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                        />
                        <select 
                          value={guest.cinsiyet}
                          onChange={(e) => {
                            const details = [...resForm.guest_details];
                            details[idx].cinsiyet = e.target.value;
                            setResForm({ ...resForm, guest_details: details });
                          }}
                          className="px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="Belirtilmemiş">Cinsiyet Seçin</option>
                          <option value="Erkek">Erkek</option>
                          <option value="Kadın">Kadın</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input 
                          type="date" 
                          placeholder="Doğum Tarihi"
                          value={guest.dogum_tarihi || ''}
                          onChange={(e) => {
                            const details = [...resForm.guest_details];
                            details[idx].dogum_tarihi = e.target.value;
                            setResForm({ ...resForm, guest_details: details });
                          }}
                          className="px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <input 
                          type="text" 
                          placeholder="Telefon"
                          value={guest.telefon || ''}
                          onChange={(e) => {
                            const details = [...resForm.guest_details];
                            details[idx].telefon = e.target.value;
                            setResForm({ ...resForm, guest_details: details });
                          }}
                          className="px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Notlar / Açıklama</label>
                <textarea 
                  value={resForm.notes}
                  onChange={(e) => setResForm({ ...resForm, notes: e.target.value })}
                  placeholder="Grup detayları, özel notlar vb..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-24"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowReservationModal(false)}
                  className="flex-1 py-3 border rounded-xl font-bold hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Giriş İşlemini Tamamla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Housekeeping Tab */}
      {activeTab === 'housekeeping' && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100/50">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Kat Hizmetleri ve Temizlik</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">Kirli veya temizlenen odaların durumunu buradan güncelleyin.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.filter(r => r.cleaning_status !== 'Temiz').length === 0 ? (
              <div className="col-span-full py-12 text-center text-emerald-600 font-bold bg-emerald-50 rounded-2xl border border-emerald-100">
                🎉 Harika! Tüm odalar tertemiz.
              </div>
            ) : (
              rooms.filter(r => r.cleaning_status !== 'Temiz').map(room => (
                <div key={room.id} className={`border-2 rounded-2xl p-6 transition-all flex flex-col justify-between ${room.cleaning_status === 'Kirli' ? 'border-rose-500 bg-rose-50' : 'border-amber-500 bg-amber-50'}`}>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{room.name}</h3>
                    <p className={`text-sm font-bold mt-1 ${room.cleaning_status === 'Kirli' ? 'text-rose-600' : 'text-amber-600'}`}>
                      Durum: {room.cleaning_status}
                    </p>
                  </div>
                  <div className="mt-6 flex gap-2">
                    <button
                      onClick={() => handleToggleCleaningStatus(room.id, 'Temiz')}
                      className="flex-1 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      Temizlendi İşaretle
                    </button>
                    {room.cleaning_status === 'Kirli' && (
                      <button
                        onClick={() => handleToggleCleaningStatus(room.id, 'Temizleniyor')}
                        className="flex-1 py-2 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors shadow-sm"
                      >
                        Temizliğe Başla
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Detailed Reports Tab */}
      {activeTab === 'detailed_report' && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100/50">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Detaylı Raporlar ve İstatistikler</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">Misafirhane kullanımına dair 30 günlük trend ve demografik veriler.</p>
            </div>
          </div>

          {!detailedReports ? (
            <div className="text-center py-12 text-gray-500 font-bold">Raporlar yükleniyor...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Trend Chart */}
              <div className="border rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Son 30 Günlük Doluluk Trendi (Misafir Sayısı)</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={detailedReports.trend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => val.slice(5)} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="guests" name="Misafir Sayısı" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gender Chart */}
              <div className="border rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Aktif Konaklayan Cinsiyet Dağılımı</h3>
                <div className="h-[300px] w-full flex justify-center items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={detailedReports.genderDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {detailedReports.genderDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <QuickCreateCurrentAccountModal 
        isOpen={showQuickCreateModal}
        initialName={quickCreateSearch}
        defaultTypeName="Misafir"
        onClose={() => setShowQuickCreateModal(false)}
        onCreated={(newAccount) => {
          setCurrentAccounts([...currentAccounts, newAccount]);
          setResForm({ ...resForm, guest_ca_id: String(newAccount.id) });
        }}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api, API_URL } from './api';
import { PluginContext } from './PluginContext';
import { 
  Users, Wallet, Package, Home, Settings as SettingsIcon, LogOut, FileText, 
  ChevronRight, Building2, UserCircle, HandCoins, Activity, FileCheck, 
  MapPin, CheckSquare, Phone, Calendar, HeartHandshake, Database, Mail, 
  ShieldCheck, ArrowRightLeft, FolderKanban, Receipt, Box, Archive, Blocks,
  ChefHat, BookOpen, Contact, GraduationCap, Car, Bell, Hotel, MessageSquare
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

export function DashboardHome() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    api.get('/dashboard/metrics').then(res => {
      setMetrics(res.data);
    }).catch(err => console.error("Metrics error:", err));
  }, []);

  if (!metrics) return <div className="p-8 flex justify-center"><div className="animate-pulse flex space-x-4"><div className="rounded-full bg-emerald-200 h-10 w-10"></div><div className="flex-1 space-y-6 py-1"><div className="h-2 bg-emerald-200 rounded"></div><div className="space-y-3"><div className="grid grid-cols-3 gap-4"><div className="h-2 bg-emerald-200 rounded col-span-2"></div><div className="h-2 bg-emerald-200 rounded col-span-1"></div></div><div className="h-2 bg-emerald-200 rounded"></div></div></div></div></div>;

  return (
    <div className="space-y-6">
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {[
          { title: 'İhtiyaç Havuzu', value: metrics.totalHouseholds || 0, icon: HeartHandshake, color: 'text-rose-600', bg: 'bg-rose-50', link: '/households' },
          { title: 'Toplam Cari', value: metrics.totalCurrentAccounts, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', link: '/current-accounts' },
          { title: 'Aktif Projeler', value: metrics.totalProjects, icon: FolderKanban, color: 'text-orange-600', bg: 'bg-orange-50', link: '/projects' },
          { title: 'Kasa Bakiye', value: `₺${(metrics.totalBalance || 0).toLocaleString('tr-TR')}`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/wallets' },
          { title: 'Sistem Kullanıcısı', value: metrics.totalUsers, icon: Contact, color: 'text-purple-600', bg: 'bg-purple-50', link: '/users' }
        ].map((stat, i) => (
          <Link to={stat.link} key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center items-center gap-3 transition-all hover:shadow-md hover:-translate-y-1 duration-300 text-center cursor-pointer">
            <div className={`p-4 rounded-full ${stat.bg}`}>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grafik Bölümü */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Aylık Bağış & Gider Trendi</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.monthlyTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBagis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGider" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dx={-10} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 500 }}
                />
                <Area type="monotone" dataKey="bagis" name="Bağış/Gelir" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorBagis)" />
                <Area type="monotone" dataKey="gider" name="Gider" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorGider)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Son Hareketler */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Son Kasa Hareketleri</h3>
          <div className="space-y-6">
            {metrics.recentTransactions.map((tx: any) => (
              <div key={tx.id} className="flex items-start gap-4">
                <div className={`p-2 rounded-full mt-1 ${tx.type === 'in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {tx.type === 'in' ? <span className="text-xl leading-none block">+</span> : <span className="text-xl leading-none block">-</span>}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{tx.description || (tx.type === 'in' ? 'Gelir Eklendi' : 'Gider Eklendi')}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(tx.createdAt).toLocaleDateString('tr-TR')} - Kasa İşlemi</p>
                </div>
                <div className={`font-semibold ${tx.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'in' ? '+' : '-'}₺{Number(tx.amount).toLocaleString('tr-TR')}
                </div>
              </div>
            ))}
            {metrics.recentTransactions.length === 0 && (
              <div className="text-center text-gray-500 py-4 text-sm">Henüz kasa hareketi bulunmuyor.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ children }: { children?: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const [userRole, setUserRole] = useState<string>('user');
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [activePlugins, setActivePlugins] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Notification States
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    // Sadece aktif eklentileri çek (Sol menüde göstermek için)
    api.get('/system-plugins').then(res => {
      setActivePlugins(res.data.filter((p: any) => p.isActive).map((p: any) => p.identifier));
    }).catch(err => console.error("Eklentiler yüklenirken hata oluştu:", err));
    
    // Parse JWT token for roles and permissions
    const token = localStorage.getItem('token');
    let currentUserId = null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role || 'user');
        setUserPermissions(payload.permissions || []);
        currentUserId = payload.sub;
        setUserId(currentUserId);
      } catch (e) {
        console.error("Token parse error", e);
      }
    }

    if (currentUserId) {
      // Fetch initial notifications
      api.get('/notifications').then(res => {
        setNotifications(res.data);
      }).catch(err => console.error("Bildirimler yüklenemedi", err));

      // Connect WebSocket
      const socket: Socket = io(API_URL.replace('/api', ''), {
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        socket.emit('register', { userId: currentUserId });
      });

      socket.on('notification', (notif) => {
        setNotifications(prev => [notif, ...prev]);
      });

      return () => {
        // StrictMode çift render sırasında WebSocket hatası vermemesi için küçük bir gecikme
        setTimeout(() => {
          if (socket.connected) {
            socket.disconnect();
          }
        }, 1000);
      };
    }
  }, []);

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const baseNavItems = [
    { name: 'Ana Sayfa', path: '/', icon: Home, pluginId: 'core' },
    { name: 'Cari Hesaplar', path: '/current-accounts', icon: Users, pluginId: 'current-accounts' },
    { name: 'Kasalar & Finans', path: '/wallets', icon: Wallet, pluginId: 'wallets' },
    { name: 'Kurban Modülü', path: '/sacrifices', icon: Package, pluginId: 'sacrifices' },
    { name: 'Personel Yönetimi', path: '/personnel', icon: Contact, pluginId: 'personnel' },
    { name: 'Burs Yönetimi', path: '/scholarships', icon: GraduationCap, pluginId: 'scholarships' },
    { name: 'Demirbaşlar', path: '/assets', icon: Package, pluginId: 'assets' },
    { name: 'Lojmanlar', path: '/lodgings', icon: Building2, pluginId: 'lodgings' },
    { name: 'Misafirhane', path: '/accommodations', icon: Hotel, pluginId: 'accommodations' },
    { name: 'Depolar', path: '/warehouses', icon: Archive, pluginId: 'warehouses' },
    { name: 'Ayni Yardım (Stok)', path: '/stock', icon: Package, pluginId: 'stock' },
    { name: 'Kişisel Görevlerim', path: '/todos', icon: CheckSquare, pluginId: 'todos' },
    { name: 'Görevler', path: '/tasks', icon: CheckSquare, pluginId: 'tasks' },
    { name: 'Projeler', path: '/projects', icon: FolderKanban, pluginId: 'projects' },
    { name: 'Aile, Yetim ve Yardım', path: '/households', icon: Users, pluginId: 'households' },
    { name: 'Masraf Merkezleri', path: '/cost-centers', icon: Building2, pluginId: 'cost-centers' },
    { name: 'Aşevi ve Yemek Dağıtım', path: '/soup-kitchen', icon: ChefHat, pluginId: 'soup-kitchen' },
    { name: 'Araç Yönetimi', path: '/vehicles', icon: Car, pluginId: 'vehicles' },
    { name: 'İletişim', path: '/communications', icon: MessageSquare, pluginId: 'core' },
    { name: 'Takvim', path: '/calendar', icon: Calendar, pluginId: 'events' },
    { name: 'Sponsorluklar', path: '/sponsorships', icon: HeartHandshake, pluginId: 'sponsorships' },
    { name: 'Yayınlar', path: '/publications', icon: BookOpen, pluginId: 'publications' },
    { name: 'Kullanıcılar', path: '/users', icon: Users, pluginId: 'core' },
    { name: 'Roller ve Yetkiler', path: '/roles', icon: Users, pluginId: 'core' },
    { name: 'Sistem Ayarları', path: '/settings', icon: SettingsIcon, pluginId: 'core' },
    { name: 'Raporlar ve Yedekleme', path: '/reports', icon: Archive, pluginId: 'core' },
  ];

  const hasAccess = (item: any) => {
    if (userRole === 'Admin' || userPermissions.includes('all')) return true;
    if (item.path === '/') return true;
    return userPermissions.includes(`view:${item.pluginId}`);
  };

  const navItems = baseNavItems.filter(item => 
    (item.pluginId === 'core' || activePlugins.includes(item.pluginId)) && hasAccess(item)
  );

  const bottomNavItems = [
    { name: 'Ayarlar', path: '/settings', icon: SettingsIcon },
    { name: 'Eklentiler', path: '/plugins', icon: Blocks },
  ].filter(item => hasAccess({ path: item.path, pluginId: 'core' }));

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p);
    
    if (paths.length === 0) {
      return <span className="text-gray-800 font-medium">Ana Sayfa</span>;
    }

    const breadcrumbs = [];
    breadcrumbs.push(
      <Link key="home" to="/" className="text-gray-500 hover:text-emerald-600 transition-colors">Ana Sayfa</Link>
    );

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const isLast = index === paths.length - 1;
      
      let label = path;
      if (path === 'wallets') label = 'Kasalar & Finans';
      else if (path === 'current-accounts') label = 'Cari Hesaplar';
      else if (path === 'sacrifices') label = 'Kurban Modülü';
      else if (path === 'soup-kitchen') label = 'Aşevi ve Yemek Dağıtım';
      else if (path === 'plugins') label = 'Eklentiler';
      else if (path === 'settings') label = 'Ayarlar';
      else if (paths[0] === 'wallets' && index === 1) label = 'Kasa Detayı'; 
      else if (paths[0] === 'current-accounts' && index === 1) label = 'Hesap Detayı';

      breadcrumbs.push(
        <ChevronRight key={`sep-${index}`} className="h-4 w-4 text-gray-400 mx-2" />
      );
      
      if (isLast) {
        breadcrumbs.push(<span key={currentPath} className="text-gray-800 font-medium">{label}</span>);
      } else {
        breadcrumbs.push(
          <Link key={currentPath} to={currentPath} className="text-gray-500 hover:text-emerald-600 transition-colors">
            {label}
          </Link>
        );
      }
    });

    return <div className="flex items-center text-sm">{breadcrumbs}</div>;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-emerald-800 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-extrabold tracking-tight">Vakıf Yönetim</h1>
        </div>
        
        {/* Main Nav */}
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  active ? 'bg-emerald-900 text-white' : 'text-emerald-100 hover:bg-emerald-700'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Nav (System) */}
        <div className="px-4 py-4 space-y-2">
          <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-2 px-4">Sistem</div>
          {bottomNavItems.map((item) => {
            const active = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  active ? 'bg-emerald-900 text-white' : 'text-emerald-100 hover:bg-emerald-700'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-emerald-700">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10 h-16 flex items-center justify-between px-8 border-b border-gray-100">
          {getBreadcrumbs()}
          
          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 top-12 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="font-semibold text-gray-800">Bildirimler</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                      Tümünü Okundu İşaretle
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Bildirim bulunmuyor.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notif: any) => (
                        <div 
                          key={notif.id} 
                          className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-emerald-50/50' : ''}`}
                          onClick={() => markAsRead(notif.id)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                              {notif.title}
                            </h4>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                              {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">{notif.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              {userId ? userId.toString().charAt(0) : 'U'}
            </div>
          </div>
        </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              <PluginContext.Provider value={{ activePlugins }}>
                {children}
              </PluginContext.Provider>
            </div>
        </main>
      </div>
    </div>
  );
}

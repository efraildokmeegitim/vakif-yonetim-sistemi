import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Shield, Users, Save, Check, Plus, Edit2, Trash2, Settings, Lock } from 'lucide-react';

export default function Roles() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'roles' | 'users'>('roles');
  
  // Feedback
  const [savedUserId, setSavedUserId] = useState<number | null>(null);

  // Role Form Modal State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [roleForm, setRoleForm] = useState<{ name: string; description: string; permissionIds: number[] }>({
    name: '',
    description: '',
    permissionIds: []
  });

  // New Permission Form State
  const [newPermForm, setNewPermForm] = useState({ action: '', description: '' });
  const [showAddPermForm, setShowAddPermForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes, permRes] = await Promise.all([
        api.get('/users'),
        api.get('/users/roles'),
        api.get('/users/permissions').catch(() => ({ data: [] })) // In case it hasn't finished seeding yet
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
      setPermissions(permRes.data);
    } catch (err) {
      console.error("Veriler yüklenirken hata oluştu", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserRoleChange = async (userId: number, roleId: number) => {
    try {
      await api.patch(`/users/${userId}`, { roleId });
      setSavedUserId(userId);
      setTimeout(() => setSavedUserId(null), 2000);
      setUsers(users.map(u => {
        if (u.id === userId) {
          return { ...u, roleObject: roles.find(r => r.id === roleId) };
        }
        return u;
      }));
    } catch (err) {
      console.error("Kullanıcı yetkisi güncellenemedi", err);
      alert("Rol güncellenirken hata oluştu.");
    }
  };

  const handleOpenCreateRole = () => {
    setEditingRoleId(null);
    setRoleForm({ name: '', description: '', permissionIds: [] });
    setIsRoleModalOpen(true);
  };

  const handleOpenEditRole = (role: any) => {
    setEditingRoleId(role.id);
    setRoleForm({
      name: role.name,
      description: role.description || '',
      permissionIds: role.permissions?.map((p: any) => p.id) || []
    });
    setIsRoleModalOpen(true);
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name.trim()) return;

    try {
      if (editingRoleId) {
        await api.patch(`/users/roles/${editingRoleId}`, roleForm);
      } else {
        await api.post('/users/roles', roleForm);
      }
      setIsRoleModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Rol kaydedilirken hata oluştu');
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!window.confirm('Bu rolü silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/users/roles/${roleId}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Rol silinemedi');
    }
  };

  const togglePermission = (permId: number) => {
    if (roleForm.permissionIds.includes(permId)) {
      setRoleForm({ ...roleForm, permissionIds: roleForm.permissionIds.filter(id => id !== permId) });
    } else {
      setRoleForm({ ...roleForm, permissionIds: [...roleForm.permissionIds, permId] });
    }
  };

  const handleCreatePermission = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newPermForm.action.trim()) {
      alert('Yetki kodu boş bırakılamaz!');
      return;
    }
    try {
      const res = await api.post('/users/permissions', newPermForm);
      setPermissions(prev => [...prev, res.data].sort((a, b) => (a.description || a.action).localeCompare(b.description || b.action)));
      setRoleForm(prev => ({ ...prev, permissionIds: [...prev.permissionIds, res.data.id] }));
      setNewPermForm({ action: '', description: '' });
      setShowAddPermForm(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Yetki oluşturulurken hata oluştu');
    }
  };

  const getGroupedPermissions = () => {
    const groups: Record<string, any[]> = {};
    permissions.forEach(p => {
      let groupName = 'Diğer Genel Yetkiler';
      if (p.action === 'all') {
        groupName = 'Süper Yönetici Yetkisi';
      } else if (p.action.includes(':')) {
        const parts = p.action.split(':');
        const resource = parts[1];
        if (resource === 'current-accounts') groupName = 'Cari Hesap Yönetimi';
        else if (resource === 'wallets') groupName = 'Kasa & Finans';
        else if (resource === 'sacrifices') groupName = 'Kurban Modülü';
        else if (resource === 'personnel') groupName = 'Personel';
        else if (resource === 'scholarships') groupName = 'Burs Modülü';
        else if (resource === 'assets') groupName = 'Demirbaş';
        else if (resource === 'lodgings') groupName = 'Lojman';
        else if (resource === 'warehouses') groupName = 'Depo Yönetimi';
        else if (resource === 'stock') groupName = 'Ayni Yardım (Stok)';
        else if (resource === 'tasks') groupName = 'Görevler';
        else if (resource === 'projects') groupName = 'Projeler';
        else if (resource === 'soup-kitchen') groupName = 'Aşevi';
        else if (resource === 'vehicles') groupName = 'Araç Yönetimi';
        else if (resource === 'sponsorships') groupName = 'Sponsorluklar';
        else if (resource === 'publications') groupName = 'Yayın Yönetimi';
        else if (resource === 'users') groupName = 'Kullanıcı Yönetimi';
        else if (resource === 'settings') groupName = 'Sistem Ayarları';
        else if (resource === 'reports') groupName = 'Raporlama & Yedekleme';
      }
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(p);
    });
    return groups;
  };

  if (loading) return <div className="text-center py-10">Yükleniyor...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald-600" />
            Roller ve Yetkiler
          </h1>
          <p className="text-gray-500 mt-1">Sistem içi erişim izinlerini ve kullanıcı rollerini yönetin.</p>
        </div>
        {activeTab === 'roles' && (
          <button
            onClick={handleOpenCreateRole}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Yeni Rol Ekle
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`pb-3 pt-2 font-semibold text-sm border-b-2 transition-colors mr-6 flex items-center gap-2 ${
            activeTab === 'roles' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('roles')}
        >
          <Settings className="w-4 h-4" /> Rol & Yetki Tanımları
        </button>
        <button
          className={`pb-3 pt-2 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'users' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('users')}
        >
          <Users className="w-4 h-4" /> Kullanıcı Rol Atamaları
        </button>
      </div>

      {/* Tab 1: Roles and Permissions Grid */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map(role => (
            <div key={role.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    {role.name}
                    {role.name === 'Admin' && (
                      <span className="bg-red-100 text-red-800 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Sistem</span>
                    )}
                  </h3>
                  {role.name !== 'Admin' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEditRole(role)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-4">{role.description || 'Açıklama girilmemiş.'}</p>
                
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Yetki Detayları ({role.permissions?.length || 0}):</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {role.permissions?.map((p: any) => (
                      <span key={p.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {p.description || p.action}
                      </span>
                    ))}
                    {(!role.permissions || role.permissions.length === 0) && (
                      <span className="text-xs text-gray-400 italic">Yetki atanmamış.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: User Role Allocation */}
      {activeTab === 'users' && (
        <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
          <div className="divide-y divide-gray-200">
            {users.map(user => (
              <div key={user.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={user.roleObject?.id || ''}
                    onChange={(e) => handleUserRoleChange(user.id, parseInt(e.target.value))}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-w-[220px] transition-all"
                  >
                    <option value="" disabled>Rol Seçin</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                  <div className="w-8 flex justify-center">
                    {savedUserId === user.id && (
                      <span className="flex items-center text-emerald-600">
                        <Check className="h-5 w-5 animate-scale" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="p-8 text-center text-gray-500">Kullanıcı bulunamadı.</div>
            )}
          </div>
        </div>
      )}

      {/* Role Create/Edit Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 transform scale-100 transition-transform duration-300">
            <div className="p-6 border-b border-gray-100/80 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
                    <Shield className="h-5 w-5" />
                  </div>
                  {editingRoleId ? 'Rol Tanımını Düzenle' : 'Yeni Rol Oluştur'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">Sistem içi yetkilendirme şablonunu yapılandırın.</p>
              </div>
              <button 
                onClick={() => setIsRoleModalOpen(false)} 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full transition-colors"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleRoleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Rol Adı</label>
                  <input
                    required
                    type="text"
                    placeholder="Örn: Muhasebe Sorumlusu"
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm font-medium"
                    value={roleForm.name}
                    onChange={e => setRoleForm({ ...roleForm, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Açıklama</label>
                  <input
                    type="text"
                    placeholder="Görev ve yetki sınırları"
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 transition-all text-sm"
                    value={roleForm.description}
                    onChange={e => setRoleForm({ ...roleForm, description: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" /> Yetki Seçimleri
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddPermForm(!showAddPermForm)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                  >
                    {showAddPermForm ? 'Kapat' : '+ Özel Yetki Tanımla'}
                  </button>
                </div>

                {showAddPermForm && (
                  <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/30 p-4 rounded-2xl border border-emerald-100/70 mb-4 space-y-3 shadow-inner">
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Yeni Sistem Yetkisi Tanımla</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Yetki Kodu (Action)</label>
                        <input
                          type="text"
                          placeholder="Örn: view:dashboard"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                          value={newPermForm.action}
                          onChange={e => setNewPermForm({ ...newPermForm, action: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Yetki Açıklaması</label>
                        <input
                          type="text"
                          placeholder="Örn: Paneli Görüntüle"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-emerald-500 transition-all"
                          value={newPermForm.description}
                          onChange={e => setNewPermForm({ ...newPermForm, description: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddPermForm(false)}
                        className="px-3 py-1.5 text-xs text-gray-600 hover:bg-white rounded-lg border border-gray-100 transition-colors"
                      >
                        İptal
                      </button>
                      <button
                        type="button"
                        onClick={handleCreatePermission}
                        className="px-4 py-1.5 text-xs bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Sisteme Ekle
                      </button>
                    </div>
                  </div>
                )}

                {/* Grouped Permissions Checklist */}
                <div className="border border-gray-200/80 rounded-2xl max-h-[45vh] overflow-y-auto p-4 space-y-5 bg-gray-50/50 shadow-inner">
                  {Object.entries(getGroupedPermissions()).map(([groupName, groupPerms]) => (
                    <div key={groupName} className="space-y-2">
                      <h4 className="text-xs font-bold text-emerald-800/90 border-b border-gray-200 pb-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                        {groupName}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {groupPerms.map(perm => {
                          const checked = roleForm.permissionIds.includes(perm.id);
                          return (
                            <label 
                              key={perm.id} 
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                                checked 
                                  ? 'bg-emerald-50/60 border-emerald-200 shadow-sm' 
                                  : 'bg-white border-gray-100 hover:border-gray-200/80 hover:bg-white shadow-sm'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => togglePermission(perm.id)}
                                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500/20"
                              />
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-800 text-xs truncate">{perm.description || perm.action}</p>
                                <p className="text-[9px] text-gray-400 font-mono truncate">{perm.action}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {permissions.length === 0 && (
                    <p className="text-sm text-gray-400 italic text-center py-6">Yetki bulunamadı.</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/20 -mx-6 -mb-6 p-6">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/10 text-sm"
                >
                  Kaydet ve Kapat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

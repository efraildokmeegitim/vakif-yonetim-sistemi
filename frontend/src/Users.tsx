import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Plus, Edit2, Trash2, FileSpreadsheet, UserCircle } from 'lucide-react';
import ExcelImportModal from './components/ExcelImportModal';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: string;
  createdAt: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ email: '', passwordHash: '', firstName: '', lastName: '', role: 'user', isActive: true });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        // Do not send empty password on update
        const payload: any = { ...form };
        if (!payload.passwordHash) delete payload.passwordHash;
        await api.patch(`/users/${editingId}`, payload);
      } else {
        await api.post('/users', form);
      }
      setShowModal(false);
      setEditingId(null);
      setForm({ email: '', passwordHash: '', firstName: '', lastName: '', role: 'user', isActive: true });
      fetchUsers();
    } catch (error) {
      console.error('Error saving user', error);
      alert('Kullanıcı kaydedilirken hata oluştu.');
    }
  };

  const handleEdit = (user: User) => {
    setForm({ email: user.email, passwordHash: '', firstName: user.firstName, lastName: user.lastName, role: user.role, isActive: user.isActive });
    setEditingId(user.id);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Emin misiniz?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user', error);
    }
  };

  const toggleStatus = async (user: User) => {
    try {
      await api.patch(`/users/${user.id}`, { isActive: !user.isActive });
      fetchUsers();
    } catch (error) {
      console.error('Error toggling status', error);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Sistem Kullanıcıları</h1>
        <div className="flex gap-3">
          <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
            <FileSpreadsheet size={20} />
            İçe Aktar
          </button>
          <button onClick={() => { setEditingId(null); setForm({ email: '', passwordHash: '', firstName: '', lastName: '', role: 'user', isActive: true }); setShowModal(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Plus size={20} />
            Yeni Kullanıcı
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-600">ID</th>
              <th className="px-6 py-4 font-medium text-gray-600">İsim</th>
              <th className="px-6 py-4 font-medium text-gray-600">E-Posta</th>
              <th className="px-6 py-4 font-medium text-gray-600">Yetki</th>
              <th className="px-6 py-4 font-medium text-gray-600">Durum</th>
              <th className="px-6 py-4 font-medium text-gray-600 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">#{u.id}</td>
                <td className="px-6 py-4 font-medium">{u.firstName} {u.lastName}</td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4 capitalize">{u.role}</td>
                <td className="px-6 py-4">
                  <button onClick={() => toggleStatus(u)} className={`px-2 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.isActive ? 'Aktif' : 'Pasif'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(u)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(u.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white/95 backdrop-blur rounded-3xl p-6 w-full max-w-md border border-gray-100 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <UserCircle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Kaydı'}</h2>
                <p className="text-xs text-gray-500 mt-0.5">Sistem kullanıcısı bilgilerini yapılandırın.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Ad</label>
                  <input type="text" placeholder="Örn: Ahmet" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Soyad</label>
                  <input type="text" placeholder="Örn: Yılmaz" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">E-Posta</label>
                <input type="email" placeholder="isim@domain.com" className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Şifre {editingId && <span className="text-[10px] text-gray-400 capitalize font-normal">(Boş bırakılabilir)</span>}</label>
                <input type="password" placeholder={editingId ? '••••••••' : 'Şifre belirleyin'} className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm" value={form.passwordHash} onChange={e => setForm({...form, passwordHash: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Yetki (Rol)</label>
                <select className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all text-sm font-medium text-gray-700" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                  <option value="user">Standart Kullanıcı</option>
                  <option value="editor">Editör</option>
                  <option value="admin">Sistem Yöneticisi</option>
                </select>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 -mx-6 -mb-6 p-6 bg-gray-50/30">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm">İptal</button>
                <button onClick={handleSave} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/10 text-sm">Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ExcelImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={fetchUsers}
        endpoint="/users/import"
        title="Kullanıcıları İçe Aktar"
        templateHeaders={['İsim', 'Soyisim', 'E-posta', 'Durum', 'Şifre']}
        templateFileName="kullanici_sablonu.xlsx"
      />
    </div>
  );
}

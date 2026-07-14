import React, { useState, useEffect } from 'react';
import { Plus, Search, Check, AlertCircle, Trash2, Edit2, ShieldCheck, Heart, FileText, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from './api';
import ItemPicker from './components/ItemPicker';
import QuickCreateCurrentAccountModal from './QuickCreateCurrentAccountModal';

export default function Sacrifices() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [currentAccounts, setCurrentAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedGroupIdForShare, setSelectedGroupIdForShare] = useState<number | null>(null);
  const [editingShareId, setEditingShareId] = useState<number | null>(null);
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);
  const [newAccountContext, setNewAccountContext] = useState<'donor' | 'partner'>('donor');
  const [isBulkTransferModalOpen, setIsBulkTransferModalOpen] = useState(false);
  const [isBulkSelectionMode, setIsBulkSelectionMode] = useState(false);
  const [accountTypes, setAccountTypes] = useState<any[]>([]);
  
  // Partner State
  const [isBulkPartnerModalOpen, setIsBulkPartnerModalOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [partnerSharesForm, setPartnerSharesForm] = useState<any[]>([]);
  const [isPartnerReportModalOpen, setIsPartnerReportModalOpen] = useState(false);
  const [partnerReportData, setPartnerReportData] = useState<any>(null);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [debtForm, setDebtForm] = useState({ amount: '', currency: 'TRY', description: '' });

  // Report State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);

  // Bulk Transfer State
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [bulkTransferForm, setBulkTransferForm] = useState({
    transferredInstitution: '',
    purchaseCosts: [{ currency: 'TRY', amount: '' }]
  });

  // Forms
  const [campaignForm, setCampaignForm] = useState({ year: new Date().getFullYear(), name: '', startDate: '', endDate: '', currency: 'TRY', defaultSharePrice: '' });
  const [groupForm, setGroupForm] = useState({ 
    name: '', 
    animalType: 'Büyükbaş',
    status: 'Bekliyor',
    purchaseCosts: [{ currency: 'TRY', amount: '' }],
    slaughterCosts: [{ currency: 'TRY', amount: '' }],
    transferredInstitution: '',
    distributionLocation: '',
    beneficiaryCount: ''
  });
  const [shareForm, setShareForm] = useState({ donorId: '', shareType: 'Vacip', amountPaid: '', currency: 'TRY', isProxyGiven: false });
  const [newAccountForm, setNewAccountForm] = useState({ name: '', phone: '', email: '', accountCategory: 'Bireysel', typeIds: [] as number[] });

  // Tab & Search State
  const [activeTab, setActiveTab] = useState<'Bekleyenler' | 'Kesilenler' | 'Aktarılanlar' | 'OrtakKuruluşlar'>('Bekleyenler');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const partnerAccounts = currentAccounts.filter(acc => 
    acc.types && acc.types.some((t: any) => t.name === 'Partner Kurum ve Kuruluşlar')
  );

  useEffect(() => {
    // Reset selected groups when tab changes
    setSelectedGroups([]);
    setIsBulkSelectionMode(false);
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [campaignsRes, accountsRes, typesRes] = await Promise.all([
        api.get('/sacrifices/campaigns'),
        api.get('/current-accounts'),
        api.get('/current-account-types')
      ]);
      setCampaigns(campaignsRes.data);
      setCurrentAccounts(accountsRes.data);
      setAccountTypes(typesRes.data);
      if (campaignsRes.data.length > 0 && !selectedCampaignId) {
        setSelectedCampaignId(campaignsRes.data[0].id);
      }
    } catch (error) {
      console.error('Veriler yüklenemedi', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    if (!selectedCampaignId) return;
    try {
      const res = await api.get(`/sacrifices/campaigns/${selectedCampaignId}/groups`);
      setGroups(res.data);
    } catch (error) {
      console.error('Gruplar yüklenemedi', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [selectedCampaignId]);

  const handleCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/sacrifices/campaigns', { ...campaignForm, defaultSharePrice: Number(campaignForm.defaultSharePrice) });
    setIsCampaignModalOpen(false);
    fetchData();
  };

  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId) return;
    try {
      const mappedPurchaseCosts: Record<string, number> = {};
      groupForm.purchaseCosts.forEach(c => {
        if (c.amount && !isNaN(Number(c.amount))) mappedPurchaseCosts[c.currency] = (mappedPurchaseCosts[c.currency] || 0) + Number(c.amount);
      });

      const mappedSlaughterCosts: Record<string, number> = {};
      groupForm.slaughterCosts.forEach(c => {
        if (c.amount && !isNaN(Number(c.amount))) mappedSlaughterCosts[c.currency] = (mappedSlaughterCosts[c.currency] || 0) + Number(c.amount);
      });

      const payload = {
        campaignId: selectedCampaignId,
        name: groupForm.name,
        animalType: groupForm.animalType,
        status: groupForm.status,
        transferredInstitution: groupForm.status === 'Aktarıldı' ? groupForm.transferredInstitution : null,
        purchaseCosts: (groupForm.status === 'Kesildi' || groupForm.status === 'Aktarıldı') ? mappedPurchaseCosts : null,
        slaughterCosts: groupForm.status === 'Kesildi' ? mappedSlaughterCosts : null,
        distributionLocation: groupForm.status === 'Dağıtıldı' ? groupForm.distributionLocation : null,
        beneficiaryCount: groupForm.status === 'Dağıtıldı' && groupForm.beneficiaryCount ? Number(groupForm.beneficiaryCount) : null
      };

      if (editingGroupId) {
        await api.patch(`/sacrifices/groups/${editingGroupId}`, payload);
      } else {
        await api.post('/sacrifices/groups', payload);
      }
      setIsGroupModalOpen(false);
      setEditingGroupId(null);
      fetchGroups();
    } catch(err: any) {
      alert(err.response?.data?.message || 'Hata oluştu');
    }
  };

  const handleBulkTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGroups.length === 0) return;
    try {
      const pCosts: Record<string, number> = {};
      bulkTransferForm.purchaseCosts.forEach(c => {
        if (c.amount) pCosts[c.currency] = (pCosts[c.currency] || 0) + Number(c.amount);
      });
      
      await api.post('/sacrifices/groups/bulk-transfer', {
        groupIds: selectedGroups,
        transferredInstitution: bulkTransferForm.transferredInstitution,
        purchaseCosts: Object.keys(pCosts).length > 0 ? pCosts : {}
      });
      
      setIsBulkTransferModalOpen(false);
      setSelectedGroups([]);
      setBulkTransferForm({ transferredInstitution: '', purchaseCosts: [{ currency: 'TRY', amount: '' }] });
      fetchGroups();
    } catch(err: any) {
      alert(err.response?.data?.message || 'Toplu aktarım sırasında hata oluştu');
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!window.confirm('Bu kurban grubunu silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/sacrifices/groups/${groupId}`);
      fetchGroups();
    } catch(err: any) {
      alert(err.response?.data?.message || 'Silme işlemi başarısız. Grubun içinde hisse kalmadığından emin olun.');
    }
  };

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupIdForShare) return;
    try {
      if (editingShareId) {
        await api.patch(`/sacrifices/shares/${editingShareId}`, {
          ...shareForm,
          donorId: Number(shareForm.donorId),
          amountPaid: Number(shareForm.amountPaid)
        });
      } else {
        await api.post('/sacrifices/shares', { 
          ...shareForm, 
          groupId: selectedGroupIdForShare,
          donorId: Number(shareForm.donorId),
          amountPaid: Number(shareForm.amountPaid)
        });
      }
      setIsShareModalOpen(false);
      setEditingShareId(null);
      fetchGroups();
    } catch (err: any) {
      alert(err.response?.data?.message || 'İşlem başarısız oldu');
    }
  };

  const handleDeleteShare = async (shareId: number) => {
    if (!window.confirm('Bu hisseyi iptal etmek/silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/sacrifices/shares/${shareId}`);
      fetchGroups();
    } catch(err: any) {
      alert(err.response?.data?.message || 'Silme işlemi başarısız');
    }
  };
  const handleOpenReport = async () => {
    if (!selectedCampaignId) return;
    setIsReportModalOpen(true);
    setIsReportLoading(true);
    try {
      const res = await api.get(`/sacrifices/campaigns/${selectedCampaignId}/report`);
      setReportData(res.data);
    } catch (err) {
      console.error(err);
      alert('Rapor yüklenemedi');
    } finally {
      setIsReportLoading(false);
    }
  };

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  const fetchPartnerReport = async (partnerId: number) => {
    if (!selectedCampaignId) return;
    setIsReportLoading(true);
    try {
      const response = await api.get(`/sacrifices/campaigns/${selectedCampaignId}/partners/${partnerId}/report`);
      setPartnerReportData(response.data);
      setIsPartnerReportModalOpen(true);
    } catch (error) {
      console.error('Partner raporu alınamadı:', error);
    } finally {
      setIsReportLoading(false);
    }
  };

  const handlePayDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId || !partnerReportData?.shares?.[0]?.partnerId) return;
    try {
      await api.post(`/sacrifices/campaigns/${selectedCampaignId}/partners/${partnerReportData.shares[0].partnerId}/pay-debt`, {
        amount: Number(debtForm.amount),
        currency: debtForm.currency,
        description: debtForm.description
      });
      setIsDebtModalOpen(false);
      setDebtForm({ amount: '', currency: 'TRY', description: '' });
      // Refresh report
      fetchPartnerReport(partnerReportData.shares[0].partnerId);
    } catch (error: any) {
      alert('Tahsilat eklenirken hata oluştu: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleBulkPartnerSharesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId || !selectedPartnerId) return;
    try {
      const sharesToSubmit = partnerSharesForm.map(s => ({
        ...s,
        ad_soyad: s.ad_soyad || undefined,
        tc_no: s.tc_no || undefined,
        telefon: s.telefon || undefined,
        amountPaid: s.amountPaid ? Number(s.amountPaid) : 0,
      }));
      await api.post(`/sacrifices/partner-shares`, {
        campaignId: selectedCampaignId,
        partnerId: selectedPartnerId,
        shares: sharesToSubmit
      });
      setIsBulkPartnerModalOpen(false);
      setPartnerSharesForm([]);
      fetchGroups();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Toplu partner hissesi eklenemedi');
    }
  };

  const sendSmsToShareholder = async (shareId: number) => {
    try {
      await api.post(`/sacrifices/shares/${shareId}/send-sms`);
      fetchGroups();
      alert('SMS başarıyla gönderildi (MOCK).');
    } catch (error: any) {
      alert(error.response?.data?.message || 'SMS gönderilemedi');
    }
  };

  // Filter groups based on active tab and search filters
  const filteredGroups = groups.filter(group => {
    // 1. Tab filter
    if (activeTab === 'Bekleyenler' && group.status !== 'Bekliyor' && group.status) return false;
    if (activeTab === 'Kesilenler' && group.status !== 'Kesildi' && group.status !== 'Dağıtıldı') return false;
    if (activeTab === 'Aktarılanlar' && group.status !== 'Aktarıldı') return false;

    // 2. Status dropdown filter
    if (filterStatus && group.status !== filterStatus) return false;

    // 3. Animal type filter
    if (filterType && group.animalType !== filterType) return false;

    // 4. Search query (group name or donor name)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchGroup = group.name.toLowerCase().includes(query);
      const matchDonor = group.shares?.some((share: any) => 
        share.donor?.name?.toLowerCase().includes(query) || 
        share.partner?.name?.toLowerCase().includes(query)
      );
      if (!matchGroup && !matchDonor) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kurban Organizasyonu</h2>
          <p className="text-gray-500 mt-1">Kurban kampanyaları, hayvan grupları ve hisse atamaları.</p>
        </div>
        <div className="flex gap-2">
          <select 
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800"
            value={selectedCampaignId || ''}
            onChange={e => setSelectedCampaignId(Number(e.target.value))}
          >
            <option value="">Kampanya Seçin...</option>
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.year})</option>
            ))}
          </select>
          <button onClick={() => setIsCampaignModalOpen(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center gap-2 font-medium shadow-sm transition-colors whitespace-nowrap">
            <Plus className="h-4 w-4" /> Yeni Kampanya
          </button>
        </div>
      </div>

      {selectedCampaign && (
        <>
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-lg font-bold text-gray-800">{selectedCampaign.name} - Gruplar</h3>
              <p className="text-sm text-gray-500">Hisse Bedeli: {selectedCampaign.defaultSharePrice} {selectedCampaign.currency}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleOpenReport} className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-100 flex items-center gap-2 font-medium shadow-sm transition-colors">
                <FileText className="h-4 w-4" /> Kampanya Raporu
              </button>
              {activeTab === 'Bekleyenler' && !isBulkSelectionMode && (
                <button onClick={() => setIsBulkSelectionMode(true)} className="px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl hover:bg-purple-100 flex items-center gap-2 font-medium shadow-sm transition-colors">
                  Toplu Aktarım Yap
                </button>
              )}
              <button onClick={() => setIsGroupModalOpen(true)} className="px-4 py-2 bg-white text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-50 flex items-center gap-2 font-medium shadow-sm transition-colors">
                <Plus className="h-4 w-4" /> Yeni Grup (Hayvan) Ekle
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 gap-6">
            <button
              className={`pb-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'Bekleyenler' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('Bekleyenler')}
            >
              Kesilecek Kurbanlar
            </button>
            <button
              className={`pb-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'Kesilenler' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('Kesilenler')}
            >
              Kesilen / Dağıtılanlar
            </button>
            <button
              className={`pb-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'Aktarılanlar' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('Aktarılanlar')}
            >
              Aktarılanlar
            </button>
            <button
              className={`pb-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'OrtakKuruluşlar' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('OrtakKuruluşlar')}
            >
              Ortak Kuruluşlar (Partnerler)
            </button>
          </div>

          {activeTab !== 'OrtakKuruluşlar' && (
            <>
              {/* Search and Filters */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-4 items-center mt-6 mb-2 shadow-sm">
            <div className="flex-1 relative w-full">
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Grup numarası veya bağışçı adı ile ara..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <select 
                className="px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm bg-gray-50 focus:ring-2 focus:ring-emerald-500"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Tüm Türler</option>
                <option value="Büyükbaş">Büyükbaş</option>
                <option value="Küçükbaş">Küçükbaş</option>
              </select>
              <select 
                className="px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm bg-gray-50 focus:ring-2 focus:ring-emerald-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Tüm Durumlar</option>
                <option value="Bekliyor">Bekliyor</option>
                <option value="Kesildi">Kesildi</option>
                <option value="Dağıtıldı">Dağıtıldı</option>
                <option value="Aktarıldı">Aktarıldı</option>
              </select>
            </div>
          </div>

          {activeTab === 'Bekleyenler' && isBulkSelectionMode && filteredGroups.length > 0 && (
              <div className="mt-4 flex items-center justify-between bg-purple-50 border border-purple-100 p-3 rounded-xl mb-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                    checked={selectedGroups.length === filteredGroups.length}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedGroups(filteredGroups.map(g => g.id));
                      else setSelectedGroups([]);
                    }}
                  />
                  <span className="text-sm font-medium text-purple-900">
                    {selectedGroups.length > 0 ? `${selectedGroups.length} grup seçili` : 'Tümünü Seç'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setIsBulkSelectionMode(false);
                      setSelectedGroups([]);
                    }}
                    className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    İptal
                  </button>
                  {selectedGroups.length > 0 && (
                    <button 
                      onClick={() => setIsBulkTransferModalOpen(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm"
                    >
                      Seçili Grupları Aktar ({selectedGroups.length})
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {loading ? (
                <div className="animate-pulse bg-white rounded-2xl p-6 border border-gray-100 h-64"></div>
              ) : filteredGroups.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
                  Bu sekmede gösterilecek kurban grubu bulunmamaktadır.
                </div>
              ) : (
                filteredGroups.map(group => {
                const isFull = group.shares.length >= group.capacity;
                return (
                  <div key={group.id} className={`bg-white rounded-2xl border ${isFull ? 'border-emerald-200 shadow-emerald-50' : 'border-gray-200'} shadow-sm overflow-hidden flex flex-col`}>
                    <div className={`p-4 border-b ${isFull ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100'} flex justify-between items-center`}>
                      <div className="flex items-start gap-3">
                        {activeTab === 'Bekleyenler' && isBulkSelectionMode && (
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 mt-1 rounded text-purple-600 focus:ring-purple-500 cursor-pointer shrink-0"
                            checked={selectedGroups.includes(group.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedGroups([...selectedGroups, group.id]);
                              else setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                            }}
                          />
                        )}
                        <div>
                          <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            {group.name}
                          <div className="flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity ml-2">
                            <button onClick={() => {
                              setEditingGroupId(group.id);
                              const pCosts = Object.keys(group.purchaseCosts || {}).map(k => ({ currency: k, amount: group.purchaseCosts[k].toString() }));
                              const sCosts = Object.keys(group.slaughterCosts || {}).map(k => ({ currency: k, amount: group.slaughterCosts[k].toString() }));
                              setGroupForm({ 
                                name: group.name, 
                                animalType: group.animalType, 
                                status: group.status || 'Bekliyor', 
                                transferredInstitution: group.transferredInstitution || '',
                                purchaseCosts: pCosts.length ? pCosts : [{ currency: 'TRY', amount: '' }],
                                slaughterCosts: sCosts.length ? sCosts : [{ currency: 'TRY', amount: '' }],
                                distributionLocation: group.distributionLocation || '',
                                beneficiaryCount: group.beneficiaryCount ? group.beneficiaryCount.toString() : ''
                              });
                              setIsGroupModalOpen(true);
                            }} className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button onClick={() => handleDeleteGroup(group.id)} className="p-1 text-red-600 hover:bg-red-100 rounded">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{group.animalType}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                            group.status === 'Bekliyor' ? 'bg-amber-100 text-amber-800' :
                            group.status === 'Kesildi' ? 'bg-emerald-100 text-emerald-800' :
                            group.status === 'Aktarıldı' ? 'bg-purple-100 text-purple-800' :
                            group.status === 'Dağıtıldı' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {group.status || 'Bekliyor'}
                          </span>
                        </div>
                        {group.status === 'Aktarıldı' && group.transferredInstitution && (
                          <div className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                            <span>➔ {group.transferredInstitution}</span>
                          </div>
                        )}
                        <div className="text-[10px] text-gray-500 mt-1 space-y-0.5">
                          {group.purchaseCosts && Object.keys(group.purchaseCosts).length > 0 && (
                            <div>Alım/Aktarım: <span className="font-medium">{Object.entries(group.purchaseCosts).map(([cur, amt]) => `${amt} ${cur}`).join(' + ')}</span></div>
                          )}
                          {group.slaughterCosts && Object.keys(group.slaughterCosts).length > 0 && group.status !== 'Aktarıldı' && (
                            <div>Kesim: <span className="font-medium">{Object.entries(group.slaughterCosts).map(([cur, amt]) => `${amt} ${cur}`).join(' + ')}</span></div>
                          )}
                        </div>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${isFull ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-200 text-gray-700'} shrink-0`}>
                        {group.shares.length} / {group.capacity} Dolu
                      </span>
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col gap-2">
                      {Array.from({ length: group.capacity }).map((_, index) => {
                        const share = group.shares[index];
                        if (share) {
                          return (
                              <div key={share.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center group/share hover:bg-gray-100 transition-colors">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {(share.donor || share.partner) ? (
                                      <Link to={`/current-accounts/${share.donor?.id || share.partner?.id}`} className="hover:text-emerald-600 hover:underline transition-colors">
                                        {share.donor?.name || (share.partner?.name ? share.partner.name + ' (Partner)' : 'İsimsiz Partner Hissesi')}
                                      </Link>
                                    ) : (
                                      'İsimsiz Partner Hissesi'
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <span className="font-medium text-gray-700">{share.amountPaid} {share.currency}</span> • {share.shareType} {share.isProxyGiven && <span className="text-emerald-600 flex items-center gap-0.5"><ShieldCheck className="w-3 h-3"/>Vekalet</span>}
                                  </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover/share:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => {
                                      setEditingShareId(share.id);
                                      setSelectedGroupIdForShare(group.id);
                                      setShareForm({
                                        donorId: share.donorId ? share.donorId.toString() : '',
                                        shareType: share.shareType,
                                        amountPaid: share.amountPaid ? share.amountPaid.toString() : '0',
                                        currency: share.currency || 'TRY',
                                        isProxyGiven: share.isProxyGiven
                                      });
                                      setIsShareModalOpen(true);
                                    }}
                                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                    title="Düzenle"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteShare(share.id)}
                                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                    title="Sil"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                          );
                        } else {
                          return (
                            <button 
                              key={`empty-${index}`}
                              onClick={() => {
                                setSelectedGroupIdForShare(group.id);
                                setShareForm(prev => ({ ...prev, amountPaid: selectedCampaign.defaultSharePrice.toString(), currency: selectedCampaign.currency }));
                                setIsShareModalOpen(true);
                              }}
                              className="p-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                            >
                              <Plus className="h-4 w-4" /> Boş Hisse (Ekle)
                            </button>
                          );
                        }
                      })}
                    </div>
                    
                    <div className="p-3 bg-white border-t border-gray-100 text-xs flex justify-between items-center">
                      <span className={`px-2 py-1 rounded font-medium ${group.status === 'Kesildi' ? 'bg-blue-100 text-blue-700' : group.status === 'Dağıtıldı' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        Durum: {group.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {activeTab === 'OrtakKuruluşlar' && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Partner Kurumlar</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partnerAccounts.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
                    Sistemde tanımlı partner kurum bulunmamaktadır.
                  </div>
                ) : (
                  partnerAccounts.map(partner => (
                    <div key={partner.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between hover:border-emerald-200 hover:shadow-md transition-all">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{partner.name}</h4>
                        <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                          <span className="px-2 py-1 bg-gray-100 rounded-md font-medium text-xs">
                            ID: {partner.id}
                          </span>
                          {partner.phone && <span>{partner.phone}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                        <button 
                          onClick={() => {
                            setSelectedPartnerId(partner.id);
                            setPartnerSharesForm([]);
                            setIsBulkPartnerModalOpen(true);
                          }}
                          className="flex-1 py-2 bg-emerald-50 text-emerald-700 font-medium rounded-xl hover:bg-emerald-100 text-sm transition-colors"
                        >
                          Toplu Hisse Ekle
                        </button>
                        <button 
                          onClick={() => fetchPartnerReport(partner.id)}
                          className="flex-1 py-2 bg-blue-50 text-blue-700 font-medium rounded-xl hover:bg-blue-100 text-sm transition-colors"
                        >
                          Rapor / İstatistik
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}


      {/* Campaign Modal */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsCampaignModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden relative z-10">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Yeni Kampanya</h3>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="campaign-form" onSubmit={handleCampaignSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kampanya Adı</label>
                  <input required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={campaignForm.name} onChange={e => setCampaignForm({...campaignForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Yıl</label>
                  <input required type="number" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={campaignForm.year} onChange={e => setCampaignForm({...campaignForm, year: Number(e.target.value)})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Döviz</label>
                    <select className="w-full px-4 py-2 border border-gray-200 rounded-xl" value={campaignForm.currency} onChange={e => setCampaignForm({...campaignForm, currency: e.target.value})}>
                      <option value="TRY">TRY</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hisse Bedeli</label>
                    <input required type="number" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={campaignForm.defaultSharePrice} onChange={e => setCampaignForm({...campaignForm, defaultSharePrice: e.target.value})} />
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button type="button" onClick={() => setIsCampaignModalOpen(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-xl">İptal</button>
              <button type="submit" form="campaign-form" className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700">Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* Group Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => { setIsGroupModalOpen(false); setEditingGroupId(null); }}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden relative z-10">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">{editingGroupId ? 'Grubu Düzenle' : 'Yeni Kurban Grubu'}</h3>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="group-form" onSubmit={handleGroupSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hayvan Numarası / Grup Adı</label>
                  <input required type="text" placeholder="Örn: AF-001" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={groupForm.name} onChange={e => setGroupForm({...groupForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hayvan Türü</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-xl" value={groupForm.animalType} onChange={e => setGroupForm({...groupForm, animalType: e.target.value})}>
                    <option value="Büyükbaş">Büyükbaş (7 Hisse)</option>
                    <option value="Küçükbaş">Küçükbaş (1 Hisse)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none" value={groupForm.status} onChange={e => setGroupForm({...groupForm, status: e.target.value})}>
                    <option value="Bekliyor">Bekliyor</option>
                    <option value="Kesildi">Kesildi</option>
                    <option value="Dağıtıldı">Dağıtıldı</option>
                    <option value="Aktarıldı">Aktarıldı (Başka Kuruma)</option>
                  </select>
                </div>

                {groupForm.status === 'Dağıtıldı' && (
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-4">
                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Dağıtım Bilgileri</h4>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Dağıtım Yeri / Bölgesi</label>
                      <input type="text" className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500" value={groupForm.distributionLocation} onChange={e => setGroupForm({...groupForm, distributionLocation: e.target.value})} placeholder="Örn: Gazze, Uganda..." />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Faydalanıcı (Kişi Sayısı)</label>
                      <input type="number" className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500" value={groupForm.beneficiaryCount} onChange={e => setGroupForm({...groupForm, beneficiaryCount: e.target.value})} placeholder="Örn: 50" />
                    </div>
                  </div>
                )}

                {groupForm.status === 'Aktarıldı' && (
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 space-y-4">
                    <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider">Kurum Aktarım Bilgileri</h4>
                    
                    <div>
                      <ItemPicker
                        label="Aktarılan Kurum Adı"
                        placeholder="Kurum Ara..."
                        options={Array.from(new Set(partnerAccounts.map(ca => ca.name))).map(name => ({ id: name as string, name: name as string }))}
                        value={groupForm.transferredInstitution}
                        onChange={(val) => setGroupForm({...groupForm, transferredInstitution: val.toString()})}
                        onAddNew={(search) => { 
                          setNewAccountContext('partner'); 
                          setNewAccountForm({ ...newAccountForm, name: search });
                          setIsNewAccountModalOpen(true); 
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Aktarım Maliyeti (Toplam Ödenen)</label>
                      {groupForm.purchaseCosts.map((cost, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                          <input type="number" step="0.01" placeholder="Tutar" className="flex-1 px-4 py-2 border border-gray-200 rounded-xl outline-none" value={cost.amount} onChange={e => {
                            const newCosts = [...groupForm.purchaseCosts];
                            newCosts[idx].amount = e.target.value;
                            setGroupForm({...groupForm, purchaseCosts: newCosts});
                          }} />
                          <select className="w-24 px-4 py-2 border border-gray-200 rounded-xl outline-none" value={cost.currency} onChange={e => {
                            const newCosts = [...groupForm.purchaseCosts];
                            newCosts[idx].currency = e.target.value;
                            setGroupForm({...groupForm, purchaseCosts: newCosts});
                          }}>
                            <option value="TRY">TRY</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                          </select>
                          <button type="button" onClick={() => {
                             const newCosts = groupForm.purchaseCosts.filter((_, i) => i !== idx);
                             setGroupForm({...groupForm, purchaseCosts: newCosts.length ? newCosts : [{ currency: 'TRY', amount: '' }]});
                          }} className="p-2 text-red-500 hover:bg-red-50 rounded-xl">Sil</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setGroupForm({...groupForm, purchaseCosts: [...groupForm.purchaseCosts, { currency: 'TRY', amount: '' }]})} className="text-sm text-purple-600 font-medium hover:underline">+ Başka Döviz Ekle</button>
                    </div>
                    
                    <p className="text-[10px] text-gray-500 leading-tight">Not: Toplanan bağışlarla aktarılan maliyet arasındaki fazlalık Kurban Fonu kasasına kâr olarak aktarılacaktır.</p>
                  </div>
                )}

                {groupForm.status === 'Kesildi' && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kesim Maliyeti / Mahsuplaşma</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Alım Maliyeti</label>
                        {groupForm.purchaseCosts.map((cost, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <input type="number" step="0.01" placeholder="Tutar" className="flex-1 px-4 py-2 border border-gray-200 rounded-xl outline-none" value={cost.amount} onChange={e => {
                              const newCosts = [...groupForm.purchaseCosts];
                              newCosts[idx].amount = e.target.value;
                              setGroupForm({...groupForm, purchaseCosts: newCosts});
                            }} />
                            <select className="w-24 px-4 py-2 border border-gray-200 rounded-xl outline-none" value={cost.currency} onChange={e => {
                              const newCosts = [...groupForm.purchaseCosts];
                              newCosts[idx].currency = e.target.value;
                              setGroupForm({...groupForm, purchaseCosts: newCosts});
                            }}>
                              <option value="TRY">TRY</option>
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                              <option value="GBP">GBP</option>
                            </select>
                            <button type="button" onClick={() => {
                               const newCosts = groupForm.purchaseCosts.filter((_, i) => i !== idx);
                               setGroupForm({...groupForm, purchaseCosts: newCosts.length ? newCosts : [{ currency: 'TRY', amount: '' }]});
                            }} className="p-1 text-red-500 hover:bg-red-50 rounded-lg">X</button>
                          </div>
                        ))}
                        <button type="button" onClick={() => setGroupForm({...groupForm, purchaseCosts: [...groupForm.purchaseCosts, { currency: 'TRY', amount: '' }]})} className="text-xs text-emerald-600 font-medium hover:underline">+ Masraf Ekle</button>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kesim Maliyeti</label>
                        {groupForm.slaughterCosts.map((cost, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <input type="number" step="0.01" placeholder="Tutar" className="flex-1 px-4 py-2 border border-gray-200 rounded-xl outline-none" value={cost.amount} onChange={e => {
                              const newCosts = [...groupForm.slaughterCosts];
                              newCosts[idx].amount = e.target.value;
                              setGroupForm({...groupForm, slaughterCosts: newCosts});
                            }} />
                            <select className="w-24 px-4 py-2 border border-gray-200 rounded-xl outline-none" value={cost.currency} onChange={e => {
                              const newCosts = [...groupForm.slaughterCosts];
                              newCosts[idx].currency = e.target.value;
                              setGroupForm({...groupForm, slaughterCosts: newCosts});
                            }}>
                              <option value="TRY">TRY</option>
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                              <option value="GBP">GBP</option>
                            </select>
                            <button type="button" onClick={() => {
                               const newCosts = groupForm.slaughterCosts.filter((_, i) => i !== idx);
                               setGroupForm({...groupForm, slaughterCosts: newCosts.length ? newCosts : [{ currency: 'TRY', amount: '' }]});
                            }} className="p-1 text-red-500 hover:bg-red-50 rounded-lg">X</button>
                          </div>
                        ))}
                        <button type="button" onClick={() => setGroupForm({...groupForm, slaughterCosts: [...groupForm.slaughterCosts, { currency: 'TRY', amount: '' }]})} className="text-xs text-emerald-600 font-medium hover:underline">+ Masraf Ekle</button>
                      </div>
                    </div>

                    <p className="text-[10px] text-gray-500 leading-tight">Not: Kurban durumu "Kesildi" olarak güncellendiğinde, hisselerden alınan toplam para ile maliyetler arasındaki fark "Kurban Fonu" kasasına kâr (gelir) veya zarar (gider) olarak otomatik işlenecektir.</p>
                  </div>
                )}
              </form>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button type="button" onClick={() => { setIsGroupModalOpen(false); setEditingGroupId(null); }} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-xl">İptal</button>
              <button type="submit" form="group-form" className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700">{editingGroupId ? 'Güncelle' : 'Oluştur'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => { setIsShareModalOpen(false); setEditingShareId(null); }}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden relative z-10">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">{editingShareId ? 'Hisseyi Düzenle' : 'Hissedar Ekle'}</h3>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="share-form" onSubmit={handleShareSubmit} className="space-y-4">
                <ItemPicker
                  label="Bağışçı (Cari Hesap Seçin)"
                  placeholder="Kişi Ara..."
                  options={currentAccounts.map(ca => ({ id: ca.id, name: ca.name }))}
                  value={shareForm.donorId ? Number(shareForm.donorId) : ''}
                  onChange={(val) => setShareForm({...shareForm, donorId: val.toString()})}
                  onAddNew={(search) => { 
                    setNewAccountContext('donor'); 
                    setNewAccountForm({ ...newAccountForm, name: search });
                    setIsNewAccountModalOpen(true); 
                  }}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Niyet / Kurban Türü</label>
                    <select className="w-full px-4 py-2 border border-gray-200 rounded-xl" value={shareForm.shareType} onChange={e => setShareForm({...shareForm, shareType: e.target.value})}>
                      <option value="Vacip">Vacip</option>
                      <option value="Adak">Adak</option>
                      <option value="Akika">Akika</option>
                      <option value="Şükür">Şükür</option>
                      <option value="Şifa">Şifa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ödenen Tutar</label>
                    <div className="flex">
                      <input required type="number" className="w-full px-4 py-2 border border-gray-200 border-r-0 rounded-l-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={shareForm.amountPaid} onChange={e => setShareForm({...shareForm, amountPaid: e.target.value})} />
                      <select className="px-3 py-2 border border-gray-200 rounded-r-xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none" value={shareForm.currency} onChange={e => setShareForm({...shareForm, currency: e.target.value})}>
                        <option value="TRY">TRY</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    checked={shareForm.isProxyGiven}
                    onChange={(e) => setShareForm({...shareForm, isProxyGiven: e.target.checked})}
                  />
                  <div>
                    <div className="font-medium text-gray-900">Vekalet Alındı</div>
                    <div className="text-xs text-gray-500">Bağışçı kurban kesimi için resmi vekaleti verdi.</div>
                  </div>
                </label>
              </form>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button type="button" onClick={() => { setIsShareModalOpen(false); setEditingShareId(null); }} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-xl">İptal</button>
              <button type="submit" form="share-form" className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700">{editingShareId ? 'Güncelle' : 'Kaydet'}</button>
            </div>
          </div>
        </div>
      )}

      <QuickCreateCurrentAccountModal 
        isOpen={isNewAccountModalOpen}
        initialName={newAccountForm.name}
        defaultTypeName={newAccountContext === 'donor' ? 'Bağışçı' : 'Partner Kurum ve Kuruluşlar'}
        onClose={() => setIsNewAccountModalOpen(false)}
        onCreated={(newAccount) => {
          fetchData();
          if (newAccountContext === 'donor') {
            setShareForm({ ...shareForm, donorId: newAccount.id.toString() });
          } else {
            setGroupForm({ ...groupForm, transferredInstitution: newAccount.name });
            if (bulkTransferForm) {
              setBulkTransferForm({ ...bulkTransferForm, transferredInstitution: newAccount.name });
            }
          }
          setIsNewAccountModalOpen(false);
          setNewAccountForm({ name: '', phone: '', email: '', accountCategory: 'Bireysel', typeIds: [] });
        }}
      />

      {/* Bulk Transfer Modal */}
      {isBulkTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsBulkTransferModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden relative z-10">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Toplu Kurban Aktarımı</h3>
              <p className="text-sm text-gray-500 mt-1">{selectedGroups.length} adet kurban grubu seçildi.</p>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="bulk-transfer-form" onSubmit={handleBulkTransferSubmit} className="space-y-4">
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 space-y-4">
                  <div>
                    <ItemPicker
                      label="Aktarılan Kurum Adı"
                      placeholder="Kurum Ara..."
                      options={partnerAccounts.map(ca => ({ id: ca.name, name: ca.name }))}
                      value={bulkTransferForm.transferredInstitution}
                      onChange={(val) => setBulkTransferForm({...bulkTransferForm, transferredInstitution: val.toString()})}
                      onAddNew={(search) => { 
                        setNewAccountContext('partner'); 
                        setNewAccountForm({ ...newAccountForm, name: search });
                        setIsNewAccountModalOpen(true); 
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Toplam Aktarım Maliyeti</label>
                    {bulkTransferForm.purchaseCosts.map((cost, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <input type="number" step="0.01" placeholder="Tutar" className="flex-1 px-4 py-2 border border-gray-200 rounded-xl outline-none" value={cost.amount} onChange={e => {
                          const newCosts = [...bulkTransferForm.purchaseCosts];
                          newCosts[idx].amount = e.target.value;
                          setBulkTransferForm({...bulkTransferForm, purchaseCosts: newCosts});
                        }} />
                        <select className="w-24 px-4 py-2 border border-gray-200 rounded-xl outline-none" value={cost.currency} onChange={e => {
                          const newCosts = [...bulkTransferForm.purchaseCosts];
                          newCosts[idx].currency = e.target.value;
                          setBulkTransferForm({...bulkTransferForm, purchaseCosts: newCosts});
                        }}>
                          <option value="TRY">TRY</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                        </select>
                        <button type="button" onClick={() => {
                            const newCosts = bulkTransferForm.purchaseCosts.filter((_, i) => i !== idx);
                            setBulkTransferForm({...bulkTransferForm, purchaseCosts: newCosts.length ? newCosts : [{ currency: 'TRY', amount: '' }]});
                        }} className="p-2 text-red-500 hover:bg-red-50 rounded-xl">Sil</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setBulkTransferForm({...bulkTransferForm, purchaseCosts: [...bulkTransferForm.purchaseCosts, { currency: 'TRY', amount: '' }]})} className="text-sm text-purple-600 font-medium hover:underline">+ Başka Döviz Ekle</button>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-tight">Not: Seçilen tüm kurbanlardan toplanan bağışlarla girilen bu maliyet arasındaki fark kasaya tek bir işlem olarak kâr (veya zarar) olarak aktarılacaktır.</p>
                </div>
              </form>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button type="button" onClick={() => setIsBulkTransferModalOpen(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-xl">İptal</button>
              <button type="submit" form="bulk-transfer-form" className="px-6 py-2 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700">Aktarımı Tamamla</button>
            </div>
          </div>
        </div>
      )}
      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsReportModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col overflow-hidden relative z-10 max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Kampanya Sonu Raporu
              </h3>
              <button onClick={() => setIsReportModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                Kapat
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-white">
              {isReportLoading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : reportData ? (
                <div className="space-y-6">
                  {/* Özet Kartları */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                      <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Toplam Grup</div>
                      <div className="text-2xl font-black text-blue-900">{reportData.totalGroups}</div>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                      <div className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Toplam Hisse</div>
                      <div className="text-2xl font-black text-emerald-900">{reportData.totalShares}</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
                      <div className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-1">Büyükbaş</div>
                      <div className="text-2xl font-black text-purple-900">{reportData.groupTypes?.buyukbas || 0}</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center">
                      <div className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">Küçükbaş</div>
                      <div className="text-2xl font-black text-orange-900">{reportData.groupTypes?.kucukbas || 0}</div>
                    </div>
                  </div>

                  {/* Detaylı Durumlar */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-sm text-gray-700">Kurban Kesim Durumları</div>
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center"><span className="text-gray-600">Bekleyen:</span><span className="font-bold">{reportData.groupStatuses?.bekliyor || 0}</span></div>
                        <div className="flex justify-between items-center"><span className="text-gray-600">Kesildi:</span><span className="font-bold text-blue-600">{reportData.groupStatuses?.kesildi || 0}</span></div>
                        <div className="flex justify-between items-center"><span className="text-gray-600">Dağıtıldı:</span><span className="font-bold text-emerald-600">{reportData.groupStatuses?.dagitildi || 0}</span></div>
                        <div className="flex justify-between items-center"><span className="text-gray-600">Kuruma Aktarıldı:</span><span className="font-bold text-purple-600">{reportData.groupStatuses?.aktarildi || 0}</span></div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-sm text-gray-700">Bağış (Niyet) Türleri</div>
                      <div className="p-4 space-y-3">
                        {Object.entries(reportData.shareTypes || {}).length === 0 ? (
                          <div className="text-gray-500 text-sm">Hisse verisi yok.</div>
                        ) : (
                          Object.entries(reportData.shareTypes).map(([type, count]) => (
                            <div key={type} className="flex justify-between items-center">
                              <span className="text-gray-600">{type}:</span>
                              <span className="font-bold">{String(count)}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Finansal Durum */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-sm text-gray-700">Finansal Özet (Döviz Bazında)</div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 font-medium">Döviz</th>
                            <th className="px-4 py-3 font-medium text-right">Toplanan Bağışlar</th>
                            <th className="px-4 py-3 font-medium text-right text-red-600">Alım/Aktarım Gideri</th>
                            <th className="px-4 py-3 font-medium text-right text-red-600">Kesim Gideri</th>
                            <th className="px-4 py-3 font-medium text-right text-emerald-600">Kalan / Net Kâr</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {Array.from(new Set([
                            ...Object.keys(reportData.donationsByCurrency || {}),
                            ...Object.keys(reportData.purchaseCostsByCurrency || {}),
                            ...Object.keys(reportData.slaughterCostsByCurrency || {})
                          ])).map(cur => {
                            const income = reportData.donationsByCurrency[cur] || 0;
                            const purchase = reportData.purchaseCostsByCurrency[cur] || 0;
                            const slaughter = reportData.slaughterCostsByCurrency[cur] || 0;
                            const net = income - purchase - slaughter;
                            return (
                              <tr key={cur as string} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-bold text-gray-900">{cur as string}</td>
                                <td className="px-4 py-3 text-right font-medium">{income.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                <td className="px-4 py-3 text-right text-red-600">{purchase.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                <td className="px-4 py-3 text-right text-red-600">{slaughter.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                                <td className={`px-4 py-3 text-right font-bold ${net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {net > 0 ? '+' : ''}{net.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            );
                          })}
                          {Object.keys(reportData.donationsByCurrency || {}).length === 0 && Object.keys(reportData.purchaseCostsByCurrency || {}).length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">Henüz finansal işlem bulunmuyor.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Detaylı Liste */}
                  {reportData.detailedGroups && reportData.detailedGroups.length > 0 && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden mt-6">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-sm text-gray-700">Detaylı Kurban Listesi</div>
                      <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                        {reportData.detailedGroups.map((group: any) => (
                          <div key={group.id} className="p-4 hover:bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                  {group.name} 
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    group.animalType === 'Büyükbaş' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                                  }`}>{group.animalType}</span>
                                </h4>
                                <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-4">
                                  <span><strong className="text-gray-700">Durum:</strong> {group.status || 'Bekliyor'}</span>
                                  {group.slaughterLocation && <span><strong className="text-gray-700">Kesim Yeri:</strong> {group.slaughterLocation}</span>}
                                  {group.slaughterDate && <span><strong className="text-gray-700">Tarih:</strong> {new Date(group.slaughterDate).toLocaleDateString('tr-TR')}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="mt-3">
                              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Hissedarlar ({group.shares?.length || 0})</h5>
                              {group.shares && group.shares.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {group.shares.map((share: any) => (
                                    <div key={share.id} className="bg-white border border-gray-200 p-2 rounded-lg text-sm flex justify-between items-center">
                                      <div className="truncate pr-2" title={share.donor?.title || share.donor?.name || 'Bilinmiyor'}>
                                        <span className="font-medium text-gray-900">{share.donor?.title || share.donor?.name || 'Bilinmiyor'}</span>
                                        <span className="text-xs text-gray-500 block">{share.shareType}</span>
                                      </div>
                                      <div className="text-right">
                                        <span className="font-bold text-emerald-600 block">{share.amountPaid} {share.currency}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500 italic">Henüz hisse eklenmemiş.</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">Veri bulunamadı.</div>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button onClick={() => window.print()} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 mr-2">Yazdır</button>
              <button onClick={() => setIsReportModalOpen(false)} className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700">Kapat</button>
            </div>
          </div>
        </div>
      )}

      {/* Partner Bulk Shares Modal */}
      {isBulkPartnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsBulkPartnerModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col overflow-hidden relative z-10 max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">Toplu Hisse Ekle (Partner Kurum)</h3>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form id="bulk-partner-form" onSubmit={handleBulkPartnerSharesSubmit} className="space-y-6">
                
                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <span className="text-blue-800 font-medium">Kaç hisse eklenecek?</span>
                  <button type="button" onClick={() => setPartnerSharesForm([...partnerSharesForm, { shareType: 'Vacip', currency: 'TRY', amountPaid: '', expectedAmount: selectedCampaign?.defaultSharePrice || '' }])} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Satır Ekle
                  </button>
                </div>

                <div className="space-y-4">
                  {partnerSharesForm.map((share, idx) => (
                    <div key={idx} className="flex gap-4 p-4 border border-gray-200 rounded-xl bg-white shadow-sm relative group items-center">
                      <button type="button" onClick={() => setPartnerSharesForm(partnerSharesForm.filter((_, i) => i !== idx))} className="absolute -left-3 -top-3 w-6 h-6 bg-red-100 text-red-600 rounded-full flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity border border-red-200 hover:bg-red-200">
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-7 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Hissedar Ad Soyad (Opsiyonel)</label>
                          <input type="text" placeholder="İsim yoksa kurum üzerine" className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-500" value={share.ad_soyad || ''} onChange={e => { const newF = [...partnerSharesForm]; newF[idx].ad_soyad = e.target.value; setPartnerSharesForm(newF); }} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Telefon</label>
                          <input type="text" placeholder="5xx..." className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-500" value={share.telefon || ''} onChange={e => { const newF = [...partnerSharesForm]; newF[idx].telefon = e.target.value; setPartnerSharesForm(newF); }} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Hisse Türü</label>
                          <select className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-500" value={share.shareType} onChange={e => { const newF = [...partnerSharesForm]; newF[idx].shareType = e.target.value; setPartnerSharesForm(newF); }}>
                            <option value="Vacip">Vacip</option>
                            <option value="Akika">Akika</option>
                            <option value="Adak">Adak</option>
                            <option value="Şükür">Şükür</option>
                            <option value="Diğer">Diğer</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Beklenen</label>
                          <input type="number" placeholder="0.00" className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-500" value={share.expectedAmount} onChange={e => { const newF = [...partnerSharesForm]; newF[idx].expectedAmount = e.target.value; setPartnerSharesForm(newF); }} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Ödenen</label>
                          <input type="number" placeholder="0.00" className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-500" value={share.amountPaid} onChange={e => { const newF = [...partnerSharesForm]; newF[idx].amountPaid = e.target.value; setPartnerSharesForm(newF); }} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Döviz</label>
                          <select className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-500" value={share.currency} onChange={e => { const newF = [...partnerSharesForm]; newF[idx].currency = e.target.value; setPartnerSharesForm(newF); }}>
                            <option value="TRY">TRY</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  {partnerSharesForm.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                      Henüz hisse eklenmedi. "Satır Ekle" butonuna tıklayarak başlayın.
                    </div>
                  )}
                </div>

              </form>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsBulkPartnerModalOpen(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors">İptal</button>
              <button type="submit" form="bulk-partner-form" disabled={partnerSharesForm.length === 0} className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm">
                Kaydet ({partnerSharesForm.length} Hisse)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Partner Report Modal */}
      {isPartnerReportModalOpen && partnerReportData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsPartnerReportModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl flex flex-col overflow-hidden relative z-10 max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Partner Raporu: {partnerReportData.partner?.name}</h3>
                <p className="text-sm text-gray-500 mt-1">Kampanya: {selectedCampaign?.name}</p>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="text-sm font-medium text-gray-500 mb-1">Toplam Hisse Sayısı</div>
                  <div className="text-3xl font-bold text-emerald-600">{partnerReportData.totalShares}</div>
                </div>
                {Object.entries(partnerReportData.financials || {}).map(([curr, stats]: [string, any]) => (
                    <div key={curr} className="flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-gray-100 mt-2">
                      <div className="text-xl font-bold text-gray-900" title="Beklenen Toplam">Beklenen: {Number(stats.expected || 0).toLocaleString('tr-TR')} {curr}</div>
                      <div className="text-lg font-bold text-gray-600" title="Ödenen Toplam">Ödenen: {Number(stats.paid || 0).toLocaleString('tr-TR')} {curr}</div>
                      {stats.debt > 0 ? (
                        <>
                          <div className="text-2xl font-bold text-rose-600 mt-2">{Number(stats.debt || 0).toLocaleString('tr-TR')} {curr}</div>
                          <button onClick={() => {
                            setDebtForm({ ...debtForm, amount: stats.debt.toString(), currency: curr });
                            setIsDebtModalOpen(true);
                          }} className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium text-sm transition-colors shadow-sm w-full">
                            Borç Kapat ({curr})
                          </button>
                        </>
                      ) : (
                        <div className="text-xl font-bold text-emerald-600 mt-2">Borç Yok ({curr})</div>
                      )}
                    </div>
                  ))}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm overflow-y-auto max-h-36">
                  <div className="text-sm font-medium text-gray-500 mb-1">Dağıtım ve Yararlanıcı</div>
                  {Object.keys(partnerReportData.distributionSummary || {}).length > 0 ? (
                    <div className="text-sm text-gray-700">
                      <div className="font-bold text-blue-600 mb-1 border-b border-gray-100 pb-1">Toplam Yararlanıcı: {partnerReportData.totalBeneficiaries || 0} Kişi</div>
                      {Object.entries(partnerReportData.distributionSummary || {}).map(([loc, count]) => (
                        <div key={loc} className="flex justify-between py-1 border-b border-gray-100 last:border-0 text-xs">
                          <span className="truncate pr-2">{loc}</span>
                          <span className="font-bold shrink-0">{String(count)} Grup</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic">Henüz dağıtım raporu yok</div>
                  )}
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden mt-6">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-bold text-sm text-gray-700">Hisse Listesi</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 font-medium">#</th>
                        <th className="px-4 py-3 font-medium">Hissedar (Kişi)</th>
                        <th className="px-4 py-3 font-medium">Telefon</th>
                        <th className="px-4 py-3 font-medium">Grup (Hayvan)</th>
                        <th className="px-4 py-3 font-medium">Durum</th>
                        <th className="px-4 py-3 font-medium">SMS</th>
                        <th className="px-4 py-3 font-medium text-right">Ödenen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {partnerReportData.shares?.map((share: any, idx: number) => (
                        <tr key={share.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">{share.donor?.name || <span className="text-gray-400 italic">İsimsiz (Partner)</span>}</td>
                          <td className="px-4 py-3 text-gray-600">{share.donor?.phone || '-'}</td>
                          <td className="px-4 py-3">
                            {share.group ? (
                              <div>
                                <span className="font-medium text-gray-900 block">{share.group.name}</span>
                              </div>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">{share.group?.status || 'Atanmadı'}</span>
                          </td>
                          <td className="px-4 py-3">
                            {share.isSmsSent ? (
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-medium">Gönderildi</span>
                            ) : (
                              <button 
                                onClick={() => sendSmsToShareholder(share.id)}
                                disabled={!share.donor?.phone || share.group?.status !== 'Kesildi'}
                                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                Gönder
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">{share.amountPaid} {share.currency}</td>
                        </tr>
                      ))}
                      {partnerReportData.shares?.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-500">Bu partnere ait hisse kaydı bulunamadı.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => window.print()} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm">Yazdır</button>
              <button onClick={() => setIsPartnerReportModalOpen(false)} className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-sm">Kapat</button>
            </div>
          </div>
        </div>
      )}

      {/* Debt Modal */}
      {isDebtModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsDebtModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden relative z-10">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">Tahsilat Ekle</h3>
              <p className="text-sm text-gray-500 mt-1">Gelen ödemeyi mevcut borçtan düşer.</p>
            </div>
            <div className="p-6">
              <form id="debt-form" onSubmit={handlePayDebt} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tahsil Edilen Tutar (TRY)</label>
                  <input required type="number" min="1" step="0.01" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={debtForm.amount} onChange={e => setDebtForm({...debtForm, amount: e.target.value})} placeholder="Örn: 50000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama (Opsiyonel)</label>
                  <textarea className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none" rows={3} value={debtForm.description} onChange={e => setDebtForm({...debtForm, description: e.target.value})} placeholder="Örn: Banka havalesi ile toplu ödeme"></textarea>
                </div>
              </form>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button type="button" onClick={() => setIsDebtModalOpen(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors">İptal</button>
              <button type="submit" form="debt-form" className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-sm">Tahsilatı Kaydet</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

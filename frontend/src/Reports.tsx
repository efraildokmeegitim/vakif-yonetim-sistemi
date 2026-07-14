import React, { useState, useEffect } from 'react';
import { api, API_URL } from './api';
import { Download, Database, Table as TableIcon, Filter, Settings, Plus, Trash2, Search, Play, FileSpreadsheet } from 'lucide-react';
// @ts-ignore
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'templates' | 'advanced' | 'developer'>('advanced');
  const [templates, setTemplates] = useState<any[]>([]);
  
  // Developer Tab States
  const [tables, setTables] = useState<string[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Advanced Tab States
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableColumns, setTableColumns] = useState<{name: string, type: string}[]>([]);
  
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [filters, setFilters] = useState<{column: string, operator: string, value: any}[]>([]);
  const [sortBy, setSortBy] = useState<{column: string, order: 'ASC' | 'DESC'}>({ column: '', order: 'DESC' });
  const [limit, setLimit] = useState<number>(1000);
  
  const [reportResult, setReportResult] = useState<{data: any[], count: number} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pivot States
  const [pivotState, setPivotState] = useState({});
  const [reportViewTab, setReportViewTab] = useState<'table' | 'pivot'>('table');

  const operators = [
    { value: 'eq', label: 'Eşittir (=)' },
    { value: 'neq', label: 'Eşit Değildir (!=)' },
    { value: 'gt', label: 'Büyüktür (>)' },
    { value: 'gte', label: 'Büyük Eşittir (>=)' },
    { value: 'lt', label: 'Küçüktür (<)' },
    { value: 'lte', label: 'Küçük Eşittir (<=)' },
    { value: 'like', label: 'İçerir (LIKE)' },
  ];

  const tableNamesMap: Record<string, string> = {
    'aid_limits': 'Yardım Limitleri',
    'asset_assignments': 'Demirbaş Zimmetleri',
    'asset_categories': 'Demirbaş Kategorileri',
    'asset_maintenance': 'Demirbaş Bakımları',
    'assets': 'Demirbaşlar',
    'cost_centers': 'Masraf Merkezleri',
    'current_account_documents': 'Cari Hesap Belgeleri',
    'current_account_type_links': 'Cari Hesap Tür Bağlantıları',
    'current_account_types': 'Cari Hesap Türleri',
    'current_accounts': 'Cari Hesaplar',
    'events': 'Etkinlikler',
    'external_aids': 'Dış Yardımlar',
    'health_conditions': 'Sağlık Durumları',
    'household_financials': 'Hane Finansal Bilgileri',
    'household_members': 'Hane Bireyleri',
    'household_needs': 'Hane İhtiyaçları',
    'households': 'Yardım Haneleri',
    'lodging_accruals': 'Lojman Tahakkukları',
    'lodging_payments': 'Lojman Ödemeleri',
    'lodgings': 'Lojmanlar',
    'payrolls': 'Bordrolar',
    'personnel': 'Vakıf Personeli',
    'personnel_files': 'Personel Dosyaları',
    'personnel_leaves': 'Personel İzinleri',
    'project_budgets': 'Proje Bütçeleri',
    'project_categories': 'Proje Kategorileri',
    'project_files': 'Proje Dosyaları',
    'project_metadata': 'Proje Meta Verileri',
    'projects': 'Projeler',
    'publication_sales': 'Yayın Satışları',
    'publications': 'Yayınlar',
    'sacrifice_campaigns': 'Kurban Kampanyaları',
    'sacrifice_groups': 'Kurban Grupları',
    'sacrifice_shares': 'Kurban Hissedarları',
    'scholarship_accruals': 'Burs Tahakkukları',
    'scholarship_payments': 'Burs Ödemeleri',
    'scholarships': 'Burslar',
    'settings': 'Sistem Ayarları',
    'soup_kitchen_distributions': 'Aşevi Dağıtımları',
    'soup_kitchen_menus': 'Aşevi Menüleri',
    'sponsorship_payments': 'Sponsorluk Ödemeleri',
    'sponsorships': 'Sponsorluklar',
    'stock_item_categories': 'Stok Kategorileri',
    'stock_items': 'Stok Kalemleri',
    'stock_levels': 'Stok Seviyeleri',
    'stock_transactions': 'Stok Hareketleri',
    'student_details': 'Öğrenci Detayları',
    'student_family_info': 'Öğrenci Aile Bilgileri',
    'subscription_payments': 'Abonelik Ödemeleri',
    'subscriptions': 'Abonelikler',
    'system_plugins': 'Sistem Eklentileri',
    'tasks': 'Görevler',
    'transaction_documents': 'İşlem Belgeleri',
    'transactions': 'Kasa/Banka İşlemleri',
    'users': 'Sistem Kullanıcıları',
    'vehicle_maintenances': 'Araç Bakımları',
    'vehicles': 'Araçlar',
    'wallet_balances': 'Kasa/Banka Bakiyeleri',
    'wallets': 'Kasalar ve Bankalar',
    'warehouses': 'Depolar',
    'people': 'Şahıslar (Aile Bireyleri)'
  };

  const getTableLabel = (tableName: string) => tableNamesMap[tableName] || tableName;
  const sortedTables = [...tables].sort((a, b) => getTableLabel(a).localeCompare(getTableLabel(b), 'tr'));

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const res = await api.get('/reports/tables');
      setTables(res.data);
    } catch (error) {
      console.error('Error fetching tables', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/reports/templates');
      setTemplates(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveTemplate = async () => {
    if (!selectedTable) return alert('Lütfen tablo seçin.');
    const title = prompt('Rapor şablonuna vermek istediğiniz ismi girin:');
    if (!title) return;
    try {
      const payload = {
        title,
        tableName: selectedTable,
        columns: selectedColumns,
        filters: filters.filter(f => f.value !== ''),
        sortBy: sortBy.column ? sortBy : undefined,
        limit
      };
      await api.post('/reports/templates', payload);
      alert('Rapor şablonu başarıyla kaydedildi.');
      fetchTemplates();
    } catch (err) {
      alert('Şablon kaydedilirken hata oluştu.');
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('Şablonu silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/reports/templates/${id}`);
      fetchTemplates();
    } catch (err) {
      alert('Silme sırasında hata oluştu.');
    }
  };

  const handleLoadTemplate = (template: any) => {
    setSelectedTable(template.tableName);
    setSelectedColumns(template.columns || []);
    setFilters(template.filters || []);
    setSortBy(template.sortBy || { column: '', order: 'DESC' });
    setLimit(template.limit || 1000);
    setActiveTab('advanced');
  };

  const handleTableChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const table = e.target.value;
    setSelectedTable(table);
    setTableColumns([]);
    setSelectedColumns([]);
    setFilters([]);
    setReportResult(null);

    if (table) {
      try {
        const res = await api.get(`/reports/columns/${table}`);
        setTableColumns(res.data);
        // Default select all columns
        setSelectedColumns(res.data.map((c: any) => c.name));
      } catch (error) {
        console.error('Error fetching columns', error);
      }
    }
  };

  const handleColumnToggle = (colName: string) => {
    setSelectedColumns(prev => 
      prev.includes(colName) ? prev.filter(c => c !== colName) : [...prev, colName]
    );
  };

  const addFilter = () => {
    if (tableColumns.length === 0) return;
    setFilters([...filters, { column: tableColumns[0].name, operator: 'eq', value: '' }]);
  };

  const updateFilter = (index: number, field: string, value: any) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    setFilters(newFilters);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const generateReport = async () => {
    if (!selectedTable) return alert('Lütfen bir tablo/kaynak seçin.');
    
    setIsLoading(true);
    try {
      const payload = {
        table: selectedTable,
        columns: selectedColumns,
        filters: filters.filter(f => f.value !== ''),
        sort: sortBy.column ? sortBy : undefined,
        limit
      };
      
      const res = await api.post('/reports/generate', payload);
      setReportResult(res.data);
    } catch (error) {
      console.error('Error generating report', error);
      alert('Rapor oluşturulurken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!reportResult || !reportResult.data || reportResult.data.length === 0) return;
    
    // Create CSV content
    const headers = Object.keys(reportResult.data[0]);
    const csvRows = [];
    
    // Header row
    csvRows.push(headers.join(','));
    
    // Data rows
    for (const row of reportResult.data) {
      const values = headers.map(header => {
        const val = row[header];
        const escaped = ('' + (val || '')).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    
    // Download
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedTable}-report-${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPivotToExcel = () => {
    const table = document.querySelector('.pvtTable');
    if (!table) return alert('Dışa aktarılacak pivot tablo bulunamadı!');
    
    let csv = '';
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
      const cols = row.querySelectorAll('td, th');
      const rowData = Array.from(cols).map(col => {
        const text = col.textContent?.trim() || '';
        return `"${text.replace(/"/g, '""')}"`;
      });
      csv += rowData.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pivot-report-${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // Developer Handlers
  const handleExportRaw = (tableName: string) => {
    const token = localStorage.getItem('token');
    window.open(`${API_URL}/reports/export/${tableName}?token=${token}`, '_blank');
  };

  const handleBackup = async () => {
    try {
      setIsBackingUp(true);
      const res = await api.post('/reports/backup', {}, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-${new Date().getTime()}.sql`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error backing up database', error);
      alert('Yedekleme işlemi başarısız oldu.');
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-600" />
          Raporlar ve İstatistikler
        </h1>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('templates')}
          className={`pb-3 px-4 font-medium text-sm transition-colors relative ${activeTab === 'templates' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Kayıtlı Şablonlar
          {activeTab === 'templates' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-md"></span>}
        </button>
        <button 
          onClick={() => setActiveTab('advanced')}
          className={`pb-3 px-4 font-medium text-sm transition-colors relative ${activeTab === 'advanced' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Gelişmiş Rapor Oluşturucu
          {activeTab === 'advanced' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-md"></span>}
        </button>
        <button 
          onClick={() => setActiveTab('developer')}
          className={`pb-3 px-4 font-medium text-sm transition-colors relative ${activeTab === 'developer' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Sistem Verileri & Yedekleme
          {activeTab === 'developer' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-md"></span>}
        </button>
      </div>

      {activeTab === 'advanced' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sol Panel: Ayarlar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Settings size={18} className="text-gray-500" /> Veri Kaynağı</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modül / Tablo Seçin</label>
                  <select 
                    value={selectedTable} 
                    onChange={handleTableChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">-- Kaynak Seç --</option>
                    {sortedTables.map(t => (
                      <option key={t} value={t}>{getTableLabel(t)}</option>
                    ))}
                  </select>
                </div>

                {tableColumns.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Görünecek Sütunlar</label>
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50 space-y-1">
                      {tableColumns.map(col => (
                        <label key={col.name} className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={selectedColumns.includes(col.name)}
                            onChange={() => handleColumnToggle(col.name)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 truncate">{col.name}</span>
                          <span className="text-xs text-gray-400 ml-auto">{col.type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedTable && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2"><Filter size={18} className="text-gray-500" /> Filtreler</h3>
                  <button onClick={addFilter} className="text-blue-600 hover:bg-blue-50 p-1 rounded-md"><Plus size={18} /></button>
                </div>
                
                <div className="space-y-4">
                  {filters.map((f, index) => (
                    <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-lg relative">
                      <button onClick={() => removeFilter(index)} className="absolute -top-2 -right-2 bg-white text-red-500 hover:text-red-700 border border-gray-200 rounded-full p-1 shadow-sm"><Trash2 size={12} /></button>
                      <select 
                        value={f.column} 
                        onChange={(e) => updateFilter(index, 'column', e.target.value)}
                        className="w-full mb-2 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        {tableColumns.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                      <select 
                        value={f.operator} 
                        onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                        className="w-full mb-2 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        {operators.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <input 
                        type="text" 
                        value={f.value}
                        onChange={(e) => updateFilter(index, 'value', e.target.value)}
                        placeholder="Değer..."
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  ))}
                  {filters.length === 0 && <p className="text-xs text-gray-500 italic">Filtre eklenmedi. Tüm veriler getirilecek.</p>}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">Sıralama ve Limit</h3>
                  <div className="flex gap-2 mb-3">
                    <select 
                      value={sortBy.column} 
                      onChange={(e) => setSortBy({ ...sortBy, column: e.target.value })}
                      className="w-2/3 px-2 py-1 text-sm border border-gray-300 rounded outline-none"
                    >
                      <option value="">-- Sıralama --</option>
                      {tableColumns.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                    <select 
                      value={sortBy.order} 
                      onChange={(e) => setSortBy({ ...sortBy, order: e.target.value as any })}
                      className="w-1/3 px-2 py-1 text-sm border border-gray-300 rounded outline-none"
                    >
                      <option value="DESC">Azalan</option>
                      <option value="ASC">Artan</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Max Kayıt:</span>
                    <input 
                      type="number" 
                      value={limit} 
                      onChange={(e) => setLimit(Number(e.target.value))}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveTemplate}
                  className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors border border-gray-300"
                >
                  <Database size={18} />
                  Şablon Olarak Kaydet
                </button>
                <button
                  onClick={generateReport}
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Oluşturuluyor...' : 'Rapor Üret'}
                </button>
              </div>
              </div>
            )}
          </div>

          {/* Sağ Panel: Sonuçlar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full min-h-[600px]">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
                <div className="flex items-center gap-4">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <TableIcon size={20} className="text-blue-600" />
                    Rapor Sonucu
                    {reportResult && <span className="text-sm font-normal text-gray-500">({reportResult.count} kayıt)</span>}
                  </h2>
                  {reportResult && (
                    <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden ml-4">
                      <button 
                        onClick={() => setReportViewTab('table')}
                        className={`px-4 py-1.5 text-sm font-medium transition-colors ${reportViewTab === 'table' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        Veri Tablosu
                      </button>
                      <button 
                        onClick={() => setReportViewTab('pivot')}
                        className={`px-4 py-1.5 text-sm font-medium transition-colors border-l border-gray-200 ${reportViewTab === 'pivot' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        Pivot Görünümü
                      </button>
                    </div>
                  )}
                </div>
                
                {reportViewTab === 'table' ? (
                  <button 
                    onClick={exportToExcel}
                    disabled={!reportResult || reportResult.data.length === 0}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium"
                  >
                    <Download size={16} /> Excel'e Aktar
                  </button>
                ) : (
                  <button 
                    onClick={exportPivotToExcel}
                    disabled={!reportResult || reportResult.data.length === 0}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium"
                  >
                    <FileSpreadsheet size={16} /> Pivotu Aktar
                  </button>
                )}
              </div>
              
              <div className="p-0 overflow-auto flex-1">
                {!reportResult ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 p-12">
                    <Search size={48} className="mb-4 opacity-20" />
                    <p>Rapor oluşturmak için sol menüden ayarları yapıp "Raporu Oluştur" butonuna tıklayın.</p>
                  </div>
                ) : reportResult.data.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 p-12">
                    <p>Seçilen kriterlere uygun veri bulunamadı.</p>
                  </div>
                ) : reportViewTab === 'pivot' ? (
                  <div className="p-4 overflow-auto h-full">
                    <PivotTableUI
                      data={reportResult.data}
                      onChange={(s: any) => setPivotState(s)}
                      {...pivotState}
                    />
                  </div>
                ) : (
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 sticky top-0 shadow-sm z-10">
                      <tr>
                        {selectedColumns.map(col => (
                          <th key={col} className="px-4 py-3 font-medium tracking-wider">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reportResult.data.map((row, i) => (
                        <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                          {selectedColumns.map(col => {
                            let val = row[col];
                            if (val && typeof val === 'object') val = JSON.stringify(val);
                            return (
                              <td key={col} className="px-4 py-2.5 text-gray-700 max-w-xs truncate" title={String(val)}>
                                {String(val ?? '-')}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <Database size={20} className="text-blue-600" /> 
            Kayıtlı Rapor Şablonları
          </h2>
          {templates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Henüz kaydedilmiş bir rapor şablonu bulunmamaktadır.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{template.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">Tablo: {getTableLabel(template.tableName)}</p>
                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                      <p>Sütun Sayısı: {template.columns?.length || 0}</p>
                      <p>Filtre Sayısı: {template.filters?.length || 0}</p>
                      <p>Limit: {template.limit}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLoadTemplate(template)}
                      className="flex-1 bg-blue-600 text-white py-1.5 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <Play size={14} /> Çalıştır
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="px-3 bg-white border border-red-200 text-red-600 py-1.5 rounded hover:bg-red-50 transition-colors flex items-center justify-center"
                      title="Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'developer' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <TableIcon size={20} className="text-blue-600" /> 
                Ham Veritabanı Tabloları
              </h2>
              <p className="text-gray-600 mt-1 text-sm">
                Aşağıdaki listeden sistemdeki verileri doğrudan veritabanı formatında bilgisayarınıza indirebilirsiniz.
              </p>
            </div>
            <button 
              onClick={handleBackup} 
              disabled={isBackingUp}
              className="flex items-center gap-2 bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900 disabled:opacity-50 text-sm font-medium"
            >
              <Database size={18} />
              {isBackingUp ? 'Yedekleniyor...' : 'Tam Yedek Al (.sql)'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedTables.map(table => (
              <div key={table} className="flex justify-between items-center border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors bg-gray-50">
                <div className="flex flex-col overflow-hidden">
                  <span className="font-medium text-sm text-gray-900 truncate pr-2">{getTableLabel(table)}</span>
                  <span className="font-mono text-xs text-gray-500 truncate pr-2">{table}</span>
                </div>
                <button 
                  onClick={() => handleExportRaw(table)}
                  className="text-blue-600 hover:text-blue-800 p-2 hover:bg-white rounded shadow-sm border border-transparent hover:border-blue-200 shrink-0 bg-white"
                  title="Excel İndir"
                >
                  <Download size={16} />
                </button>
              </div>
            ))}
            {sortedTables.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                Tablo bulunamadı veya yetkiniz yok.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

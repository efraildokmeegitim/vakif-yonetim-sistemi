import React, { useState, useRef } from 'react';
import { UploadCloud, X, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../api';
import ExcelJS from 'exceljs';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  endpoint: string; // Örneğin: '/users/import' veya '/current-accounts/import'
  title: string;
  templateHeaders: string[]; // Şablon dosyası için başlıklar
  templateFileName: string;
}

export default function ExcelImportModal({ isOpen, onClose, onSuccess, endpoint, title, templateHeaders, templateFileName }: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ added?: number; errors?: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Şablon');
    worksheet.addRow(templateHeaders);
    
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = templateFileName;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setResult({
        added: response.data.added,
        errors: response.data.errors
      });

      if (response.data.added > 0 && (!response.data.errors || response.data.errors.length === 0)) {
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      } else {
        onSuccess(); // Veri eklenmiş olabilir, listeyi güncelle
      }
    } catch (err: any) {
      setResult({ errors: [err.response?.data?.message || 'Yükleme sırasında bir hata oluştu.'] });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 transition-all duration-300">
      <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
            {title}
          </h2>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {!result ? (
            <div className="space-y-6">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm border border-blue-100">
                Sisteme toplu veri eklemek için örnek şablonu indirin, verilerinizi doldurun ve sisteme yükleyin.
                <button 
                  onClick={handleDownloadTemplate}
                  className="mt-2 text-blue-700 font-bold underline hover:text-blue-900 block"
                >
                  Örnek Şablonu İndir
                </button>
              </div>

              <div 
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${file ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    setFile(e.dataTransfer.files[0]);
                  }
                }}
              >
                <input 
                  type="file" 
                  accept=".xlsx, .xls" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                
                {file ? (
                  <div className="space-y-2">
                    <FileSpreadsheet className="h-12 w-12 text-emerald-500 mx-auto" />
                    <p className="font-medium text-emerald-800">{file.name}</p>
                    <p className="text-xs text-emerald-600">{(file.size / 1024).toFixed(1)} KB</p>
                    <button 
                      onClick={() => setFile(null)}
                      className="text-sm text-red-500 hover:text-red-700 font-medium mt-2"
                    >
                      Kaldır
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <UploadCloud className="h-12 w-12 text-gray-400 mx-auto" />
                    <p className="font-medium text-gray-700">Excel dosyasını sürükleyin veya seçin</p>
                    <p className="text-xs text-gray-500">Sadece .xlsx ve .xls formatları</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center space-y-2 mb-6">
                {result.errors && result.errors.length > 0 ? (
                  <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                ) : (
                  <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                )}
                <h3 className="text-xl font-bold text-gray-800">
                  {result.added} Kayıt Eklendi
                </h3>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <h4 className="font-semibold text-red-800 mb-2 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> Hatalar / Uyarılar ({result.errors.length})
                  </h4>
                  <ul className="text-xs text-red-600 space-y-1 max-h-40 overflow-y-auto list-disc pl-4">
                    {result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          {result ? (
            <button 
              onClick={handleClose}
              className="px-6 py-2 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              Kapat
            </button>
          ) : (
            <>
              <button 
                onClick={handleClose}
                className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-xl transition-colors"
              >
                İptal
              </button>
              <button 
                onClick={handleUpload}
                disabled={!file || loading}
                className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? 'Yükleniyor...' : 'İçe Aktar'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

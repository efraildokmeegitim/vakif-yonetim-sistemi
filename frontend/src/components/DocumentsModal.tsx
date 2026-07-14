import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Image as ImageIcon, Trash2, Download } from 'lucide-react';
import api from '../api';

interface TransactionDocument {
  id: number;
  fileName: string;
  fileUrl: string;
  createdAt: string;
}

interface DocumentsModalProps {
  transactionId: number;
  onClose: () => void;
}

export default function DocumentsModal({ transactionId, onClose }: DocumentsModalProps) {
  const [documents, setDocuments] = useState<TransactionDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [transactionId]);

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/wallets/transactions/${transactionId}/documents`);
      setDocuments(res.data);
    } catch (err: any) {
      setError('Dökümanlar yüklenirken bir hata oluştu.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Dosya boyutu 5 MB\'dan büyük olamaz.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Sadece JPG, PNG ve PDF dosyaları yüklenebilir.');
      return;
    }

    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post(`/wallets/transactions/${transactionId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchDocuments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Yükleme başarısız oldu.');
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = ''; // Reset input
    }
  };

  const handleDelete = async (docId: number) => {
    if (!window.confirm('Bu dosyayı silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/wallets/transactions/documents/${docId}`);
      setDocuments(docs => docs.filter(d => d.id !== docId));
    } catch (err: any) {
      setError('Dosya silinirken hata oluştu.');
    }
  };

  const isImage = (fileName: string) => {
    return fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg') || fileName.toLowerCase().endsWith('.png');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md transition-all duration-300">
      <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-blue-600 text-white">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h3 className="text-lg font-bold">İşlem Dökümanları</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-md transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          {/* Upload Area */}
          <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              accept=".jpg,.jpeg,.png,.pdf" 
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <div className="bg-blue-50 p-3 rounded-full mb-3 text-blue-600">
              <Upload className={`h-6 w-6 ${isUploading ? 'animate-bounce' : ''}`} />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">
              {isUploading ? 'Yükleniyor...' : 'Dosya Seçin veya Sürükleyin'}
            </h4>
            <p className="text-sm text-gray-500">Maksimum 5 MB (JPG, PNG, PDF)</p>
          </div>

          {/* File List */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {documents.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">Henüz bir döküman yüklenmemiş.</p>
            ) : (
              documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow bg-gray-50/50">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`p-2 rounded-lg shrink-0 ${isImage(doc.fileName) ? 'bg-purple-100 text-purple-600' : 'bg-red-100 text-red-600'}`}>
                      {isImage(doc.fileName) ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate" title={doc.fileName}>{doc.fileName}</p>
                      <p className="text-xs text-gray-500">{new Date(doc.createdAt).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-4">
                    <a 
                      href={`http://localhost:3000${doc.fileUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="İndir / Görüntüle"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

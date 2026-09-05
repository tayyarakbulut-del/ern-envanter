import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { AssignmentLog, Asset } from '../types/inventory';
import { resolveFileUrl, storeFile, formatBytes } from '../services/mediaStorage';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  log?: AssignmentLog | null;
  asset?: Asset | null;
  onDocumentUploaded: (fileData: { url: string; name: string; size: number }) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  log,
  asset,
  onDocumentUploaded,
}) => {
  const [resolvedUrl, setResolvedUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const documentUrl = log?.signedDocumentUrl || asset?.signedDocumentUrl;
  const documentName = log?.signedDocumentName || (documentUrl ? documentUrl.split('/').pop() : 'İmzalı_Tutanak.pdf');
  const documentSize = log?.signedDocumentSize;
  const documentDate = log?.signedDocumentDate;

  useEffect(() => {
    if (!isOpen) return;
    if (documentUrl) {
      resolveFileUrl(documentUrl).then(setResolvedUrl);
    } else {
      setResolvedUrl('');
    }
  }, [isOpen, documentUrl]);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const stored = await storeFile(file, 'documents');
      setResolvedUrl(stored.dataUrl || (await resolveFileUrl(stored.path)));
      onDocumentUploaded({
        url: stored.path,
        name: stored.name,
        size: stored.size,
      });
    } catch (err) {
      console.error('File upload failed:', err);
      alert('Dosya yüklenirken bir hata oluştu.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const isPdf = documentName?.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(documentName || '');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#161616] rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-800 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#121212] border-b border-gray-800 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                Islak İmzalı Zimmet Evrakı & Tutanak Arşivi
              </h3>
              <p className="text-[11px] text-gray-400">
                {log?.documentNumber || asset?.assetTag || 'Resmi Tutanak'} • Ayrı Klasör Deposu (/uploads/documents/)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Storage Alert Notice */}
          <div className="bg-[#1D1D1D] p-3 rounded-xl border border-gray-800 flex items-start gap-2.5 text-xs text-gray-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">Ayrı Klasör Koruması:</span>
              <p className="text-[11px] text-gray-400">
                Bu evrak veritabanı JSON metnine gömülmez; doğrudan izole edilmiş dosya deposunda saklanır. Böylece veritabanınız asla şişmez.
              </p>
            </div>
          </div>

          {/* Document Preview or Upload Box */}
          {resolvedUrl ? (
            <div className="space-y-3">
              {/* Document Meta Header */}
              <div className="bg-[#202020] p-3 rounded-xl border border-gray-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileText className="h-5 w-5 text-blue-400 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-white block truncate max-w-xs sm:max-w-sm">
                      {documentName}
                    </span>
                    <div className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                      {documentSize && <span>{formatBytes(documentSize)}</span>}
                      {documentDate && <span>• Yüklendi: {documentDate}</span>}
                      <span className="text-emerald-400 font-mono">/uploads/documents/</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={resolvedUrl}
                    download={documentName}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>İndir</span>
                  </a>
                </div>
              </div>

              {/* View Box */}
              <div className="border border-gray-800 rounded-xl overflow-hidden bg-[#0A0A0A] max-h-[50vh] flex items-center justify-center min-h-[220px]">
                {isImage ? (
                  <img
                    src={resolvedUrl}
                    alt={documentName}
                    className="max-h-[50vh] w-auto object-contain mx-auto p-2"
                  />
                ) : isPdf ? (
                  <div className="w-full h-[320px] flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <FileText className="h-16 w-16 text-purple-400/80" />
                    <span className="text-sm font-semibold text-white">PDF Tutanak Dokümanı Yüklendi</span>
                    <p className="text-xs text-gray-400 max-w-md">
                      Taranmış ıslak imzalı PDF dosyası arşivde saklanmaktadır. Tarayıcı penceresinde açabilir veya indirebilirsiniz.
                    </p>
                    <a
                      href={resolvedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#252525] hover:bg-[#303030] border border-gray-700 text-gray-200 text-xs font-semibold rounded-lg"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Tam Ekranda / Yeni Sekmede Aç</span>
                    </a>
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-2">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                    <span className="text-sm text-gray-200 font-semibold">{documentName}</span>
                    <p className="text-xs text-gray-500">Önizleme formatı desteklenmiyor.</p>
                  </div>
                )}
              </div>

              {/* Replace / Re-upload Option */}
              <div className="flex items-center justify-between pt-2">
                <label className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Farklı Bir Dosya İle Güncelle</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          ) : (
            /* Upload Empty State */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-gray-700 bg-[#191919] hover:border-gray-600'
              }`}
            >
              <div className="max-w-md mx-auto space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                  <Upload className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  Islak İmzalı Taranmış Tutanağı Yükleyin
                </h4>
                <p className="text-xs text-gray-400">
                  Personele imzalatılmış teslim formunu veya taranmış evrakı (PDF, JPG, PNG) sürükleyip bırakın veya bilgisayarınızdan seçin.
                </p>

                <div className="pt-2">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-sm cursor-pointer transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>{isUploading ? 'Yükleniyor...' : 'Dosya Seç (PDF / Resim)'}</span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      className="hidden"
                      disabled={isUploading}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>

                <span className="block text-[10px] text-gray-500">
                  Desteklenen formatlar: PDF, PNG, JPG, JPEG • Boyut: Sınırsız (Ayrı klasöre yüklenir)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#121212] border-t border-gray-800 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#252525] hover:bg-[#303030] text-gray-200 text-xs font-semibold rounded-lg cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

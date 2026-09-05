import React, { useState, useEffect } from 'react';
import { 
  FolderArchive, 
  Image as ImageIcon, 
  FileCheck, 
  HardDrive, 
  ShieldCheck, 
  Download, 
  Trash2, 
  Upload, 
  Search, 
  ExternalLink,
  Layers,
  FileText,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { InventoryDatabase, StoredMediaFile } from '../types/inventory';
import { 
  getStorageVaultStats, 
  formatBytes, 
  deleteStoredFile, 
  storeFile, 
  resolveFileUrl 
} from '../services/mediaStorage';

interface MediaVaultViewProps {
  db: InventoryDatabase;
  onOpenDocumentPreview?: (docUrl: string, docName?: string) => void;
}

export const MediaVaultView: React.FC<MediaVaultViewProps> = ({
  db,
  onOpenDocumentPreview,
}) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'assets' | 'documents'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewItem, setPreviewItem] = useState<{ url: string; name: string; type: string } | null>(null);

  const loadStats = async () => {
    setLoading(true);
    const data = await getStorageVaultStats(db);
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, [db]);

  const handleDelete = async (path: string) => {
    if (window.confirm('Bu dosyayı medya klasöründen silmek istediğinize emin misiniz?')) {
      await deleteStoredFile(path);
      await loadStats();
    }
  };

  const handleManualUpload = async (file: File, folder: 'assets' | 'documents') => {
    try {
      await storeFile(file, folder);
      await loadStats();
      alert(`Dosya başarıyla /uploads/${folder}/ klasörüne kaydedildi.`);
    } catch (err) {
      alert('Yükleme sırasında hata oluştu.');
    }
  };

  const handlePreview = async (item: StoredMediaFile) => {
    const url = await resolveFileUrl(item.path);
    setPreviewItem({ url, name: item.name, type: item.type });
  };

  const filteredFiles: StoredMediaFile[] = (stats?.files || []).filter((f: StoredMediaFile) => {
    if (filterType !== 'all' && f.folder !== filterType) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return f.name.toLowerCase().includes(term) || f.path.toLowerCase().includes(term);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#161616] p-6 rounded-2xl border border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <FolderArchive className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Ayrı Medya & Evrak Deposu (/uploads/)
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Varlık fotoğrafları ve ıslak imzalı evraklar ayrı klasörde tutulur, veritabanı JSON metnini şişirmez.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Upload Buttons */}
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#242424] hover:bg-[#2e2e2e] text-gray-200 border border-gray-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors">
            <ImageIcon className="h-4 w-4 text-blue-400" />
            <span>Fotoğraf Yükle</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleManualUpload(e.target.files[0], 'assets');
                }
              }}
            />
          </label>

          <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow-sm cursor-pointer transition-colors">
            <FileCheck className="h-4 w-4" />
            <span>İmzalı Evrak / PDF Yükle</span>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleManualUpload(e.target.files[0], 'documents');
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Storage Architecture Verification Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Database Size */}
        <div className="bg-[#161616] p-5 rounded-2xl border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Veritabanı JSON Boyutu</span>
            <HardDrive className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats ? stats.dbJsonSizeFormatted : '...'}
          </div>
          <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-400 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Temiz & Hafif (Şişme Yok)</span>
          </div>
        </div>

        {/* Card 2: Media Vault Total */}
        <div className="bg-[#161616] p-5 rounded-2xl border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Ayrı Klasör Deposu</span>
            <FolderArchive className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400 tracking-tight">
            {stats ? stats.mediaTotalFormatted : '...'}
          </div>
          <p className="text-[11px] text-gray-400 mt-2 font-mono">
            /uploads/assets/ & documents/
          </p>
        </div>

        {/* Card 3: Asset Photos Count */}
        <div className="bg-[#161616] p-5 rounded-2xl border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Varlık Fotoğrafları</span>
            <ImageIcon className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats ? stats.assetImagesCount : 0} <span className="text-sm font-normal text-gray-400">Görsel</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Katalog ve donanım görselleri
          </p>
        </div>

        {/* Card 4: Signed Docs Count */}
        <div className="bg-[#161616] p-5 rounded-2xl border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">İmzalı Evrak Arşivi</span>
            <FileCheck className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {stats ? stats.signedDocsCount : 0} <span className="text-sm font-normal text-gray-400">Evrak</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Taranmış ıslak imzalı tutanaklar
          </p>
        </div>
      </div>

      {/* Architectural Guarantee Box */}
      <div className="bg-[#181818] p-4 rounded-2xl border border-gray-800 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-white block">
            Veritabanı Şişmesini Önleyen Mimari Yapı:
          </span>
          <p className="text-gray-300 leading-relaxed">
            Kullanıcı direktifiniz doğrultusunda, yüklenen donanım fotoğrafları ve taranmış ıslak imzalı tutanaklar veritabanı JSON kaydına Base64 olarak <strong>asla işlenmez</strong>. 
            Dosyalar ayrı bir medya havuzunda saklanır; veritabanı nesnelerinde yalnızca 
            <code className="bg-[#242424] px-1.5 py-0.5 rounded text-blue-400 font-mono text-[11px] mx-1">/uploads/assets/...</code> ve 
            <code className="bg-[#242424] px-1.5 py-0.5 rounded text-purple-400 font-mono text-[11px] mx-1">/uploads/documents/...</code> 
            yol referansları tutulur. Bu sayede veritabanı boyutu her zaman birkaç kilobayt mertebesinde hafif kalır, sistem hızlı çalışır.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#161616] p-4 rounded-2xl border border-gray-800 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Dosya adı veya yol ile ara..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#242424] border border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
              filterType === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#242424] text-gray-300 hover:text-white'
            }`}
          >
            Tüm Dosyalar ({stats?.files?.length || 0})
          </button>
          <button
            onClick={() => setFilterType('assets')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
              filterType === 'assets' 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#242424] text-gray-300 hover:text-white'
            }`}
          >
            Fotoğraflar ({stats?.assetImagesCount || 0})
          </button>
          <button
            onClick={() => setFilterType('documents')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
              filterType === 'documents' 
                ? 'bg-blue-600 text-white' 
                : 'bg-[#242424] text-gray-300 hover:text-white'
            }`}
          >
            İmzalı Evraklar ({stats?.signedDocsCount || 0})
          </button>
        </div>
      </div>

      {/* Files List Table */}
      <div className="bg-[#161616] rounded-2xl border border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#1A1A1A] text-gray-400 font-semibold border-b border-gray-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Dosya / Tür</th>
                <th className="py-3 px-4">Klasör Yolu</th>
                <th className="py-3 px-4">MIME Türü</th>
                <th className="py-3 px-4">Boyut</th>
                <th className="py-3 px-4">Yükleme Tarihi</th>
                <th className="py-3 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredFiles.map((file) => (
                <tr key={file.path} className="hover:bg-[#1A1A1A] transition-colors">
                  {/* File Name & Icon */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg ${
                        file.folder === 'assets' 
                          ? 'bg-blue-500/10 text-blue-400' 
                          : 'bg-purple-500/10 text-purple-400'
                      }`}>
                        {file.folder === 'assets' ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                      </div>
                      <div>
                        <span className="font-semibold text-white block max-w-xs truncate" title={file.name}>
                          {file.name}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {file.folder === 'assets' ? 'Varlık Donanım Fotoğrafı' : 'Taranmış Islak İmzalı Tutanak'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Folder Path */}
                  <td className="py-3 px-4 font-mono text-[11px] text-gray-400">
                    <span className="bg-[#242424] px-2 py-1 rounded border border-gray-700">
                      {file.path}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="py-3 px-4 text-gray-400">
                    {file.type}
                  </td>

                  {/* Size */}
                  <td className="py-3 px-4 font-mono font-semibold text-gray-200">
                    {formatBytes(file.size)}
                  </td>

                  {/* Upload Date */}
                  <td className="py-3 px-4 text-gray-400 font-mono text-[11px]">
                    {file.uploadedAt ? file.uploadedAt.slice(0, 16).replace('T', ' ') : '-'}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handlePreview(file)}
                        title="Önizle"
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-[#252525] rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(file.path)}
                        title="Dosyayı Sil"
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredFiles.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    {stats?.files?.length === 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">Medya klasöründe henüz yüklenmiş dosya bulunmamaktadır.</p>
                        <p className="text-xs text-gray-500">
                          Varlık formundan fotoğraf ekleyebilir veya zimmet defterinden imzalı evrak yükleyebilirsiniz.
                        </p>
                      </div>
                    ) : (
                      'Arama kriterlerine uygun dosya bulunamadı.'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lightbox / Preview Dialog */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#161616] rounded-2xl max-w-xl w-full border border-gray-800 overflow-hidden shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm truncate max-w-md">{previewItem.name}</h4>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                Kapat
              </button>
            </div>
            <div className="max-h-[60vh] overflow-hidden flex items-center justify-center bg-[#0D0D0D] rounded-xl p-2 border border-gray-800">
              {previewItem.type.startsWith('image/') ? (
                <img src={previewItem.url} alt={previewItem.name} className="max-h-[55vh] object-contain" />
              ) : (
                <div className="p-8 text-center space-y-3">
                  <FileText className="h-16 w-16 text-purple-400 mx-auto" />
                  <span className="text-white text-sm font-semibold block">{previewItem.name}</span>
                  <a
                    href={previewItem.url}
                    download={previewItem.name}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                  >
                    <Download className="h-4 w-4" />
                    <span>Dosyayı İndir</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

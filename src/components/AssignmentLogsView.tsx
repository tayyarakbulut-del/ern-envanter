import React, { useState } from 'react';
import { 
  ClipboardList, 
  Search, 
  ArrowLeftRight, 
  FileText, 
  Printer, 
  CheckCircle2, 
  RotateCcw, 
  User, 
  Laptop, 
  Filter,
  Download,
  FileCheck
} from 'lucide-react';
import { InventoryDatabase, AssignmentLog } from '../types/inventory';

interface AssignmentLogsViewProps {
  db: InventoryDatabase;
  onOpenCheckout: () => void;
  onViewReceiptForLog: (log: AssignmentLog) => void;
  onOpenDocumentForLog?: (log: AssignmentLog) => void;
}

export const AssignmentLogsView: React.FC<AssignmentLogsViewProps> = ({
  db,
  onOpenCheckout,
  onViewReceiptForLog,
  onOpenDocumentForLog,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredLogs = db.logs.filter(log => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchDoc = log.documentNumber.toLowerCase().includes(term);
      const matchAsset = log.assetName.toLowerCase().includes(term);
      const matchTag = log.assetTag.toLowerCase().includes(term);
      const matchPerson = log.personName?.toLowerCase().includes(term);
      const matchDept = log.departmentName?.toLowerCase().includes(term);
      const matchHandler = log.handledBy.toLowerCase().includes(term);
      if (!matchDoc && !matchAsset && !matchTag && !matchPerson && !matchDept && !matchHandler) {
        return false;
      }
    }
    if (selectedType !== 'all' && log.actionType !== selectedType) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#161616] p-5 rounded-2xl border border-gray-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-blue-500" />
            Zimmet Defteri & Giriş-Çıkış Hareketleri
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Personele teslim edilen, depoya iade alınan ve bakıma gönderilen tüm donanımların resmi denetim kayıtları
          </p>
        </div>

        <button
          id="btn-logs-checkout"
          onClick={onOpenCheckout}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <ArrowLeftRight className="h-4 w-4" />
          <span>Yeni Zimmet Teslimi Yap</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#161616] p-4 rounded-2xl border border-gray-800 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            id="logs-search-input"
            type="text"
            placeholder="Tutanak no (ZMT-xxx), cihaz adı, barkod, personel adı veya teslim eden ile ara..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#242424] border border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="bg-[#242424] border border-gray-700 rounded-xl p-2 text-xs font-medium text-gray-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tüm Hareketler</option>
            <option value="checkout">🟢 Zimmet Çıkışı (Teslim)</option>
            <option value="checkin">🔵 Depoya İade (Tesellüm)</option>
            <option value="maintenance">🟡 Bakım / Arıza</option>
            <option value="scrap">🔴 Hurda / Düşüm</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#161616] rounded-2xl border border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#1A1A1A] text-gray-400 font-semibold border-b border-gray-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Tutanak / Belge No</th>
                <th className="py-3 px-4">İşlem Türü</th>
                <th className="py-3 px-4">Cihaz / Donanım</th>
                <th className="py-3 px-4">İlgili Personel</th>
                <th className="py-3 px-4">Tarih & Saat</th>
                <th className="py-3 px-4">İşlemi Yapan IT</th>
                <th className="py-3 px-4">Aksesuarlar & Not</th>
                <th className="py-3 px-4 text-right">Resmi Tutanak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-[#1A1A1A] transition-colors">
                  {/* Document No */}
                  <td className="py-3 px-4 font-mono font-bold text-white whitespace-nowrap">
                    {log.documentNumber}
                  </td>

                  {/* Action Badge */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {log.actionType === 'checkout' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                        <CheckCircle2 className="h-3 w-3" />
                        Zimmet Çıkışı
                      </span>
                    ) : log.actionType === 'checkin' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-950/60 text-blue-400 border border-blue-800/40">
                        <RotateCcw className="h-3 w-3" />
                        Depoya İade
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-950/60 text-amber-400 border border-amber-800/40">
                        {log.actionType}
                      </span>
                    )}
                  </td>

                  {/* Asset */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white max-w-[200px] truncate" title={log.assetName}>
                      {log.assetName}
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">{log.assetTag}</span>
                  </td>

                  {/* Person */}
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-200">{log.personName || 'Genel Depo'}</div>
                    <span className="text-[10px] text-gray-500">{log.departmentName}</span>
                  </td>

                  {/* Date */}
                  <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-gray-400">
                    {log.date}
                  </td>

                  {/* Handled By */}
                  <td className="py-3 px-4 whitespace-nowrap text-gray-300">
                    {log.handledBy}
                  </td>

                  {/* Accessories & Notes */}
                  <td className="py-3 px-4 max-w-[240px]">
                    {log.accessoriesIncluded && log.accessoriesIncluded.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {log.accessoriesIncluded.map((acc, i) => (
                          <span key={i} className="text-[10px] bg-[#242424] text-gray-300 border border-gray-700 px-1.5 py-0.2 rounded">
                            {acc}
                          </span>
                        ))}
                      </div>
                    )}
                    {log.notes && (
                      <p className="text-[11px] text-gray-400 truncate" title={log.notes}>
                        {log.notes}
                      </p>
                    )}
                  </td>

                  {/* Receipt Action */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {onOpenDocumentForLog && (
                        <button
                          title={log.signedDocumentUrl ? "Islak İmzalı Evrakı Görüntüle" : "İmzalı Evrak Yükle"}
                          onClick={() => onOpenDocumentForLog(log)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                            log.signedDocumentUrl
                              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/80'
                              : 'bg-[#242424] text-gray-400 border-gray-700 hover:text-white'
                          }`}
                        >
                          <FileCheck className="h-3.5 w-3.5 text-purple-400" />
                          <span>{log.signedDocumentUrl ? 'İmzalı Evrak' : 'Evrak Yükle'}</span>
                        </button>
                      )}
                      <button
                        onClick={() => onViewReceiptForLog(log)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#242424] hover:bg-blue-950/60 hover:text-blue-300 text-gray-300 border border-gray-700 font-medium rounded-lg transition-colors cursor-pointer text-xs"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Tutanak</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    Kayıtlı zimmet hareketi bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

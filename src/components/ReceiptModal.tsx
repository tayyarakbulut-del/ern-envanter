import React from 'react';
import { X, Printer, ShieldCheck, Download, Building2, FileCheck, UploadCloud, Barcode } from 'lucide-react';
import { Asset, AssignmentLog, Person, InventoryDatabase } from '../types/inventory';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset?: Asset | null;
  log?: AssignmentLog | null;
  db: InventoryDatabase;
  onOpenDocumentUpload?: (asset: Asset, log?: AssignmentLog) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  asset,
  log,
  db,
  onOpenDocumentUpload,
}) => {
  if (!isOpen) return null;

  // Resolve target asset and person
  const targetAsset: Asset | undefined = asset || (log ? db.assets.find(a => a.id === log.assetId) : undefined);
  const targetPerson: Person | undefined = (targetAsset?.assignedToPersonId
    ? db.people.find(p => p.id === targetAsset.assignedToPersonId)
    : undefined) || (log?.personId ? db.people.find(p => p.id === log.personId) : undefined);

  const targetBuilding = targetAsset ? db.buildings.find(b => b.id === targetAsset.buildingId) : undefined;
  const targetCity = targetAsset ? db.cities.find(c => c.id === targetAsset.cityId) : undefined;
  const targetDept = targetPerson ? db.departments.find(d => d.id === targetPerson.departmentId) : undefined;
  const targetDivision = targetPerson ? db.divisions.find(d => d.id === targetPerson.divisionId) : undefined;

  const docNumber = log?.documentNumber || `ZMT-${new Date().getFullYear()}-${targetAsset?.assetTag.replace(/[^0-9]/g, '') || '1042'}`;
  const docDate = log?.date || targetAsset?.assignedDate || new Date().toISOString().slice(0, 10);
  const handledBy = log?.handledBy || 'Deniz Korkmaz (IT Destek Uzmanı)';
  const accessories = log?.accessoriesIncluded || ['Orijinal Şarj Adaptörü', 'Taşıma Çantası', 'Optik Mouse'];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#161616] rounded-2xl max-w-3xl w-full shadow-2xl border border-gray-800 overflow-hidden my-6">
        {/* Modal Toolbar (hidden during print) */}
        <div className="bg-[#121212] border-b border-gray-800 text-white p-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-blue-400" />
            <span className="font-bold text-sm">Resmi Zimmet Teslim-Tesellüm Tutanağı</span>
          </div>
          <div className="flex items-center gap-2">
            {targetAsset && onOpenDocumentUpload && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDocumentUpload(targetAsset, log || undefined);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#242424] hover:bg-[#2e2e2e] text-purple-300 border border-purple-800/60 text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>İmzalı Evrakı Yükle / Önizle</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Yazdır / PDF İndir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet (A4 Proportion) mounted on dark container */}
        <div className="p-4 sm:p-6 bg-[#0D0D0D] max-h-[82vh] overflow-y-auto">
          <div className="p-8 sm:p-10 space-y-6 text-slate-800 printable-area bg-white rounded-xl shadow-lg border border-gray-300 text-xs">
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-xl tracking-wider">
                  IT
                </div>
                <div>
                  <h1 className="text-base font-black uppercase tracking-wider text-slate-900">
                    BİLGİ TEKNOLOJİLERİ VE HABERLEŞME DİREKTÖRLÜĞÜ
                  </h1>
                  <h2 className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                    DONANIM VE CİHAZ ZİMMET TESLİM-TESELLÜM TUTANAĞI
                  </h2>
                  <p className="text-[10px] text-slate-400">
                    Form Kodu: IT-FRM-042 • Revizyon: 04 • Gizlilik: Hizmete Özel
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-[11px] space-y-0.5">
                <div><strong className="text-slate-500">Tutanak No:</strong> <span className="font-bold text-slate-900">{docNumber}</span></div>
                <div><strong className="text-slate-500">Tarih:</strong> <span>{docDate}</span></div>
                <div><strong className="text-slate-500">Lokasyon:</strong> <span>{targetCity?.name} / {targetBuilding?.name}</span></div>
              </div>
            </div>

            {/* Party Tables: Teslim Eden & Teslim Alan */}
            <div className="grid grid-cols-2 gap-4">
              {/* Teslim Eden */}
              <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/50">
                <h3 className="font-bold text-[11px] text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2">
                  1. TESLİM EDEN (BİLGİ TEKNOLOJİLERİ)
                </h3>
                <div className="space-y-1 text-[11px]">
                  <div><span className="text-slate-500">Yetkili Adı Soyadı:</span> <strong className="text-slate-900">{handledBy}</strong></div>
                  <div><span className="text-slate-500">Departman:</span> Bilgi Teknolojileri ve Sistem Yönetimi</div>
                  <div><span className="text-slate-500">Birim / Şube:</span> Altyapı ve Kullanıcı Destek</div>
                </div>
              </div>

              {/* Teslim Alan */}
              <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/50">
                <h3 className="font-bold text-[11px] text-slate-900 uppercase border-b border-slate-200 pb-1 mb-2">
                  2. TESLİM ALAN (ZİMMET SAHİBİ PERSONEL)
                </h3>
                <div className="space-y-1 text-[11px]">
                  <div><span className="text-slate-500">Adı Soyadı:</span> <strong className="text-slate-900">{targetPerson?.fullName || 'Belirtilmedi'}</strong></div>
                  <div><span className="text-slate-500">Sicil No:</span> <span className="font-mono font-bold">{targetPerson?.employeeId || '-'}</span></div>
                  <div><span className="text-slate-500">Unvan:</span> {targetPerson?.title || '-'}</div>
                  <div><span className="text-slate-500">Departman / Bölüm:</span> {targetDept?.name} {targetDivision ? `(${targetDivision.name})` : ''}</div>
                  <div><span className="text-slate-500">E-Posta / Dahili:</span> {targetPerson?.email} • Ext: {targetPerson?.extension || '-'}</div>
                </div>
              </div>
            </div>

            {/* Asset Specs Table */}
            <div>
              <h3 className="font-bold text-[11px] text-slate-900 uppercase mb-2">
                3. TESLİM EDİLEN DONANIM VE TEKNİK ÖZELLİKLER
              </h3>
              <table className="w-full border border-slate-300 text-left text-[11px]">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-300">Demirbaş & Nesne No</th>
                    <th className="p-2 border-r border-slate-300">Donanım Tanımı / Kategori</th>
                    <th className="p-2 border-r border-slate-300">Marka & Model</th>
                    <th className="p-2 border-r border-slate-300">Seri Numarası</th>
                    <th className="p-2">Teknik Detaylar</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border-r border-slate-300 font-mono font-bold text-slate-900">
                      <div>{targetAsset?.assetTag || 'AST-PC-1042'}</div>
                      {targetAsset?.objectCode && (
                        <div className="text-[10px] text-amber-700 font-bold">
                          Nesne No: {targetAsset.objectCode}
                        </div>
                      )}
                    </td>
                    <td className="p-2 border-r border-slate-300">
                      <span className="font-semibold block">{targetAsset?.name}</span>
                      <span className="text-[10px] text-slate-500">{targetAsset?.subCategory}</span>
                    </td>
                    <td className="p-2 border-r border-slate-300">
                      {targetAsset?.brand} {targetAsset?.model}
                    </td>
                    <td className="p-2 border-r border-slate-300 font-mono">
                      {targetAsset?.serialNumber || 'SN-UNKNOWN'}
                    </td>
                    <td className="p-2 text-[10px] text-slate-600">
                      {targetAsset?.specs?.cpu && <div>CPU: {targetAsset.specs.cpu}</div>}
                      {targetAsset?.specs?.ram && <div>RAM: {targetAsset.specs.ram} / {targetAsset.specs.storage}</div>}
                      {targetAsset?.specs?.ipAddress && <div>IP: {targetAsset.specs.ipAddress}</div>}
                      {targetAsset?.specs?.macAddress && <div>MAC: {targetAsset.specs.macAddress}</div>}
                      {targetAsset?.specs?.extensionNumber && <div>Dahili: {targetAsset.specs.extensionNumber}</div>}
                      {!targetAsset?.specs?.cpu && !targetAsset?.specs?.ipAddress && <span>Standart Kurumsal Konfigürasyon</span>}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Accessories Checklist */}
            <div>
              <h3 className="font-bold text-[11px] text-slate-900 uppercase mb-1.5">
                4. BERABERİNDE TESLİM EDİLEN MALZEME VE AKSESUARLAR
              </h3>
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/40">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {accessories.map((acc, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="h-3 w-3 border border-slate-600 bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">
                        ✓
                      </span>
                      <span className="text-[11px]">{acc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legal / Commitment Clause (Taahhütname) */}
            <div className="border border-slate-200 rounded-lg p-3 bg-amber-50/40 text-[10.5px] leading-relaxed text-slate-700">
              <h4 className="font-bold text-slate-900 uppercase mb-1 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
                ZİMMET TAAHHÜTNAMESİ VE ŞİRKET BİLİŞİM POLİTİKASI
              </h4>
              <p>
                Yukarıda teknik özellikleri, seri numarası ve aksesuarları belirtilen şirket bilişim donanımını eksiksiz, hasarsız ve çalışır vaziyette teslim aldım. Söz konusu cihazı münhasıran şirket iş faaliyetleri kapsamında ve Şirket Bilgi Güvenliği Politikalarına uygun olarak kullanacağımı; üçüncü şahıslara devretmeyeceğimi, satmayacağımı veya kiralamayacağımı; meydana gelebilecek kullanıcı kaynaklı hasar, arıza veya kayıp durumunda derhal Bilgi Teknolojileri Direktörlüğü'ne bildireceğimi; şirket ile iş akdimin herhangi bir sebeple sona ermesi veya şirketin talep etmesi halinde donanımı ve tüm aksesuarlarını eksiksiz ve çalışır vaziyette iade edeceğimi gayrikabili rücu kabul, beyan ve taahhüt ederim.
              </p>
            </div>

            {/* Signatures Blocks */}
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="border border-slate-300 rounded-xl p-4 text-center space-y-8">
                <div className="font-bold text-[11px] uppercase text-slate-900 border-b border-slate-200 pb-1">
                  TESLİM EDEN (BİLGİ TEKNOLOJİLERİ)
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="font-bold">{handledBy}</div>
                  <div className="text-slate-500">Tarih: {docDate}</div>
                  <div className="text-slate-400 text-[10px] italic pt-4">İmza / Kaşe</div>
                </div>
              </div>

              <div className="border border-slate-300 rounded-xl p-4 text-center space-y-8">
                <div className="font-bold text-[11px] uppercase text-slate-900 border-b border-slate-200 pb-1">
                  TESLİM ALAN (ZİMMET SAHİBİ)
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="font-bold">{targetPerson?.fullName || 'Personel'}</div>
                  <div className="text-slate-500">Tarih: {docDate}</div>
                  <div className="text-slate-400 text-[10px] italic pt-4">İmza</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

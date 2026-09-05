import React, { useState } from 'react';
import { 
  X, 
  Laptop, 
  Network, 
  PhoneCall, 
  Radio, 
  KeyRound, 
  MapPin, 
  Building2, 
  User, 
  Calendar, 
  FileText, 
  ArrowLeftRight, 
  RotateCcw, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  Barcode,
  Image as ImageIcon,
  FileCheck,
  ShieldCheck,
  Zap,
  HardDrive,
  Cpu
} from 'lucide-react';
import { Asset, InventoryDatabase } from '../types/inventory';
import { MediaImage } from './MediaImage';

interface AssetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  db: InventoryDatabase;
  onEdit: (asset: Asset) => void;
  onDelete: (assetId: string) => void;
  onCheckout: (asset: Asset) => void;
  onCheckin: (asset: Asset) => void;
  onViewReceipt: (asset: Asset) => void;
  onOpenDocumentModal?: (asset: Asset) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  isOpen,
  onClose,
  asset,
  db,
  onEdit,
  onDelete,
  onCheckout,
  onCheckin,
  onViewReceipt,
  onOpenDocumentModal,
}) => {
  if (!isOpen || !asset) return null;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const person = db.people.find(p => p.id === asset.assignedToPersonId);
  const city = db.cities.find(c => c.id === asset.cityId);
  const building = db.buildings.find(b => b.id === asset.buildingId);
  const ptpTargetBuilding = asset.specs?.ptpTargetBuildingId
    ? db.buildings.find(b => b.id === asset.specs?.ptpTargetBuildingId)
    : undefined;

  const assetLogs = db.logs.filter(l => l.assetId === asset.id);
  const allImages = asset.images && asset.images.length > 0 
    ? asset.images 
    : (asset.primaryImage ? [asset.primaryImage] : []);

  const activeImage = allImages[selectedImageIndex] || allImages[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#161616] rounded-2xl max-w-3xl w-full shadow-2xl border border-gray-800 overflow-hidden my-6 text-gray-200">
        {/* Header */}
        <div className="bg-[#121212] border-b border-gray-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#242424] border border-gray-700 flex items-center justify-center">
              {asset.category === 'network_devices' ? (
                <Network className="h-5 w-5 text-purple-400" />
              ) : asset.category === 'telephony' ? (
                <PhoneCall className="h-5 w-5 text-amber-400" />
              ) : (
                <Laptop className="h-5 w-5 text-blue-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white">{asset.name}</h3>
                <span className="text-xs font-mono font-bold bg-[#242424] text-blue-300 px-2 py-0.5 rounded border border-gray-700">
                  {asset.assetTag}
                </span>
                {asset.objectCode && (
                  <span className="text-xs font-mono font-bold bg-amber-950/60 text-amber-400 px-2 py-0.5 rounded border border-amber-800/40 flex items-center gap-1">
                    <Barcode className="h-3 w-3" />
                    <span>Nesne No: {asset.objectCode}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {asset.brand} {asset.model} • Seri No: <span className="font-mono text-gray-200">{asset.serialNumber}</span>
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-lg cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs max-h-[78vh] overflow-y-auto">
          
          {/* ASSET IMAGE & GALLERY SECTION */}
          {allImages.length > 0 && (
            <div className="bg-[#1A1A1A] rounded-2xl border border-gray-800 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-blue-400" />
                  <span>Varlık Donanım Fotoğrafları ({allImages.length})</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  Ayrı Klasör: /uploads/assets/
                </span>
              </div>

              {/* Main Image Display */}
              <div className="h-52 w-full rounded-xl overflow-hidden bg-[#0F0F0F] border border-gray-800 flex items-center justify-center relative">
                <MediaImage
                  src={activeImage}
                  alt={asset.name}
                  className="h-full w-full object-contain p-2"
                />
              </div>

              {/* Thumbnail Bar if multiple */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`h-14 w-18 rounded-lg overflow-hidden border shrink-0 bg-[#222] cursor-pointer transition-all ${
                        selectedImageIndex === idx ? 'border-blue-500 ring-2 ring-blue-500/40' : 'border-gray-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <MediaImage src={img} alt="Thumbnail" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Status & Assignment Banner */}
          <div className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1A1A1A] border-gray-800">
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block mb-1">
                Güncel Sahiplik & Depo Durumu
              </span>
              {asset.status === 'in_use' && person ? (
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-bold text-white text-sm">
                    {person.fullName}
                  </span>
                  <span className="text-gray-400">({person.title})</span>
                </div>
              ) : asset.status === 'in_stock' ? (
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-400"></span>
                  <span className="font-bold text-blue-400 text-sm">Depoda (Serbest / Zimmete Hazır)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
                  <span className="font-bold text-amber-400 text-sm">Bakımda / Onarımda</span>
                </div>
              )}
              {asset.assignedDate && (
                <span className="text-[11px] text-gray-400 block mt-0.5 font-mono">
                  Teslim Tarihi: {asset.assignedDate}
                </span>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {asset.status === 'in_use' ? (
                <>
                  <button
                    onClick={() => {
                      onClose();
                      onCheckin(asset);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900/80 text-amber-300 border border-amber-800/60 font-semibold rounded-lg cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>İade Al</span>
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onViewReceipt(asset);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-950/80 text-purple-300 hover:bg-purple-900/80 font-semibold rounded-lg border border-purple-800/60 cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Zimmet Formu</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onCheckout(asset);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                  <span>Personele Zimmetle</span>
                </button>
              )}

              {/* Signed Document Preview or Upload Action */}
              <button
                onClick={() => {
                  onClose();
                  if (onOpenDocumentModal) onOpenDocumentModal(asset);
                  else onViewReceipt(asset);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold cursor-pointer ${
                  asset.signedDocumentUrl
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/80'
                    : 'bg-[#242424] text-gray-300 border-gray-700 hover:text-white'
                }`}
              >
                <FileCheck className="h-3.5 w-3.5 text-purple-400" />
                <span>{asset.signedDocumentUrl ? 'İmzalı Evrakı Gör' : 'İmzalı Evrak Ekle'}</span>
              </button>
            </div>
          </div>

          {/* Location & Network Classification */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-[#242424] p-3 rounded-xl border border-gray-700/60">
              <span className="text-gray-400 block text-[10px]">Şehir & Bölge</span>
              <strong className="text-white text-xs">{city?.name} ({city?.region})</strong>
            </div>
            <div className="bg-[#242424] p-3 rounded-xl border border-gray-700/60">
              <span className="text-gray-400 block text-[10px]">Bina / Tesis</span>
              <strong className="text-white text-xs">{building?.name}</strong>
            </div>
            <div className="bg-[#242424] p-3 rounded-xl border border-gray-700/60">
              <span className="text-gray-400 block text-[10px]">Ağ Tipi (Yerel/Uzak)</span>
              <span
                className={`font-bold inline-block px-1.5 py-0.5 rounded text-[10px] mt-0.5 ${
                  asset.isLocal 
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' 
                    : 'bg-purple-950/80 text-purple-400 border border-purple-800/60'
                }`}
              >
                {asset.isLocal ? 'Yerel Ağ (LAN - On-Premise)' : 'Uzak Saha / VPN'}
              </span>
            </div>
          </div>

          {/* Detailed Technical Specs */}
          {asset.specs && (
            <div className="border border-gray-800 bg-[#1A1A1A] rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Teknik Parametreler & Donanım Özellikleri
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                {asset.specs.cpu && (
                  <div><span className="text-gray-400 block text-[10px]">İşlemci (CPU):</span> <strong className="text-white">{asset.specs.cpu}</strong></div>
                )}
                {asset.specs.ram && (
                  <div><span className="text-gray-400 block text-[10px]">RAM:</span> <strong className="text-white">{asset.specs.ram}</strong></div>
                )}
                {asset.specs.storage && (
                  <div><span className="text-gray-400 block text-[10px]">Depolama (SSD):</span> <strong className="text-white">{asset.specs.storage}</strong></div>
                )}
                {asset.specs.gpu && (
                  <div><span className="text-gray-400 block text-[10px]">Ekran Kartı:</span> <strong className="text-white">{asset.specs.gpu}</strong></div>
                )}
                {asset.specs.screenSize && (
                  <div><span className="text-gray-400 block text-[10px]">Ekran Boyutu:</span> <strong className="text-white">{asset.specs.screenSize}</strong></div>
                )}
                {asset.specs.batteryHealth && (
                  <div><span className="text-gray-400 block text-[10px]">Batarya Sağlığı:</span> <strong className="text-white">{asset.specs.batteryHealth}</strong></div>
                )}
                {asset.specs.os && (
                  <div><span className="text-gray-400 block text-[10px]">İşletim Sistemi:</span> <strong className="text-white">{asset.specs.os}</strong></div>
                )}
                {asset.specs.ipAddress && (
                  <div><span className="text-gray-400 block text-[10px]">Yönetim / Statik IP:</span> <strong className="text-white font-mono">{asset.specs.ipAddress}</strong></div>
                )}
                {asset.specs.macAddress && (
                  <div><span className="text-gray-400 block text-[10px]">MAC Adresi:</span> <strong className="text-white font-mono">{asset.specs.macAddress}</strong></div>
                )}
                {asset.specs.subnetMask && (
                  <div><span className="text-gray-400 block text-[10px]">Subnet Mask:</span> <strong className="text-white font-mono">{asset.specs.subnetMask}</strong></div>
                )}
                {asset.specs.gateway && (
                  <div><span className="text-gray-400 block text-[10px]">Ağ Geçidi (Gateway):</span> <strong className="text-white font-mono">{asset.specs.gateway}</strong></div>
                )}
                {asset.specs.vlan && (
                  <div><span className="text-gray-400 block text-[10px]">VLAN:</span> <strong className="text-white">{asset.specs.vlan}</strong></div>
                )}
                {asset.specs.ports && (
                  <div><span className="text-gray-400 block text-[10px]">Port Adedi:</span> <strong className="text-white">{asset.specs.ports} Port {asset.specs.poeSupported ? '(PoE+)' : ''}</strong></div>
                )}
                {asset.specs.rackUnit && (
                  <div><span className="text-gray-400 block text-[10px]">Kabin Boyutu:</span> <strong className="text-white">{asset.specs.rackUnit}</strong></div>
                )}
                {asset.specs.powerWatt && (
                  <div><span className="text-gray-400 block text-[10px]">Güç Tüketimi:</span> <strong className="text-white">{asset.specs.powerWatt} Watt</strong></div>
                )}
                {asset.specs.extensionNumber && (
                  <div><span className="text-gray-400 block text-[10px]">Dahili Numara:</span> <strong className="text-white font-mono">{asset.specs.extensionNumber}</strong></div>
                )}
                {asset.specs.sipServer && (
                  <div><span className="text-gray-400 block text-[10px]">SIP Santral:</span> <strong className="text-white font-mono">{asset.specs.sipServer}</strong></div>
                )}
                {asset.specs.ptpFrequency && (
                  <div><span className="text-gray-400 block text-[10px]">PtP Frekansı:</span> <strong className="text-white">{asset.specs.ptpFrequency}</strong></div>
                )}
                {asset.specs.ptpDistanceKm && (
                  <div><span className="text-gray-400 block text-[10px]">Link Mesafesi:</span> <strong className="text-white">{asset.specs.ptpDistanceKm} km</strong></div>
                )}
                {asset.specs.ptpSignalRssi && (
                  <div><span className="text-gray-400 block text-[10px]">Sinyal (RSSI):</span> <strong className="text-white font-mono">{asset.specs.ptpSignalRssi}</strong></div>
                )}
                {ptpTargetBuilding && (
                  <div><span className="text-gray-400 block text-[10px]">Karşı Hedef Bina:</span> <strong className="text-white">{ptpTargetBuilding.name}</strong></div>
                )}
                {asset.specs.licenseKey && (
                  <div className="col-span-2"><span className="text-gray-400 block text-[10px]">Lisans Kodu:</span> <strong className="text-white font-mono">{asset.specs.licenseKey}</strong></div>
                )}
                {asset.specs.version && (
                  <div><span className="text-gray-400 block text-[10px]">Sürüm:</span> <strong className="text-white">{asset.specs.version}</strong></div>
                )}
              </div>
            </div>
          )}

          {/* Assignment Movement History (Logs) */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-gray-400" />
              Cihazın Giriş-Çıkış ve Zimmet Geçmişi ({assetLogs.length})
            </h4>
            {assetLogs.length > 0 ? (
              <div className="border border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-800">
                {assetLogs.map(l => (
                  <div key={l.id} className="p-3 bg-[#1A1A1A] hover:bg-[#202020] flex items-center justify-between text-[11px] transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{l.documentNumber}</span>
                        <span className={`px-1.5 py-0.2 rounded font-medium text-[10px] ${
                          l.actionType === 'checkout' 
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' 
                            : 'bg-blue-950/80 text-blue-400 border border-blue-800/60'
                        }`}>
                          {l.actionType === 'checkout' ? 'Zimmet Teslimi' : 'Depoya İade'}
                        </span>
                        {l.signedDocumentUrl && (
                          <span className="bg-purple-950/80 text-purple-300 border border-purple-800/60 px-1.5 py-0.2 rounded text-[10px] flex items-center gap-1">
                            <FileCheck className="h-2.5 w-2.5" />
                            <span>İmzalı Evrak Var</span>
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 mt-0.5">
                        {l.personName || 'Depo'} • {l.departmentName}
                      </p>
                    </div>
                    <div className="text-right text-gray-400 font-mono">
                      {l.date}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic py-1">Bu cihaz için geçmiş hareket kaydı bulunmamaktadır.</p>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
            <button
              onClick={() => {
                if (window.confirm(`${asset.name} cihazını silmek istediğinize emin misiniz?`)) {
                  onDelete(asset.id);
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1 text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Cihazı Sil</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onEdit(asset);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#242424] hover:bg-[#2e2e2e] text-gray-200 border border-gray-700 font-semibold rounded-lg cursor-pointer"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Düzenle</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

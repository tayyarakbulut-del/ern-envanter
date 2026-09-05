import React, { useState, useEffect } from 'react';
import { 
  X, 
  Laptop, 
  Network, 
  PhoneCall, 
  KeyRound, 
  Server, 
  Radio, 
  Save, 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Star, 
  ShieldCheck, 
  Cpu, 
  Hash, 
  Barcode 
} from 'lucide-react';
import { Asset, AssetCategory, AssetSubCategory, AssetStatus, InventoryDatabase } from '../types/inventory';
import { storeFile } from '../services/mediaStorage';
import { MediaImage } from './MediaImage';

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: Asset) => void;
  assetToEdit?: Asset | null;
  db: InventoryDatabase;
}

export const AssetFormModal: React.FC<AssetFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  assetToEdit,
  db,
}) => {
  if (!isOpen) return null;

  const [category, setCategory] = useState<AssetCategory>(assetToEdit?.category || 'user_devices');
  const [subCategory, setSubCategory] = useState<AssetSubCategory>(assetToEdit?.subCategory || 'Laptop');
  const [assetTag, setAssetTag] = useState(assetToEdit?.assetTag || '');
  const [objectCode, setObjectCode] = useState(assetToEdit?.objectCode || '');
  const [serialNumber, setSerialNumber] = useState(assetToEdit?.serialNumber || '');
  const [name, setName] = useState(assetToEdit?.name || '');
  const [brand, setBrand] = useState(assetToEdit?.brand || '');
  const [model, setModel] = useState(assetToEdit?.model || '');
  const [cityId, setCityId] = useState(assetToEdit?.cityId || db.cities[0]?.id || '');
  const [buildingId, setBuildingId] = useState(assetToEdit?.buildingId || db.buildings[0]?.id || '');
  const [locationDetail, setLocationDetail] = useState(assetToEdit?.locationDetail || '');
  const [isLocal, setIsLocal] = useState(assetToEdit ? assetToEdit.isLocal : true);
  const [status, setStatus] = useState<AssetStatus>(assetToEdit?.status || 'in_stock');
  const [purchaseDate, setPurchaseDate] = useState(assetToEdit?.purchaseDate || '');
  const [warrantyEndDate, setWarrantyEndDate] = useState(assetToEdit?.warrantyEndDate || '');
  const [supplier, setSupplier] = useState(assetToEdit?.supplier || '');
  const [cost, setCost] = useState(assetToEdit?.cost?.toString() || '');
  const [currency, setCurrency] = useState<'TRY' | 'USD' | 'EUR'>(assetToEdit?.currency || 'USD');
  const [notes, setNotes] = useState(assetToEdit?.notes || '');

  // Images state (separate folder paths)
  const [images, setImages] = useState<string[]>(assetToEdit?.images || []);
  const [primaryImage, setPrimaryImage] = useState<string>(assetToEdit?.primaryImage || (assetToEdit?.images?.[0] || ''));
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Specs state - Hardware / PC
  const [cpu, setCpu] = useState(assetToEdit?.specs?.cpu || '');
  const [ram, setRam] = useState(assetToEdit?.specs?.ram || '');
  const [storage, setStorage] = useState(assetToEdit?.specs?.storage || '');
  const [gpu, setGpu] = useState(assetToEdit?.specs?.gpu || '');
  const [screenSize, setScreenSize] = useState(assetToEdit?.specs?.screenSize || '');
  const [batteryHealth, setBatteryHealth] = useState(assetToEdit?.specs?.batteryHealth || '');
  const [os, setOs] = useState(assetToEdit?.specs?.os || '');

  // Specs state - Network
  const [ipAddress, setIpAddress] = useState(assetToEdit?.specs?.ipAddress || '');
  const [macAddress, setMacAddress] = useState(assetToEdit?.specs?.macAddress || '');
  const [subnetMask, setSubnetMask] = useState(assetToEdit?.specs?.subnetMask || '');
  const [gateway, setGateway] = useState(assetToEdit?.specs?.gateway || '');
  const [dns, setDns] = useState(assetToEdit?.specs?.dns || '');
  const [vlan, setVlan] = useState(assetToEdit?.specs?.vlan || '');
  const [ports, setPorts] = useState(assetToEdit?.specs?.ports?.toString() || '');
  const [poeSupported, setPoeSupported] = useState(assetToEdit?.specs?.poeSupported || false);
  const [wifiStandard, setWifiStandard] = useState(assetToEdit?.specs?.wifiStandard || '');
  const [rackUnit, setRackUnit] = useState(assetToEdit?.specs?.rackUnit || '');
  const [powerWatt, setPowerWatt] = useState(assetToEdit?.specs?.powerWatt?.toString() || '');

  // Specs state - PtP
  const [ptpFrequency, setPtpFrequency] = useState(assetToEdit?.specs?.ptpFrequency || '60 GHz / 5 GHz');
  const [ptpDistanceKm, setPtpDistanceKm] = useState(assetToEdit?.specs?.ptpDistanceKm?.toString() || '');
  const [ptpTargetBuildingId, setPtpTargetBuildingId] = useState(assetToEdit?.specs?.ptpTargetBuildingId || '');
  const [ptpAzimuth, setPtpAzimuth] = useState(assetToEdit?.specs?.ptpAzimuth || '');
  const [ptpSignalRssi, setPtpSignalRssi] = useState(assetToEdit?.specs?.ptpSignalRssi || '');

  // Specs state - Telephony
  const [extensionNumber, setExtensionNumber] = useState(assetToEdit?.specs?.extensionNumber || '');
  const [sipServer, setSipServer] = useState(assetToEdit?.specs?.sipServer || 'sip.sirket.local');
  const [codec, setCodec] = useState(assetToEdit?.specs?.codec || '');
  const [protocol, setProtocol] = useState(assetToEdit?.specs?.protocol || 'SIP');

  // Specs state - Software
  const [licenseKey, setLicenseKey] = useState(assetToEdit?.specs?.licenseKey || '');
  const [licenseType, setLicenseType] = useState(assetToEdit?.specs?.licenseType || 'per_device');
  const [userLimit, setUserLimit] = useState(assetToEdit?.specs?.userLimit?.toString() || '');
  const [expireDate, setExpireDate] = useState(assetToEdit?.specs?.expireDate || '');
  const [version, setVersion] = useState(assetToEdit?.specs?.version || '');

  // Auto suggest codes if creating new asset
  useEffect(() => {
    if (!assetToEdit) {
      const year = new Date().getFullYear();
      if (!assetTag) {
        const prefix = category === 'network_devices' ? 'AST-NET' : category === 'telephony' ? 'AST-TEL' : category === 'software_licenses' ? 'AST-LIC' : 'AST-PC';
        const rand = Math.floor(1000 + Math.random() * 9000);
        setAssetTag(`${prefix}-${rand}`);
      }
      if (!objectCode) {
        const randObj = Math.floor(10000 + Math.random() * 90000);
        setObjectCode(`NSN-${year}-${randObj}`);
      }
    }
  }, [category, assetToEdit]);

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploadingImage(true);
      const stored = await storeFile(file, 'assets');
      const newImages = [...images, stored.path];
      setImages(newImages);
      if (!primaryImage) {
        setPrimaryImage(stored.path);
      }
    } catch (err) {
      alert('Fotoğraf yüklenirken hata oluştu.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = (path: string) => {
    const updated = images.filter(img => img !== path);
    setImages(updated);
    if (primaryImage === path) {
      setPrimaryImage(updated[0] || '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !assetTag.trim()) {
      alert('Lütfen cihaz adı ve demirbaş kodunu giriniz.');
      return;
    }

    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const newAsset: Asset = {
      id: assetToEdit?.id || 'ast-' + Date.now(),
      assetTag: assetTag.trim(),
      objectCode: objectCode.trim() || undefined,
      serialNumber: serialNumber.trim() || 'SN-' + Date.now().toString().slice(-6),
      name: name.trim(),
      category,
      subCategory,
      brand: brand.trim() || 'Genel',
      model: model.trim() || name.trim(),
      cityId,
      buildingId,
      locationDetail: locationDetail.trim() || 'Ana Depo',
      isLocal,
      status,
      assignedToPersonId: assetToEdit?.assignedToPersonId,
      assignedDate: assetToEdit?.assignedDate,
      purchaseDate,
      warrantyEndDate,
      supplier,
      cost: cost ? parseFloat(cost) : undefined,
      currency,
      images: images.length > 0 ? images : undefined,
      primaryImage: primaryImage || images[0] || undefined,
      signedDocumentUrl: assetToEdit?.signedDocumentUrl,
      specs: {
        // Hardware / PC
        cpu: cpu.trim() || undefined,
        ram: ram.trim() || undefined,
        storage: storage.trim() || undefined,
        gpu: gpu.trim() || undefined,
        screenSize: screenSize.trim() || undefined,
        batteryHealth: batteryHealth.trim() || undefined,
        os: os.trim() || undefined,

        // Network
        ipAddress: ipAddress.trim() || undefined,
        macAddress: macAddress.trim() || undefined,
        subnetMask: subnetMask.trim() || undefined,
        gateway: gateway.trim() || undefined,
        dns: dns.trim() || undefined,
        vlan: vlan.trim() || undefined,
        ports: ports ? parseInt(ports) : undefined,
        poeSupported,
        wifiStandard: wifiStandard.trim() || undefined,
        rackUnit: rackUnit.trim() || undefined,
        powerWatt: powerWatt ? parseFloat(powerWatt) : undefined,

        // PtP
        ptpFrequency: category === 'network_devices' && subCategory === 'PtP Yansıtıcı' ? ptpFrequency : undefined,
        ptpDistanceKm: ptpDistanceKm ? parseFloat(ptpDistanceKm) : undefined,
        ptpTargetBuildingId: ptpTargetBuildingId || undefined,
        ptpAzimuth: ptpAzimuth.trim() || undefined,
        ptpSignalRssi: ptpSignalRssi.trim() || undefined,

        // Telephony
        extensionNumber: category === 'telephony' ? extensionNumber.trim() : undefined,
        sipServer: category === 'telephony' ? sipServer.trim() : undefined,
        codec: codec.trim() || undefined,
        protocol: protocol.trim() || undefined,

        // Software
        licenseKey: category === 'software_licenses' ? licenseKey.trim() : undefined,
        licenseType: category === 'software_licenses' ? (licenseType as any) : undefined,
        userLimit: userLimit ? parseInt(userLimit) : undefined,
        expireDate: expireDate || undefined,
        version: version.trim() || undefined,
      },
      notes,
      createdAt: assetToEdit?.createdAt || nowStr,
      updatedAt: nowStr,
    };

    onSave(newAsset);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#161616] rounded-2xl max-w-3xl w-full shadow-2xl border border-gray-800 overflow-hidden my-6 text-gray-200">
        {/* Modal Header */}
        <div className="bg-[#121212] border-b border-gray-800 text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <Laptop className="h-5 w-5 text-blue-500" />
              {assetToEdit ? 'Cihaz / Varlık Düzenle' : 'Yeni Donanım & Envanter Kaydı'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Görseller, teknik spesifikasyonlar, seri nesne no ve ağ parametreleri
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-lg cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto text-xs">
          
          {/* VARLIK RESİMLERİ (AYRI KLASÖR /UPLOADS/ASSETS/) */}
          <div className="p-4 bg-[#1A1A1A] rounded-2xl border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-blue-400" />
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  Varlık Resimleri & Donanım Fotoğrafları
                </h4>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                <ShieldCheck className="h-3 w-3" />
                <span>Ayrı Klasör Deposu (/uploads/assets/) • DB Şişmez</span>
              </div>
            </div>

            {/* Images Gallery Strip */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 pt-1">
                {images.map((imgPath) => {
                  const isPrimary = primaryImage === imgPath;
                  return (
                    <div 
                      key={imgPath} 
                      className={`relative rounded-xl overflow-hidden border group bg-[#202020] h-24 ${
                        isPrimary ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-gray-700'
                      }`}
                    >
                      <MediaImage
                        src={imgPath}
                        alt="Cihaz Fotoğrafı"
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                        <div className="flex justify-between items-center">
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(imgPath)}
                            title="Kapak Fotoğrafı Yap"
                            className={`p-1 rounded ${isPrimary ? 'text-amber-400 bg-amber-400/20' : 'text-gray-300 hover:text-amber-400'}`}
                          >
                            <Star className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(imgPath)}
                            title="Fotoğrafı Kaldır"
                            className="p-1 text-rose-400 hover:text-rose-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        {isPrimary && (
                          <span className="text-[9px] bg-blue-600 text-white px-1 py-0.2 rounded font-semibold text-center">
                            Kapak
                          </span>
                        )}
                      </div>

                      {isPrimary && (
                        <div className="absolute bottom-1 left-1 group-hover:hidden">
                          <span className="text-[9px] bg-blue-600/90 text-white px-1.5 py-0.2 rounded font-semibold">
                            Kapak
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Upload Trigger */}
            <div>
              <label className="border border-dashed border-gray-700 hover:border-blue-500 bg-[#222222] hover:bg-[#252525] rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-colors text-gray-300">
                <Upload className="h-4 w-4 text-blue-400" />
                <span className="font-semibold text-xs">
                  {isUploadingImage ? 'Fotoğraf Yükleniyor...' : 'Fotoğraf Ekle (JPG, PNG, WebP)'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploadingImage}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageUpload(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {/* Category & SubCategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Ana Kategori *</label>
              <select
                value={category}
                onChange={e => {
                  const cat = e.target.value as AssetCategory;
                  setCategory(cat);
                  if (cat === 'network_devices') setSubCategory('Switch');
                  else if (cat === 'telephony') setSubCategory('IP Telefon');
                  else if (cat === 'software_licenses') setSubCategory('ERP / CRM');
                  else if (cat === 'infrastructure') setSubCategory('Rack Kabin');
                  else setSubCategory('Laptop');
                }}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2.5 font-medium text-white focus:outline-none focus:border-blue-500"
              >
                <option value="user_devices">💻 Son Kullanıcı Cihazları (PC/Laptop/Monitör)</option>
                <option value="network_devices">🌐 Ağ & Network (Switch/AP/PtP Radyolink)</option>
                <option value="telephony">📞 IP Telefon & Santral Donanımları</option>
                <option value="software_licenses">🔑 Özel Uygulamalar & Lisanslar</option>
                <option value="infrastructure">🗄️ Sistem Odası Altyapı (UPS/Kabin/Sunucu)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Alt Donanım Türü *</label>
              <select
                value={subCategory}
                onChange={e => setSubCategory(e.target.value as AssetSubCategory)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2.5 font-medium text-white focus:outline-none focus:border-blue-500"
              >
                {category === 'network_devices' && (
                  <>
                    <option value="Switch">Switch (Omurga / Kenar Dağıtım)</option>
                    <option value="Access Point">Access Point (Wi-Fi 6 AP)</option>
                    <option value="PtP Yansıtıcı">PtP Yansıtıcı (Noktadan Noktaya Radyolink)</option>
                    <option value="Router & Firewall">Router & Firewall (Güvenlik Duvarı)</option>
                  </>
                )}
                {category === 'user_devices' && (
                  <>
                    <option value="Laptop">Laptop (Dizüstü Bilgisayar)</option>
                    <option value="Masaüstü PC">Masaüstü PC (Desktop/Workstation)</option>
                    <option value="Monitör">Monitör</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Yazıcı / Barkod">Yazıcı / Barkod Okuyucu</option>
                  </>
                )}
                {category === 'telephony' && (
                  <>
                    <option value="IP Telefon">IP Telefon (Masaüstü VoIP)</option>
                    <option value="DECT Telefon">DECT Telsiz Telefon</option>
                    <option value="Konferans Cihazı">Konferans Santrali</option>
                    <option value="IP Santral">IP Santral Ünitesi</option>
                  </>
                )}
                {category === 'software_licenses' && (
                  <>
                    <option value="ERP / CRM">ERP / CRM Yazılımı (SAP, Logo vb.)</option>
                    <option value="İşletim Sistemi">İşletim Sistemi (Windows Server, Linux vb.)</option>
                    <option value="Güvenlik / Antivirüs">Güvenlik / Antivirüs / EDR</option>
                    <option value="Özel Yazılım">Özel Şirket Yazılımı / Lisans</option>
                  </>
                )}
                {category === 'infrastructure' && (
                  <>
                    <option value="Rack Kabin">Rack Kabin</option>
                    <option value="UPS Güç Kaynağı">UPS Güç Kaynağı</option>
                    <option value="Sunucu">Fiziksel Sunucu</option>
                    <option value="Kamera / NVR">Kamera / NVR Güvenlik</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Identification Codes: Name, Asset Tag, Object Code & Serial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Cihaz / Donanım Tanımı *</label>
              <input
                type="text"
                required
                placeholder="Örn: Dell Latitude 5540 i7 32GB"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2.5 font-medium text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Demirbaş / Varlık Kodu (Barkod) *</label>
              <input
                type="text"
                required
                placeholder="AST-PC-1042"
                value={assetTag}
                onChange={e => setAssetTag(e.target.value)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2.5 font-mono font-bold text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* SERİ NESNE NO & SERİ NO & MARKA & MODEL */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-amber-400 font-semibold mb-1 flex items-center gap-1">
                <Barcode className="h-3.5 w-3.5" />
                <span>Seri Nesne No</span>
              </label>
              <input
                type="text"
                placeholder="NSN-2024-8921"
                value={objectCode}
                onChange={e => setObjectCode(e.target.value)}
                className="w-full bg-[#242424] border border-amber-600/50 rounded-xl p-2 font-mono font-bold text-amber-300 placeholder-gray-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Seri Numarası (S/N)</label>
              <input
                type="text"
                placeholder="PF3J9K81"
                value={serialNumber}
                onChange={e => setSerialNumber(e.target.value)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 font-mono font-medium text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Marka</label>
              <input
                type="text"
                placeholder="Dell, Cisco, Apple vb."
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 font-medium text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Model Kodu</label>
              <input
                type="text"
                placeholder="Latitude 5540"
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 font-medium text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Location Details */}
          <div className="p-3.5 bg-[#1A1A1A] rounded-xl border border-gray-800 space-y-2.5">
            <h4 className="font-bold text-white text-[11px] uppercase tracking-wider">
              Lokasyon & Ağ Yerleşimi
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-gray-400 mb-1">Bulunduğu Şehir</label>
                <select
                  value={cityId}
                  onChange={e => {
                    setCityId(e.target.value);
                    const blds = db.buildings.filter(b => b.cityId === e.target.value);
                    if (blds.length > 0) setBuildingId(blds[0].id);
                  }}
                  className="w-full bg-[#242424] border border-gray-700 rounded-lg p-2 font-medium text-white focus:outline-none focus:border-blue-500"
                >
                  {db.cities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Bina / Tesis</label>
                <select
                  value={buildingId}
                  onChange={e => setBuildingId(e.target.value)}
                  className="w-full bg-[#242424] border border-gray-700 rounded-lg p-2 font-medium text-white focus:outline-none focus:border-blue-500"
                >
                  {db.buildings.filter(b => b.cityId === cityId).map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Bina İçi Konum</label>
                <input
                  type="text"
                  placeholder="Örn: Kat 2 Sistem Odası Kabin 1"
                  value={locationDetail}
                  onChange={e => setLocationDetail(e.target.value)}
                  className="w-full bg-[#242424] border border-gray-700 rounded-lg p-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Is Local LAN vs Remote */}
            <div className="pt-2 flex items-center justify-between border-t border-gray-800">
              <div>
                <span className="font-semibold text-white block">Yerel Ağ (On-Premise LAN) mi?</span>
                <span className="text-[11px] text-gray-400">
                  {isLocal ? 'Bu cihaz ana genel merkez yerel ağındadır.' : 'Bu cihaz uzak saha, şube VPN veya bulut üzerindedir.'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLocal}
                  onChange={e => setIsLocal(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          {/* EXTENSIVE SPECS: PC / HARDWARE */}
          {category === 'user_devices' && (
            <div className="p-3.5 bg-[#1A1A1A] rounded-xl border border-blue-900/40 space-y-2.5">
              <h4 className="font-bold text-blue-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Laptop className="h-4 w-4 text-blue-400" />
                Detaylı Bilgisayar Donanım & Sistem Parametreleri
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-gray-400 mb-0.5">İşlemci (CPU)</label>
                  <input
                    type="text"
                    placeholder="Intel i7-13700H / Apple M3"
                    value={cpu}
                    onChange={e => setCpu(e.target.value)}
                    className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-0.5">RAM Bellek</label>
                  <input
                    type="text"
                    placeholder="32 GB DDR5"
                    value={ram}
                    onChange={e => setRam(e.target.value)}
                    className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-0.5">Depolama (SSD/NVMe)</label>
                  <input
                    type="text"
                    placeholder="1 TB NVMe M.2 SSD"
                    value={storage}
                    onChange={e => setStorage(e.target.value)}
                    className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-0.5">Ekran Kartı (GPU)</label>
                  <input
                    type="text"
                    placeholder="NVIDIA RTX 4060 / Entegre"
                    value={gpu}
                    onChange={e => setGpu(e.target.value)}
                    className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-0.5">Ekran / Panel</label>
                  <input
                    type="text"
                    placeholder='15.6" FHD IPS'
                    value={screenSize}
                    onChange={e => setScreenSize(e.target.value)}
                    className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-0.5">Batarya Sağlığı</label>
                  <input
                    type="text"
                    placeholder="%96 (64 Döngü)"
                    value={batteryHealth}
                    onChange={e => setBatteryHealth(e.target.value)}
                    className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-0.5">İşletim Sistemi</label>
                  <input
                    type="text"
                    placeholder="Win 11 Pro / macOS Sonoma"
                    value={os}
                    onChange={e => setOs(e.target.value)}
                    className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-0.5">MAC Adresi</label>
                  <input
                    type="text"
                    placeholder="00:1A:2B:3C:4D:5E"
                    value={macAddress}
                    onChange={e => setMacAddress(e.target.value)}
                    className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 font-mono text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* EXTENSIVE SPECS: NETWORK & PTP */}
          {category === 'network_devices' && (
            <div className="p-3.5 bg-[#1A1A1A] rounded-xl border border-purple-900/40 space-y-2.5">
              <h4 className="font-bold text-purple-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Network className="h-4 w-4 text-purple-400" />
                Ağ & TCP/IP Altyapı Yapılandırma Parametreleri
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-gray-400 mb-0.5">Statik IP Adresi</label>
                  <input
                    type="text"
                    placeholder="10.10.1.2"
                    value={ipAddress}
                    onChange={e => setIpAddress(e.target.value)}
                    className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 font-mono text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-0.5">MAC Adresi</label>
                  <input
                    type="text"
                    placeholder="00:40:96:B2:3F:8A"
                    value={macAddress}
                    onChange={e => setMacAddress(e.target.value)}
                    className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 font-mono text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-0.5">Subnet Mask</label>
                  <input
                    type="text"
                    placeholder="255.255.255.0"
                    value={subnetMask}
                    onChange={e => setSubnetMask(e.target.value)}
                    className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 font-mono text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-0.5">Ağ Geçidi (Gateway)</label>
                  <input
                    type="text"
                    placeholder="10.10.1.1"
                    value={gateway}
                    onChange={e => setGateway(e.target.value)}
                    className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 font-mono text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-0.5">VLAN Yapılandırması</label>
                  <input
                    type="text"
                    placeholder="VLAN 10 (Data), VLAN 20 (Voice)"
                    value={vlan}
                    onChange={e => setVlan(e.target.value)}
                    className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-0.5">Kabin Boyutu (U)</label>
                  <input
                    type="text"
                    placeholder="1U / 2U"
                    value={rackUnit}
                    onChange={e => setRackUnit(e.target.value)}
                    className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {subCategory === 'Switch' && (
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="block text-gray-400 mb-0.5">Port Adedi</label>
                    <input
                      type="number"
                      placeholder="24, 48"
                      value={ports}
                      onChange={e => setPorts(e.target.value)}
                      className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="poe-check"
                      checked={poeSupported}
                      onChange={e => setPoeSupported(e.target.checked)}
                      className="rounded accent-purple-600"
                    />
                    <label htmlFor="poe-check" className="font-semibold text-gray-300">PoE / PoE+ (Power over Ethernet) Desteği Var</label>
                  </div>
                </div>
              )}

              {/* PtP Specific Fields */}
              {subCategory === 'PtP Yansıtıcı' && (
                <div className="pt-2.5 border-t border-purple-900/40 space-y-2">
                  <span className="font-bold text-purple-400 text-xs flex items-center gap-1">
                    <Radio className="h-3.5 w-3.5" />
                    Noktadan Noktaya (PtP) Radyolink & Sinyal Parametreleri
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-gray-400 mb-0.5">Çalışma Frekansı</label>
                      <input
                        type="text"
                        placeholder="60 GHz / 5 GHz Yedek"
                        value={ptpFrequency}
                        onChange={e => setPtpFrequency(e.target.value)}
                        className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-0.5">Link Mesafesi (km)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="1.8"
                        value={ptpDistanceKm}
                        onChange={e => setPtpDistanceKm(e.target.value)}
                        className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-0.5">Sinyal Gücü (RSSI)</label>
                      <input
                        type="text"
                        placeholder="-58 dBm"
                        value={ptpSignalRssi}
                        onChange={e => setPtpSignalRssi(e.target.value)}
                        className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 font-mono text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-0.5">Hedef Karşı Bina / Tesis</label>
                      <select
                        value={ptpTargetBuildingId}
                        onChange={e => setPtpTargetBuildingId(e.target.value)}
                        className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="">Hedef Seçiniz</option>
                        {db.buildings.filter(b => b.id !== buildingId).map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EXTENSIVE SPECS: TELEPHONY */}
          {category === 'telephony' && (
            <div className="p-3.5 bg-[#1A1A1A] rounded-xl border border-amber-900/40 space-y-2.5">
              <h4 className="font-bold text-amber-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <PhoneCall className="h-4 w-4 text-amber-400" />
                IP Telefon & Santral Parametreleri
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-gray-400 mb-0.5">Dahili Hat Numarası (Ext)</label>
                  <input
                    type="text"
                    placeholder="1042"
                    value={extensionNumber}
                    onChange={e => setExtensionNumber(e.target.value)}
                    className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 font-mono font-bold text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-0.5">Telefon IP Adresi</label>
                  <input
                    type="text"
                    placeholder="10.10.30.120"
                    value={ipAddress}
                    onChange={e => setIpAddress(e.target.value)}
                    className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 font-mono text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-0.5">SIP Santral Sunucusu</label>
                  <input
                    type="text"
                    placeholder="sip.sirket.local"
                    value={sipServer}
                    onChange={e => setSipServer(e.target.value)}
                    className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 font-mono text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-0.5">Ses Codec</label>
                  <input
                    type="text"
                    placeholder="G.711u / G.729"
                    value={codec}
                    onChange={e => setCodec(e.target.value)}
                    className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* EXTENSIVE SPECS: SOFTWARE & LICENSES */}
          {category === 'software_licenses' && (
            <div className="p-3.5 bg-[#1A1A1A] rounded-xl border border-emerald-900/40 space-y-2.5">
              <h4 className="font-bold text-emerald-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="h-4 w-4 text-emerald-400" />
                Lisans Anahtarı, Sürüm & Kapasite Bilgileri
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-gray-400 mb-0.5">Lisans Anahtarı / Seri No</label>
                  <input
                    type="text"
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    value={licenseKey}
                    onChange={e => setLicenseKey(e.target.value)}
                    className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 font-mono text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-0.5">Sürüm / Versiyon</label>
                  <input
                    type="text"
                    placeholder="v2024.2 Enterprise"
                    value={version}
                    onChange={e => setVersion(e.target.value)}
                    className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-0.5">Kullanıcı Kapasitesi</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={userLimit}
                    onChange={e => setUserLimit(e.target.value)}
                    className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-0.5">Son Kullanma Tarihi</label>
                  <input
                    type="date"
                    value={expireDate}
                    onChange={e => setExpireDate(e.target.value)}
                    className="w-full bg-[#242424] border border-gray-700 rounded-lg p-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Status & Purchase Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Depo / Kullanım Durumu</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as AssetStatus)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 font-medium text-white focus:outline-none focus:border-blue-500"
              >
                <option value="in_stock">Depoda (Zimmete Hazır)</option>
                <option value="in_use">Kullanımda / Zimmetli</option>
                <option value="maintenance">Bakımda / Arızalı</option>
                <option value="scrapped">Hurda / Hizmet Dışı</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Satın Alma Tarihi</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={e => setPurchaseDate(e.target.value)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Garanti Bitiş Tarihi</label>
              <input
                type="date"
                value={warrantyEndDate}
                onChange={e => setWarrantyEndDate(e.target.value)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Ek Notlar & Açıklamalar</label>
            <textarea
              rows={2}
              placeholder="Örn: Port 24 arızalı, cihaz test ortamında kullanılacak..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-gray-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#242424] hover:bg-[#2e2e2e] text-gray-300 border border-gray-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{assetToEdit ? 'Değişiklikleri Kaydet' : 'Cihazı Envantere Ekle'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

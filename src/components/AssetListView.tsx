import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Laptop, 
  Network, 
  PhoneCall, 
  Radio, 
  Server, 
  KeyRound, 
  MapPin, 
  Building2, 
  User, 
  ArrowLeftRight, 
  FileText, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  SlidersHorizontal,
  Barcode,
  Image as ImageIcon,
  FileCheck
} from 'lucide-react';
import { Asset, InventoryDatabase, AssetCategory, AssetStatus } from '../types/inventory';

interface AssetListViewProps {
  db: InventoryDatabase;
  onOpenNewAsset: () => void;
  onEditAsset: (asset: Asset) => void;
  onDeleteAsset: (assetId: string) => void;
  onCheckout?: (asset: Asset) => void;
  onCheckoutAsset?: (asset: Asset) => void;
  onCheckin?: (asset: Asset) => void;
  onCheckinAsset?: (asset: Asset) => void;
  onViewReceipt: (asset: Asset) => void;
  onViewDetails: (asset: Asset) => void;
  onOpenDocumentModal?: (asset: Asset) => void;
}

export const AssetListView: React.FC<AssetListViewProps> = ({
  db,
  onOpenNewAsset,
  onEditAsset,
  onDeleteAsset,
  onCheckout,
  onCheckoutAsset,
  onCheckin,
  onCheckinAsset,
  onViewReceipt,
  onViewDetails,
  onOpenDocumentModal,
}) => {
  const triggerCheckout = onCheckout || onCheckoutAsset || (() => {});
  const triggerCheckin = onCheckin || onCheckinAsset || (() => {});

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLocal, setSelectedLocal] = useState<string>('all');

  const filteredAssets = useMemo(() => {
    return db.assets.filter(asset => {
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const assignedPerson = db.people.find(p => p.id === asset.assignedToPersonId);
        const matchTag = asset.assetTag.toLowerCase().includes(term);
        const matchObjectCode = asset.objectCode ? asset.objectCode.toLowerCase().includes(term) : false;
        const matchSerial = asset.serialNumber.toLowerCase().includes(term);
        const matchName = asset.name.toLowerCase().includes(term);
        const matchBrand = asset.brand.toLowerCase().includes(term);
        const matchModel = asset.model.toLowerCase().includes(term);
        const matchIp = asset.specs?.ipAddress?.toLowerCase().includes(term);
        const matchMac = asset.specs?.macAddress?.toLowerCase().includes(term);
        const matchPerson = assignedPerson?.fullName.toLowerCase().includes(term);
        const matchLoc = asset.locationDetail.toLowerCase().includes(term);

        if (!matchTag && !matchObjectCode && !matchSerial && !matchName && !matchBrand && !matchModel && !matchIp && !matchMac && !matchPerson && !matchLoc) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'all' && asset.category !== selectedCategory) {
        return false;
      }

      // SubCategory
      if (selectedSubCategory !== 'all' && asset.subCategory !== selectedSubCategory) {
        return false;
      }

      // City
      if (selectedCity !== 'all' && asset.cityId !== selectedCity) {
        return false;
      }

      // Building
      if (selectedBuilding !== 'all' && asset.buildingId !== selectedBuilding) {
        return false;
      }

      // Status
      if (selectedStatus !== 'all' && asset.status !== selectedStatus) {
        return false;
      }

      // Local / Remote
      if (selectedLocal === 'local' && !asset.isLocal) return false;
      if (selectedLocal === 'remote' && asset.isLocal) return false;

      return true;
    });
  }, [db.assets, db.people, searchTerm, selectedCategory, selectedSubCategory, selectedCity, selectedBuilding, selectedStatus, selectedLocal]);

  // Unique subcategories for current category
  const availableSubCategories = useMemo(() => {
    let pool = db.assets;
    if (selectedCategory !== 'all') {
      pool = pool.filter(a => a.category === selectedCategory);
    }
    return Array.from(new Set(pool.map(a => a.subCategory))).sort();
  }, [db.assets, selectedCategory]);

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case 'in_use':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Zimmetli
          </span>
        );
      case 'in_stock':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-950/60 text-blue-400 border border-blue-800/40">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
            Depoda (Hazır)
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-950/60 text-amber-400 border border-amber-800/40">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
            Bakımda / Arızalı
          </span>
        );
      case 'scrapped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-950/60 text-rose-400 border border-rose-800/40">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
            Hurda
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#242424] text-gray-400">
            {status}
          </span>
        );
    }
  };

  const getCategoryIcon = (category: AssetCategory) => {
    switch (category) {
      case 'user_devices':
        return <Laptop className="h-4 w-4 text-blue-400" />;
      case 'network_devices':
        return <Network className="h-4 w-4 text-purple-400" />;
      case 'telephony':
        return <PhoneCall className="h-4 w-4 text-emerald-400" />;
      case 'software_licenses':
        return <KeyRound className="h-4 w-4 text-amber-400" />;
      case 'infrastructure':
        return <Server className="h-4 w-4 text-gray-400" />;
      default:
        return <Laptop className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#161616] p-5 rounded-2xl border border-gray-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Laptop className="h-5 w-5 text-blue-500" />
            Cihaz Envanteri ve Depo Yönetimi
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Tüm kullanıcı bilgisayarları, ağ switchleri, Wi-Fi AP'ler, PtP yansıtıcılar ve IP telefonlar
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-inventory-new-asset"
            onClick={onOpenNewAsset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Yeni Cihaz / Donanım Ekle</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#161616] p-4 rounded-2xl border border-gray-800 shadow-sm space-y-3">
        {/* Search input */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              id="asset-search-input"
              type="text"
              placeholder="Seri no, barkod no, IP (10.10.x.x), MAC, model veya personel adı..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#242424] border border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 transition-all"
            />
          </div>

          {/* Quick Clear */}
          {(searchTerm || selectedCategory !== 'all' || selectedCity !== 'all' || selectedStatus !== 'all' || selectedLocal !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedSubCategory('all');
                setSelectedCity('all');
                setSelectedBuilding('all');
                setSelectedStatus('all');
                setSelectedLocal('all');
              }}
              className="px-3 py-2 text-xs font-semibold text-rose-400 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 rounded-xl transition-colors cursor-pointer"
            >
              Filtreleri Sıfırla
            </button>
          )}
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {/* Category */}
          <div>
            <label className="block text-gray-400 mb-1 font-medium text-[11px]">Kategori</label>
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setSelectedSubCategory('all');
              }}
              className="w-full bg-[#242424] border border-gray-700 rounded-lg p-2 font-medium text-gray-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Tüm Kategoriler</option>
              <option value="user_devices">💻 Son Kullanıcı</option>
              <option value="network_devices">🌐 Ağ & Network</option>
              <option value="telephony">📞 IP Telefon & Ses</option>
              <option value="software_licenses">🔑 Özel Yazılım / Lisans</option>
              <option value="infrastructure">🗄️ Altyapı & Kabin</option>
            </select>
          </div>

          {/* Sub Category */}
          <div>
            <label className="block text-gray-400 mb-1 font-medium text-[11px]">Alt Tür</label>
            <select
              value={selectedSubCategory}
              onChange={e => setSelectedSubCategory(e.target.value)}
              className="w-full bg-[#242424] border border-gray-700 rounded-lg p-2 font-medium text-gray-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Tüm Türler</option>
              {availableSubCategories.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-gray-400 mb-1 font-medium text-[11px]">Şehir</label>
            <select
              value={selectedCity}
              onChange={e => {
                setSelectedCity(e.target.value);
                setSelectedBuilding('all');
              }}
              className="w-full bg-[#242424] border border-gray-700 rounded-lg p-2 font-medium text-gray-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Tüm Şehirler</option>
              {db.cities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Building */}
          <div>
            <label className="block text-gray-400 mb-1 font-medium text-[11px]">Bina / Tesis</label>
            <select
              value={selectedBuilding}
              onChange={e => setSelectedBuilding(e.target.value)}
              className="w-full bg-[#242424] border border-gray-700 rounded-lg p-2 font-medium text-gray-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Tüm Binalar</option>
              {db.buildings
                .filter(b => selectedCity === 'all' || b.cityId === selectedCity)
                .map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-gray-400 mb-1 font-medium text-[11px]">Depo / Durum</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full bg-[#242424] border border-gray-700 rounded-lg p-2 font-medium text-gray-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="in_use">Zimmetli (Kullanımda)</option>
              <option value="in_stock">Depoda (Kullanıma Hazır)</option>
              <option value="maintenance">Bakımda / Arızalı</option>
              <option value="scrapped">Hurda / Düşüm</option>
            </select>
          </div>

          {/* Local vs Remote */}
          <div>
            <label className="block text-gray-400 mb-1 font-medium text-[11px]">Ağ Türü</label>
            <select
              value={selectedLocal}
              onChange={e => setSelectedLocal(e.target.value)}
              className="w-full bg-[#242424] border border-gray-700 rounded-lg p-2 font-medium text-gray-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">Tümü (Yerel + Uzak)</option>
              <option value="local">Sadece Yerel Ağ (LAN)</option>
              <option value="remote">Uzak Saha / VPN / PtP</option>
            </select>
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-800">
          <span>Toplam <strong className="text-white">{filteredAssets.length}</strong> cihaz listeleniyor (Kayıtlı: {db.assets.length})</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              Kullanımda: {filteredAssets.filter(a => a.status === 'in_use').length}
            </span>
            <span className="flex items-center gap-1.5 text-blue-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-blue-400"></span>
              Depoda Hazır: {filteredAssets.filter(a => a.status === 'in_stock').length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Asset Table */}
      <div className="bg-[#161616] rounded-2xl border border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#1A1A1A] text-gray-400 font-semibold border-b border-gray-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Demirbaş No & Tür</th>
                <th className="py-3 px-4">Donanım Modeli / Marka</th>
                <th className="py-3 px-4">Lokasyon & Yerel Durum</th>
                <th className="py-3 px-4">Ağ / IP / MAC / Detay</th>
                <th className="py-3 px-4">Zimmet Sahibi</th>
                <th className="py-3 px-4">Durum</th>
                <th className="py-3 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredAssets.map(asset => {
                const assignedPerson = db.people.find(p => p.id === asset.assignedToPersonId);
                const city = db.cities.find(c => c.id === asset.cityId);
                const building = db.buildings.find(b => b.id === asset.buildingId);

                return (
                  <tr key={asset.id} className="hover:bg-[#1A1A1A] transition-colors">
                    {/* Tag & SubCategory */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-[#242424] border border-gray-700/60 flex items-center justify-center">
                          {getCategoryIcon(asset.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-white block">{asset.assetTag}</span>
                            {asset.images && asset.images.length > 0 && (
                              <span className="text-[9px] bg-blue-950/80 text-blue-400 border border-blue-800/40 px-1 py-0.2 rounded font-sans flex items-center gap-0.5" title={`${asset.images.length} fotoğraf yüklü`}>
                                <ImageIcon className="h-2.5 w-2.5" />
                                <span>{asset.images.length}</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-gray-400 font-medium">{asset.subCategory}</span>
                            {asset.objectCode && (
                              <span className="text-[9px] font-mono bg-amber-950/60 text-amber-400 border border-amber-800/40 px-1 rounded flex items-center gap-0.5">
                                <Barcode className="h-2.5 w-2.5" />
                                <span>{asset.objectCode}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Name & Brand */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white max-w-[220px] truncate" title={asset.name}>
                        {asset.name}
                      </div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-medium text-gray-300">{asset.brand}</span>
                        <span>•</span>
                        <span className="font-mono text-gray-400">{asset.serialNumber}</span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-200 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-500" />
                        <span>{city?.name || '-'}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 truncate max-w-[190px]" title={`${building?.name} - ${asset.locationDetail}`}>
                        {building?.name} ({asset.locationDetail})
                      </div>
                      <div className="mt-1">
                        {asset.isLocal ? (
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.2 rounded font-medium">
                            Yerel Ağ (LAN)
                          </span>
                        ) : (
                          <span className="text-[10px] text-purple-400 bg-purple-950/60 border border-purple-800/40 px-1.5 py-0.2 rounded font-medium">
                            Uzak Saha / VPN / PtP
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Specs / IP / MAC / PtP details */}
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {asset.specs?.ipAddress && (
                        <div className="text-gray-200 font-semibold flex items-center gap-1">
                          <span className="text-[9px] bg-blue-950 text-blue-300 border border-blue-800/50 px-1 rounded">IP</span>
                          <span>{asset.specs.ipAddress}</span>
                        </div>
                      )}
                      {asset.specs?.macAddress && (
                        <div className="text-gray-400 text-[10px]">
                          MAC: {asset.specs.macAddress}
                        </div>
                      )}
                      {asset.subCategory === 'PtP Yansıtıcı' && asset.specs?.ptpFrequency && (
                        <div className="text-purple-400 text-[10px] font-sans font-medium flex items-center gap-1">
                          <Radio className="h-3 w-3" />
                          <span>{asset.specs.ptpFrequency} ({asset.specs.ptpDistanceKm || 1} km)</span>
                        </div>
                      )}
                      {asset.specs?.extensionNumber && (
                        <div className="text-emerald-400 text-[11px] font-sans font-semibold">
                          Dahili: {asset.specs.extensionNumber}
                        </div>
                      )}
                      {asset.specs?.cpu && (
                        <div className="text-gray-400 text-[10px] font-sans">
                          {asset.specs.cpu} • {asset.specs.ram}
                        </div>
                      )}
                      {!asset.specs?.ipAddress && !asset.specs?.macAddress && !asset.specs?.cpu && !asset.specs?.extensionNumber && (
                        <span className="text-gray-500 font-sans italic text-[11px]">-</span>
                      )}
                    </td>

                    {/* Assigned Person */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {assignedPerson ? (
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1">
                            <User className="h-3 w-3 text-emerald-400" />
                            <span>{assignedPerson.fullName}</span>
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {assignedPerson.title} ({assignedPerson.employeeId})
                          </div>
                          {asset.assignedDate && (
                            <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                              Zimmet: {asset.assignedDate}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic text-[11px]">Zimmetli Değil (Depoda)</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(asset.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick View Details */}
                        <button
                          title="Detay Görüntüle"
                          onClick={() => onViewDetails(asset)}
                          className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-[#242424] rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* If in stock, allow checkout */}
                        {asset.status === 'in_stock' && (
                          <button
                            title="Personele Zimmetle"
                            onClick={() => triggerCheckout(asset)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 font-semibold rounded-lg border border-emerald-800/40 transition-colors text-[11px] cursor-pointer"
                          >
                            <ArrowLeftRight className="h-3 w-3" />
                            <span>Zimmetle</span>
                          </button>
                        )}

                        {/* If in use, allow checkin */}
                        {asset.status === 'in_use' && (
                          <button
                            title="Zimmet İadesi Al (Depoya)"
                            onClick={() => triggerCheckin(asset)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900/60 text-amber-400 font-semibold rounded-lg border border-amber-800/40 transition-colors text-[11px] cursor-pointer"
                          >
                            <ArrowLeftRight className="h-3 w-3" />
                            <span>İade Al</span>
                          </button>
                        )}

                        {/* If assigned or has document, allow viewing signed document */}
                        <button
                          title={asset.signedDocumentUrl ? "Islak İmzalı Evrakı Görüntüle" : "İmzalı Evrak Yükle"}
                          onClick={() => {
                            if (onOpenDocumentModal) onOpenDocumentModal(asset);
                            else onViewReceipt(asset);
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            asset.signedDocumentUrl 
                              ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/60' 
                              : 'text-gray-500 hover:text-gray-300 hover:bg-[#242424]'
                          }`}
                        >
                          <FileCheck className="h-4 w-4" />
                        </button>

                        {/* If assigned, allow viewing official receipt */}
                        {asset.assignedToPersonId && (
                          <button
                            title="Zimmet Tutanağını Gör & Yazdır"
                            onClick={() => onViewReceipt(asset)}
                            className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-[#242424] rounded-lg transition-colors cursor-pointer"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        )}

                        {/* Edit button */}
                        <button
                          title="Cihazı Düzenle"
                          onClick={() => onEditAsset(asset)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#242424] rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        {/* Delete button */}
                        <button
                          title="Cihazı Sil"
                          onClick={() => {
                            if (window.confirm(`"${asset.name}" (${asset.assetTag}) cihazını silmek istediğinize emin misiniz?`)) {
                              onDeleteAsset(asset.id);
                            }
                          }}
                          className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredAssets.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                    <p className="font-semibold text-gray-300">Kriterlere uygun cihaz veya donanım bulunamadı.</p>
                    <p className="text-xs mt-1 text-gray-500">Arama kelimesini değiştirebilir veya filtreleri sıfırlayabilirsiniz.</p>
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

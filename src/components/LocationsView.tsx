import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Server, 
  Network, 
  Users, 
  Laptop, 
  Plus, 
  Layers, 
  Radio, 
  CheckCircle, 
  Globe2, 
  Eye, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { InventoryDatabase, Building, City, Asset } from '../types/inventory';

interface LocationsViewProps {
  db: InventoryDatabase;
  onViewDetails: (asset: Asset) => void;
  onOpenNewBuilding: () => void;
}

export const LocationsView: React.FC<LocationsViewProps> = ({
  db,
  onViewDetails,
  onOpenNewBuilding,
}) => {
  const [selectedCityId, setSelectedCityId] = useState<string>('all');
  const [activeBuildingId, setActiveBuildingId] = useState<string | null>(db.buildings[0]?.id || null);

  const selectedBuilding = db.buildings.find(b => b.id === activeBuildingId);
  const buildingAssets = selectedBuilding ? db.assets.filter(a => a.buildingId === selectedBuilding.id) : [];
  const buildingPeople = selectedBuilding ? db.people.filter(p => p.buildingId === selectedBuilding.id) : [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#161616] p-5 rounded-2xl border border-gray-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-500" />
            Şirket Lokasyonları, Binalar ve Tesisler
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Hangi şehirde kaç kullanıcı var, hangi binada hangi cihazlar bulunuyor ve yerel LAN / uzak saha durumu
          </p>
        </div>

        <button
          id="btn-add-building"
          onClick={onOpenNewBuilding}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Yeni Bina / Lokasyon Ekle</span>
        </button>
      </div>

      {/* City Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {db.cities.map(city => {
          const cityPeople = db.people.filter(p => p.cityId === city.id);
          const cityAssets = db.assets.filter(a => a.cityId === city.id);
          const cityBuildings = db.buildings.filter(b => b.cityId === city.id);
          const localCount = cityAssets.filter(a => a.isLocal).length;
          const remoteCount = cityAssets.filter(a => !a.isLocal).length;

          return (
            <div
              key={city.id}
              onClick={() => setSelectedCityId(city.id === selectedCityId ? 'all' : city.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                selectedCityId === city.id
                  ? 'bg-[#1A1A1A] border-blue-500 ring-1 ring-blue-500 shadow-sm'
                  : 'bg-[#161616] border-gray-800 hover:border-gray-700 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{city.name}</h3>
                    {city.isHeadquarter && (
                      <span className="text-[10px] font-bold bg-blue-950/80 text-blue-300 border border-blue-800/60 px-1.5 py-0.5 rounded">
                        Genel Merkez
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{city.region} Bölgesi</span>
                </div>
                <span className="font-mono font-bold text-xs bg-[#242424] px-2 py-1 rounded text-gray-300 border border-gray-700">
                  {city.code}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#242424] p-2.5 rounded-xl border border-gray-700/50">
                  <span className="text-gray-400 block text-[10px]">Kullanıcı Sayısı</span>
                  <span className="text-lg font-bold text-blue-400">{cityPeople.length} Kişi</span>
                </div>
                <div className="bg-[#242424] p-2.5 rounded-xl border border-gray-700/50">
                  <span className="text-gray-400 block text-[10px]">Cihaz Sayısı</span>
                  <span className="text-lg font-bold text-white">{cityAssets.length} Cihaz</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
                <span>{cityBuildings.length} Bina / Tesis</span>
                <span>{localCount} Yerel • {remoteCount} Uzak</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Split: Left is Buildings list, Right is Selected Building Detailed Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Building List Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-gray-400" />
              Binalar & Tesisler ({db.buildings.filter(b => selectedCityId === 'all' || b.cityId === selectedCityId).length})
            </h3>
            {selectedCityId !== 'all' && (
              <button
                onClick={() => setSelectedCityId('all')}
                className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer font-medium"
              >
                Tümünü Göster
              </button>
            )}
          </div>

          <div className="space-y-2">
            {db.buildings
              .filter(b => selectedCityId === 'all' || b.cityId === selectedCityId)
              .map(building => {
                const city = db.cities.find(c => c.id === building.cityId);
                const bldAssets = db.assets.filter(a => a.buildingId === building.id);
                const bldPeople = db.people.filter(p => p.buildingId === building.id);
                const isSelected = activeBuildingId === building.id;

                return (
                  <div
                    key={building.id}
                    onClick={() => setActiveBuildingId(building.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-950/40 text-white border-blue-500/80 shadow-sm ring-1 ring-blue-500/50'
                        : 'bg-[#161616] border-gray-800 hover:border-gray-700 text-gray-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm leading-tight text-white">{building.name}</h4>
                        <span className={`text-xs block mt-0.5 ${isSelected ? 'text-blue-300' : 'text-gray-400'}`}>
                          {city?.name} • {building.campusName}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          building.isLocalNetwork
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                            : 'bg-purple-950/60 text-purple-400 border border-purple-800/40'
                        }`}
                      >
                        {building.isLocalNetwork ? 'Yerel LAN' : 'Uzak Saha'}
                      </span>
                    </div>

                    <div className={`mt-3 pt-2 border-t flex items-center justify-between text-xs ${
                      isSelected ? 'border-blue-800/40 text-blue-300' : 'border-gray-800 text-gray-400'
                    }`}>
                      <span>{bldPeople.length} Kullanıcı</span>
                      <span>{bldAssets.length} Cihaz</span>
                      <span>{building.rackCount} Rack</span>
                      <ChevronRight className="h-4 w-4 opacity-70" />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right: Selected Building Detailed Specs & Asset Roster */}
        {selectedBuilding ? (
          <div className="lg:col-span-2 space-y-4">
            {/* Building Banner */}
            <div className="bg-[#161616] rounded-2xl p-6 border border-gray-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{selectedBuilding.name}</h3>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        selectedBuilding.isLocalNetwork
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                          : 'bg-purple-950/60 text-purple-400 border border-purple-800/40'
                      }`}
                    >
                      {selectedBuilding.isLocalNetwork ? 'Yerel Merkez Ağında (LAN)' : 'Uzak Saha / VPN Bağlantılı'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-gray-500" />
                    {selectedBuilding.address}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <div className="bg-[#242424] px-3 py-1.5 rounded-lg border border-gray-700 text-center">
                    <span className="text-gray-400 block text-[10px]">Aktif Kullanıcı</span>
                    <strong className="text-blue-400 text-sm">{buildingPeople.length} Kişi</strong>
                  </div>
                  <div className="bg-[#242424] px-3 py-1.5 rounded-lg border border-gray-700 text-center">
                    <span className="text-gray-400 block text-[10px]">Toplam Cihaz</span>
                    <strong className="text-white text-sm">{buildingAssets.length} Cihaz</strong>
                  </div>
                </div>
              </div>

              {/* Technical infrastructure info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-800 text-xs">
                <div className="bg-[#242424] p-2.5 rounded-xl border border-gray-700/50">
                  <span className="text-gray-400 block text-[10px]">Sistem Odası</span>
                  <strong className="text-white">
                    {selectedBuilding.hasServerRoom ? 'Mevcut (Klimalı)' : 'Kat Kabini'}
                  </strong>
                </div>
                <div className="bg-[#242424] p-2.5 rounded-xl border border-gray-700/50">
                  <span className="text-gray-400 block text-[10px]">Rack Kabinet Sayısı</span>
                  <strong className="text-white">{selectedBuilding.rackCount} Kabin</strong>
                </div>
                <div className="bg-[#242424] p-2.5 rounded-xl border border-gray-700/50">
                  <span className="text-gray-400 block text-[10px]">Kat Sayısı</span>
                  <strong className="text-white">{selectedBuilding.floors.length} Kat/Seviye</strong>
                </div>
                <div className="bg-[#242424] p-2.5 rounded-xl border border-gray-700/50">
                  <span className="text-gray-400 block text-[10px]">Ağ Bağlantı Türü</span>
                  <strong className="text-white">
                    {selectedBuilding.isLocalNetwork ? '10GbE Fiber / PtP' : 'IPSec VPN / LTE'}
                  </strong>
                </div>
              </div>

              {selectedBuilding.notes && (
                <p className="text-xs text-gray-300 bg-[#242424] p-2.5 rounded-lg border border-gray-700">
                  <strong className="text-gray-200">Not:</strong> {selectedBuilding.notes}
                </p>
              )}
            </div>

            {/* Assets Physically Located in this Building */}
            <div className="bg-[#161616] rounded-2xl p-6 border border-gray-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Server className="h-4 w-4 text-gray-400" />
                  Bu Binada Bulunan Tüm Cihazlar & Donanımlar ({buildingAssets.length})
                </h4>
                <span className="text-xs text-gray-400">
                  {buildingAssets.filter(a => a.status === 'in_use').length} Zimmetli • {buildingAssets.filter(a => a.status === 'in_stock').length} Depoda
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#1A1A1A] text-gray-400 font-semibold border-b border-gray-800 text-[11px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Demirbaş No</th>
                      <th className="py-2.5 px-3">Cihaz Tanımı</th>
                      <th className="py-2.5 px-3">Kategori</th>
                      <th className="py-2.5 px-3">Bina İçi Konum</th>
                      <th className="py-2.5 px-3">Zimmet Sahibi</th>
                      <th className="py-2.5 px-3 text-right">İncele</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {buildingAssets.map(asset => {
                      const person = db.people.find(p => p.id === asset.assignedToPersonId);
                      return (
                        <tr key={asset.id} className="hover:bg-[#1A1A1A] transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-white">
                            {asset.assetTag}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-white">
                            {asset.name}
                            <span className="block text-[10px] text-gray-400 font-normal font-mono">{asset.serialNumber}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#242424] text-gray-300 border border-gray-700">
                              {asset.subCategory}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-gray-300">
                            {asset.locationDetail}
                          </td>
                          <td className="py-2.5 px-3">
                            {person ? (
                              <span className="font-medium text-emerald-400">{person.fullName}</span>
                            ) : (
                              <span className="text-gray-500 italic">Depoda (Serbest)</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => onViewDetails(asset)}
                              className="text-blue-400 hover:text-blue-300 font-semibold text-xs cursor-pointer"
                            >
                              Detay &rarr;
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {buildingAssets.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-gray-500">
                          Bu binada henüz kayıtlı donanım bulunmamaktadır.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-[#161616] rounded-2xl p-12 border border-gray-800 text-center text-gray-400">
            Detaylarını görmek için sol listeden bir bina seçiniz.
          </div>
        )}
      </div>
    </div>
  );
};

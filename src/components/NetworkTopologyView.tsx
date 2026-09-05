import React, { useState } from 'react';
import { 
  Network, 
  Radio, 
  Wifi, 
  PhoneCall, 
  ShieldCheck, 
  Building2, 
  Server, 
  ArrowRightLeft, 
  Layers, 
  Zap, 
  ExternalLink,
  Plus,
  Edit
} from 'lucide-react';
import { InventoryDatabase, Asset } from '../types/inventory';

interface NetworkTopologyViewProps {
  db: InventoryDatabase;
  onOpenNewAsset: () => void;
  onViewDetails: (asset: Asset) => void;
  onEditAsset?: (asset: Asset) => void;
}

export const NetworkTopologyView: React.FC<NetworkTopologyViewProps> = ({
  db,
  onOpenNewAsset,
  onViewDetails,
  onEditAsset,
}) => {
  const [selectedSubTab, setSelectedSubTab] = useState<'all' | 'ptp' | 'ap' | 'switch' | 'telephony'>('all');

  const networkAssets = db.assets.filter(a => a.category === 'network_devices' || a.category === 'telephony');
  const ptpDevices = networkAssets.filter(a => a.subCategory === 'PtP Yansıtıcı');
  const apDevices = networkAssets.filter(a => a.subCategory === 'Access Point');
  const switchDevices = networkAssets.filter(a => a.subCategory === 'Switch');
  const firewalls = networkAssets.filter(a => a.subCategory === 'Router & Firewall');
  const telephonyDevices = db.assets.filter(a => a.category === 'telephony');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#161616] p-5 rounded-2xl border border-gray-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-950/60 text-purple-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-purple-800/40">
              Altyapı & Ağ Topolojisi
            </span>
            <span className="text-xs text-gray-500">
              {networkAssets.length} Aktif Donanım
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Network className="h-5 w-5 text-purple-400" />
            Ağ Ürünleri, Noktadan Noktaya (PtP) Yansıtıcılar & IP Santral
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Binalar arası kablosuz mikrodalga radyolinkler, kat dağıtım switchleri, Wi-Fi 6 access pointler ve IP telefonlar
          </p>
        </div>

        <button
          id="btn-network-new-asset"
          onClick={onOpenNewAsset}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Ağ Cihazı / Anten Ekle</span>
        </button>
      </div>

      {/* Sub Category Quick Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedSubTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            selectedSubTab === 'all'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
              : 'bg-[#161616] text-gray-400 hover:text-white hover:bg-[#242424] border border-gray-800'
          }`}
        >
          Tüm Ağ Donanımları ({networkAssets.length})
        </button>
        <button
          onClick={() => setSelectedSubTab('ptp')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            selectedSubTab === 'ptp'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
              : 'bg-[#161616] text-gray-400 hover:text-white hover:bg-[#242424] border border-gray-800'
          }`}
        >
          <Radio className="h-3.5 w-3.5 text-purple-400" />
          <span>PtP Yansıtıcılar & Radyolink ({ptpDevices.length})</span>
        </button>
        <button
          onClick={() => setSelectedSubTab('switch')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            selectedSubTab === 'switch'
              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
              : 'bg-[#161616] text-gray-400 hover:text-white hover:bg-[#242424] border border-gray-800'
          }`}
        >
          <Server className="h-3.5 w-3.5 text-blue-400" />
          <span>Switch & Omurga ({switchDevices.length})</span>
        </button>
        <button
          onClick={() => setSelectedSubTab('ap')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            selectedSubTab === 'ap'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-[#161616] text-gray-400 hover:text-white hover:bg-[#242424] border border-gray-800'
          }`}
        >
          <Wifi className="h-3.5 w-3.5 text-emerald-400" />
          <span>Access Point'ler ({apDevices.length})</span>
        </button>
        <button
          onClick={() => setSelectedSubTab('telephony')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            selectedSubTab === 'telephony'
              ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40'
              : 'bg-[#161616] text-gray-400 hover:text-white hover:bg-[#242424] border border-gray-800'
          }`}
        >
          <PhoneCall className="h-3.5 w-3.5 text-amber-400" />
          <span>IP Telefonlar & Santral ({telephonyDevices.length})</span>
        </button>
      </div>

      {/* SECTION 1: POINT-TO-POINT (PtP) WIRELESS BRIDGES */}
      {(selectedSubTab === 'all' || selectedSubTab === 'ptp') && (
        <div className="bg-[#161616] rounded-2xl p-6 border border-gray-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="h-5 w-5 text-purple-400" />
                Noktadan Noktaya (PtP) Kablosuz Yansıtıcılar & Radyolink Köprüleri
              </h3>
              <p className="text-xs text-gray-400">
                Kablolamanın mümkün olmadığı binalar ve kuleler arasında yüksek hızlı mikrodalga/milimetrik dalga bağlantısı
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-purple-950/60 text-purple-400 rounded-lg border border-purple-800/40">
              {ptpDevices.length} Aktif Anten / Köprü
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ptpDevices.map(ptp => {
              const ownBuilding = db.buildings.find(b => b.id === ptp.buildingId);
              const targetBuilding = db.buildings.find(b => b.id === ptp.specs?.ptpTargetBuildingId);
              const ownCity = db.cities.find(c => c.id === ptp.cityId);

              return (
                <div
                  key={ptp.id}
                  className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-5 shadow-sm hover:border-purple-500/40 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <h4 className="font-bold text-white text-sm">{ptp.name}</h4>
                      </div>
                      <span className="text-[11px] text-purple-400 font-mono font-medium block mt-0.5">
                        {ptp.brand} {ptp.model} • {ptp.assetTag}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {onEditAsset && (
                        <button
                          onClick={() => onEditAsset(ptp)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#242424] rounded-lg transition-colors cursor-pointer"
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onViewDetails(ptp)}
                        className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-[#242424] rounded-lg transition-colors cursor-pointer"
                        title="Detay Görüntüle"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Visual Connection Diagram */}
                  <div className="mt-4 p-3.5 bg-[#242424] rounded-xl border border-gray-700/60 flex items-center justify-between text-xs">
                    <div className="text-left max-w-[40%]">
                      <span className="text-[10px] text-gray-400 font-medium block">Kaynak Nokta</span>
                      <strong className="text-white text-xs block truncate" title={ownBuilding?.name}>
                        {ownBuilding?.name || 'Bina A'}
                      </strong>
                      <span className="text-[10px] text-gray-400 truncate block mt-0.5">
                        {ptp.locationDetail}
                      </span>
                    </div>

                    <div className="flex flex-col items-center px-2">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-purple-300 bg-purple-950/80 border border-purple-800/60 px-2 py-0.5 rounded-full whitespace-nowrap">
                        <Radio className="h-3 w-3" />
                        <span>{ptp.specs?.ptpFrequency || '60 GHz'}</span>
                      </div>
                      <div className="w-16 sm:w-20 border-t-2 border-dashed border-purple-500/50 my-1.5"></div>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {ptp.specs?.ptpDistanceKm ? `${ptp.specs.ptpDistanceKm} km` : 'PtP Link'}
                      </span>
                    </div>

                    <div className="text-right max-w-[40%]">
                      <span className="text-[10px] text-gray-400 font-medium block">Hedef Karşı Nokta</span>
                      <strong className="text-white text-xs block truncate" title={targetBuilding?.name}>
                        {targetBuilding ? targetBuilding.name : 'Karşı Anten Kulesi'}
                      </strong>
                      <span className="text-[10px] text-gray-400 truncate block mt-0.5">
                        {ptp.specs?.ptpAzimuth || 'Uzak Alıcı'}
                      </span>
                    </div>
                  </div>

                  {/* Technical Specs Footer */}
                  <div className="mt-3 pt-2 border-t border-gray-800 grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="bg-[#242424] p-2 rounded-lg border border-gray-700/50">
                      <span className="text-gray-400 block text-[10px]">Yönetim IP</span>
                      <span className="font-mono font-semibold text-white">
                        {ptp.specs?.ipAddress || 'DHCP'}
                      </span>
                    </div>
                    <div className="bg-[#242424] p-2 rounded-lg border border-gray-700/50">
                      <span className="text-gray-400 block text-[10px]">MAC Adresi</span>
                      <span className="font-mono font-semibold text-white truncate block">
                        {ptp.specs?.macAddress || '-'}
                      </span>
                    </div>
                    <div className="bg-[#242424] p-2 rounded-lg border border-gray-700/50">
                      <span className="text-gray-400 block text-[10px]">Şehir</span>
                      <span className="font-semibold text-white">
                        {ownCity?.name}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: ACCESS POINTS (Wi-Fi 6) */}
      {(selectedSubTab === 'all' || selectedSubTab === 'ap') && (
        <div className="bg-[#161616] rounded-2xl p-6 border border-gray-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wifi className="h-5 w-5 text-emerald-400" />
                Access Point'ler (Wi-Fi 6 Kurumsal Kablosuz Ağ)
              </h3>
              <p className="text-xs text-gray-400">
                Ofisler, depolar ve toplantı odalarındaki kablosuz kapsama noktaları, SSID yayınları ve PoE bağlantıları
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-950/60 text-emerald-400 rounded-lg border border-emerald-800/40">
              {apDevices.length} Kayıtlı AP
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {apDevices.map(ap => {
              const building = db.buildings.find(b => b.id === ap.buildingId);
              const city = db.cities.find(c => c.id === ap.cityId);

              return (
                <div
                  key={ap.id}
                  className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 hover:border-emerald-500/40 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${ap.status === 'in_use' ? 'bg-emerald-400' : 'bg-blue-400'}`}></span>
                        <h4 className="font-bold text-white text-xs truncate max-w-[180px]" title={ap.name}>
                          {ap.name}
                        </h4>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">{ap.assetTag} • {ap.brand}</span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                      PoE+ Aktif
                    </span>
                  </div>

                  <div className="bg-[#242424] p-2.5 rounded-lg border border-gray-700/60 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">Lokasyon:</span>
                      <span className="font-medium text-white truncate max-w-[150px]">{building?.name}</span>
                    </div>
                    <div className="text-[11px] text-gray-400">
                      Montaj: <strong className="text-gray-200">{ap.locationDetail}</strong>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-700/60 font-mono">
                      <span className="text-gray-400">IP:</span>
                      <span className="font-semibold text-emerald-400">{ap.specs?.ipAddress || 'DHCP'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-gray-400">MAC:</span>
                      <span className="text-gray-400 text-[10px]">{ap.specs?.macAddress || '-'}</span>
                    </div>
                  </div>

                  {ap.specs?.vlan && (
                    <div className="text-[10px] bg-[#242424] text-gray-300 p-1.5 rounded border border-gray-700/50">
                      <strong>VLAN:</strong> {ap.specs.vlan}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-gray-500">{city?.name}</span>
                    <button
                      onClick={() => onViewDetails(ap)}
                      className="text-[11px] text-emerald-400 hover:underline font-semibold cursor-pointer"
                    >
                      İncele &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: SWITCHLER & FIREWALL OMURGA */}
      {(selectedSubTab === 'all' || selectedSubTab === 'switch') && (
        <div className="bg-[#161616] rounded-2xl p-6 border border-gray-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="h-5 w-5 text-blue-400" />
                Omurga (Core) & Kenar Dağıtım Switch'ler & Güvenlik Duvarı
              </h3>
              <p className="text-xs text-gray-400">
                Binalardaki sistem kabinlerinde yer alan anahtarlama donanımları, port sayıları ve VLAN yapılandırmaları
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-950/60 text-blue-400 rounded-lg border border-blue-800/40">
              {switchDevices.length + firewalls.length} Donanım
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...firewalls, ...switchDevices].map(dev => {
              const building = db.buildings.find(b => b.id === dev.buildingId);
              const city = db.cities.find(c => c.id === dev.cityId);

              return (
                <div
                  key={dev.id}
                  className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-5 hover:border-blue-500/40 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60">
                          {dev.subCategory}
                        </span>
                        <h4 className="font-bold text-white text-sm">{dev.name}</h4>
                      </div>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {dev.brand} • Model: {dev.model}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-300 bg-[#242424] px-2 py-1 rounded border border-gray-700">
                      {dev.assetTag}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#242424] p-3 rounded-xl border border-gray-700/60">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Lokasyon</span>
                      <span className="font-semibold text-white">{city?.name} - {building?.name}</span>
                      <span className="text-[11px] text-gray-400 block truncate mt-0.5">{dev.locationDetail}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Port Sayısı</span>
                      <span className="font-semibold text-white">{dev.specs?.ports ? `${dev.specs.ports} Port` : 'Modüler'}</span>
                      {dev.specs?.poeSupported && (
                        <span className="text-[10px] text-emerald-400 font-bold block">PoE Destekli</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#0A0A0A] text-emerald-400 p-3 rounded-xl font-mono text-[11px] space-y-1 border border-gray-800">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Yönetim IP:</span>
                      <span className="text-white font-bold">{dev.specs?.ipAddress || '10.10.x.x'}</span>
                    </div>
                    {dev.specs?.macAddress && (
                      <div className="flex justify-between text-gray-400 text-[10px]">
                        <span className="text-gray-500">MAC:</span>
                        <span>{dev.specs.macAddress}</span>
                      </div>
                    )}
                    {dev.specs?.vlan && (
                      <div className="flex justify-between text-gray-400 text-[10px] pt-1 border-t border-gray-800">
                        <span className="text-gray-500">VLAN Tanımları:</span>
                        <span className="truncate max-w-[200px] text-amber-400">{dev.specs.vlan}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 4: IP TELEFONLAR & SANTRAL */}
      {(selectedSubTab === 'all' || selectedSubTab === 'telephony') && (
        <div className="bg-[#161616] rounded-2xl p-6 border border-gray-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PhoneCall className="h-5 w-5 text-amber-400" />
                IP Telefonlar, Telsiz DECT & Konferans Santralleri
              </h3>
              <p className="text-xs text-gray-400">
                Şirket içi dahili numaralar (extension), masaüstü IP telefonlar, DECT telsiz baz istasyonları ve toplantı salonu üniteleri
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-950/60 text-amber-400 rounded-lg border border-amber-800/40">
              {telephonyDevices.length} Aktif Hat / Cihaz
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#1A1A1A] text-gray-400 font-semibold border-b border-gray-800 text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-3">Dahili No</th>
                  <th className="py-3 px-3">Cihaz Modeli</th>
                  <th className="py-3 px-3">Tür</th>
                  <th className="py-3 px-3">Zimmet Sahibi / Kullanım</th>
                  <th className="py-3 px-3">Lokasyon & Bina</th>
                  <th className="py-3 px-3">IP / MAC</th>
                  <th className="py-3 px-3">SIP Santral</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {telephonyDevices.map(tel => {
                  const assignedPerson = db.people.find(p => p.id === tel.assignedToPersonId);
                  const building = db.buildings.find(b => b.id === tel.buildingId);

                  return (
                    <tr key={tel.id} className="hover:bg-[#1A1A1A] transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-amber-400 text-sm">
                        {tel.specs?.extensionNumber || '-'}
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">
                        {tel.name}
                        <span className="block text-[10px] text-gray-500 font-normal mt-0.5">{tel.assetTag}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#242424] text-gray-300 border border-gray-700">
                          {tel.subCategory}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-gray-200">
                        {assignedPerson ? (
                          <div>
                            <span className="text-white">{assignedPerson.fullName}</span>
                            <span className="block text-[10px] text-gray-400">{assignedPerson.title}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">Toplantı Odası / Ortak Hat</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-gray-300">
                        <div>{building?.name}</div>
                        <div className="text-[10px] text-gray-500">{tel.locationDetail}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <div className="text-white">{tel.specs?.ipAddress || '-'}</div>
                        <div className="text-[10px] text-gray-500">{tel.specs?.macAddress || '-'}</div>
                      </td>
                      <td className="py-3 px-3 text-gray-400 font-mono text-[11px]">
                        {tel.specs?.sipServer || 'sip.sirket.local'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

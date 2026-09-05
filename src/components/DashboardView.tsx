import React from 'react';
import { 
  Laptop, 
  Network, 
  Users, 
  Building2, 
  CheckCircle2, 
  Package, 
  AlertTriangle, 
  Radio, 
  Wifi, 
  PhoneCall, 
  KeyRound, 
  ArrowUpRight, 
  History,
  ShieldCheck,
  Server,
  Activity
} from 'lucide-react';
import { InventoryDatabase, NavigationTab, Asset } from '../types/inventory';

interface DashboardViewProps {
  db: InventoryDatabase;
  onNavigateTab: (tab: NavigationTab) => void;
  onOpenCheckout: (asset?: Asset) => void;
  onViewDetails: (asset: Asset) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  db,
  onNavigateTab,
  onOpenCheckout,
  onViewDetails,
}) => {
  const totalAssets = db.assets.length;
  const inUse = db.assets.filter(a => a.status === 'in_use').length;
  const inStock = db.assets.filter(a => a.status === 'in_stock').length;
  const inMaintenance = db.assets.filter(a => a.status === 'maintenance').length;
  
  const networkAssets = db.assets.filter(a => a.category === 'network_devices');
  const switches = networkAssets.filter(a => a.subCategory === 'Switch').length;
  const aps = networkAssets.filter(a => a.subCategory === 'Access Point').length;
  const ptps = networkAssets.filter(a => a.subCategory === 'PtP Yansıtıcı').length;
  const firewalls = networkAssets.filter(a => a.subCategory === 'Router & Firewall').length;
  const phones = db.assets.filter(a => a.category === 'telephony').length;

  // City breakdown calculation
  const cityStats = db.cities.map(city => {
    const cityPeople = db.people.filter(p => p.cityId === city.id);
    const cityAssets = db.assets.filter(a => a.cityId === city.id);
    const cityBuildings = db.buildings.filter(b => b.cityId === city.id);
    const localAssets = cityAssets.filter(a => a.isLocal).length;
    const remoteAssets = cityAssets.filter(a => !a.isLocal).length;

    return {
      city,
      peopleCount: cityPeople.length,
      assetCount: cityAssets.length,
      buildingCount: cityBuildings.length,
      localAssets,
      remoteAssets,
    };
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Quick Actions (Elegant Dark Style) */}
      <div className="bg-[#161616] text-white rounded-2xl p-6 shadow-xl border border-gray-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                VPS Node Active • Sistem Aktif
              </span>
              <span className="text-xs text-gray-500">
                Son Güncelleme: {new Date(db.lastUpdated).toLocaleDateString('tr-TR')} {new Date(db.lastUpdated).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Kurumsal IT Envanter & Donanım Takip Merkezi
            </h2>
            <p className="text-xs text-gray-400 mt-1 max-w-3xl leading-relaxed">
              Şirketinizin tüm lokasyonlarındaki kullanıcılar, bilgisayarlar, ağ switchleri, Wi-Fi access pointler, 
              noktadan noktaya radyolink yansıtıcılar ve IP santral donanımları tek merkezden denetlenmektedir.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="dash-btn-checkout"
              onClick={() => onOpenCheckout()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              <Users className="h-4 w-4" />
              <span>Yeni Zimmet Teslimi</span>
            </button>
            <button
              id="dash-btn-inventory-nav"
              onClick={() => onNavigateTab('inventory')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              <Laptop className="h-4 w-4" />
              <span>Envanter Tablosu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Cards (Theme: bg-[#161616] border-gray-800) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assets */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-[#161616] p-5 rounded-xl border border-gray-800 shadow-sm hover:border-blue-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Toplam Cihaz</span>
              <div className="h-8 w-8 rounded-lg bg-[#242424] text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Laptop className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white">{totalAssets}</span>
              <span className="text-xs font-semibold text-emerald-400">
                {inUse} Zimmetli
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
            <span>Depo: <strong className="text-white">{inStock}</strong></span>
            <span>Bakım: <strong className="text-amber-400">{inMaintenance}</strong></span>
            <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform">İncele &rarr;</span>
          </div>
        </div>

        {/* Network & Infrastructure */}
        <div 
          onClick={() => onNavigateTab('network')}
          className="bg-[#161616] p-5 rounded-xl border border-gray-800 shadow-sm hover:border-blue-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Ağ & Altyapı</span>
              <div className="h-8 w-8 rounded-lg bg-[#242424] text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Network className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-blue-500">{networkAssets.length}</span>
              <span className="text-xs font-semibold text-purple-400">
                {ptps} PtP Link
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
            <span>Switch: <strong className="text-white">{switches}</strong></span>
            <span>AP: <strong className="text-white">{aps}</strong></span>
            <span>Router: <strong className="text-white">{firewalls}</strong></span>
          </div>
        </div>

        {/* Telephony & Licenses */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className="bg-[#161616] p-5 rounded-xl border border-gray-800 shadow-sm hover:border-emerald-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">IP Telefon & Lisans</span>
              <div className="h-8 w-8 rounded-lg bg-[#242424] text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <PhoneCall className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-emerald-500">{phones}</span>
              <span className="text-xs font-semibold text-gray-400">
                {db.assets.filter(a => a.category === 'software_licenses').length} Lisans
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
            <span>Dahili Santral Aktif</span>
            <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform">İncele &rarr;</span>
          </div>
        </div>

        {/* Locations & People */}
        <div 
          onClick={() => onNavigateTab('locations')}
          className="bg-[#161616] p-5 rounded-xl border border-gray-800 shadow-sm hover:border-purple-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Lokasyon & Personel</span>
              <div className="h-8 w-8 rounded-lg bg-[#242424] text-purple-400 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-purple-400">{db.cities.length} Şehir</span>
              <span className="text-xs font-semibold text-gray-400">
                {db.buildings.length} Bina
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
            <span>Personel: <strong className="text-white">{db.people.length} Kişi</strong></span>
            <span className="text-purple-400 group-hover:translate-x-0.5 transition-transform">Harita &rarr;</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Cities Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Cities & Buildings User/Device Metrics */}
        <div className="lg:col-span-2 bg-[#161616] rounded-2xl p-6 border border-gray-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                Şehir Bazında Kullanıcı ve Cihaz Dağılımı
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Hangi şehirde kaç personel var, hangi binalarda yerel veya uzak saha cihazları bulunuyor
              </p>
            </div>
            <button
              id="dash-view-locations-btn"
              onClick={() => onNavigateTab('locations')}
              className="text-xs font-semibold text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              Tüm Lokasyonlar <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cityStats.map(stat => {
              const userPct = db.people.length > 0 ? Math.round((stat.peopleCount / db.people.length) * 100) : 0;
              return (
                <div
                  key={stat.city.id}
                  className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-white">{stat.city.name}</h4>
                        {stat.city.isHeadquarter && (
                          <span className="bg-blue-600/20 text-blue-400 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-blue-500/30">
                            Genel Merkez
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{stat.buildingCount} Bina / Tesis</p>
                    </div>
                    <span className="text-xs font-mono font-bold bg-[#242424] px-2 py-0.5 rounded border border-gray-700 text-gray-300">
                      {stat.city.code}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-gray-800 text-xs">
                    <div className="bg-[#242424] p-2.5 rounded-lg border border-gray-700/60">
                      <span className="text-gray-400 block text-[10px]">Kullanıcı Sayısı</span>
                      <span className="text-base font-bold text-blue-400">{stat.peopleCount} Kişi</span>
                      <div className="w-full bg-gray-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-full" 
                          style={{ width: `${userPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-[#242424] p-2.5 rounded-lg border border-gray-700/60">
                      <span className="text-gray-400 block text-[10px]">Cihaz Sayısı</span>
                      <span className="text-base font-bold text-white">{stat.assetCount} Cihaz</span>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                        <span className="text-emerald-400">{stat.localAssets} Yerel</span>
                        <span>•</span>
                        <span className="text-purple-400">{stat.remoteAssets} Uzak</span>
                      </div>
                    </div>
                  </div>

                  {/* Buildings in this city */}
                  <div className="mt-3">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Binalar & Ağ Durumu
                    </span>
                    <div className="space-y-1">
                      {db.buildings.filter(b => b.cityId === stat.city.id).map(bld => {
                        const bldAssets = db.assets.filter(a => a.buildingId === bld.id).length;
                        return (
                          <div key={bld.id} className="flex items-center justify-between text-xs py-1 px-2 bg-[#242424]/60 rounded border border-gray-800">
                            <span className="text-gray-300 truncate max-w-[170px]" title={bld.name}>
                              {bld.name}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {bld.isLocalNetwork ? (
                                <span className="text-[10px] text-emerald-400 bg-emerald-950/50 px-1 py-0.2 rounded font-medium border border-emerald-800/40">
                                  Yerel LAN
                                </span>
                              ) : (
                                <span className="text-[10px] text-indigo-400 bg-indigo-950/50 px-1 py-0.2 rounded font-medium border border-indigo-800/40">
                                  VPN / PtP
                                </span>
                              )}
                              <span className="text-[11px] font-semibold text-gray-400">
                                {bldAssets} cihaz
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Network & PtP Highlights + Storage Status */}
        <div className="space-y-4">
          {/* PtP & Network Widget */}
          <div className="bg-[#161616] rounded-2xl p-5 border border-gray-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="h-4 w-4 text-purple-400" />
                Noktadan Noktaya (PtP) & Ağ
              </h3>
              <button
                id="dash-network-more-btn"
                onClick={() => onNavigateTab('network')}
                className="text-xs text-blue-400 hover:underline font-semibold cursor-pointer"
              >
                Topoloji &rarr;
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Binalar arası kablosuz radyolink yansıtıcılar ve ana omurga switchler
            </p>

            <div className="space-y-2">
              {networkAssets.filter(a => a.subCategory === 'PtP Yansıtıcı').map(ptp => {
                const targetBld = db.buildings.find(b => b.id === ptp.specs?.ptpTargetBuildingId);
                const ownBld = db.buildings.find(b => b.id === ptp.buildingId);
                return (
                  <div key={ptp.id} className="p-3 bg-[#1A1A1A] border border-gray-800 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-purple-300">
                      <span className="truncate">{ptp.name}</span>
                      <span className="text-[10px] bg-purple-950/70 text-purple-300 border border-purple-800/50 px-1.5 py-0.5 rounded font-mono">
                        {ptp.specs?.ptpFrequency || '60 GHz'}
                      </span>
                    </div>
                    <div className="text-gray-400 text-[11px] flex items-center gap-1">
                      <span>{ownBld?.name}</span>
                      <span>&rarr;</span>
                      <span className="font-medium text-gray-200">{targetBld ? targetBld.name : 'Uzak Saha Anteni'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                      <span>Mesafe: {ptp.specs?.ptpDistanceKm ? `${ptp.specs.ptpDistanceKm} km` : '0.5 km'}</span>
                      <span className="font-mono text-gray-300">IP: {ptp.specs?.ipAddress || 'DHCP'}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-gray-800 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 bg-[#242424] rounded-lg border border-gray-700/60">
                <span className="text-gray-400 text-[10px] block">Aktif Switch</span>
                <span className="font-bold text-white">{switches} Adet</span>
              </div>
              <div className="p-2.5 bg-[#242424] rounded-lg border border-gray-700/60">
                <span className="text-gray-400 text-[10px] block">Wi-Fi AP</span>
                <span className="font-bold text-white">{aps} Adet</span>
              </div>
            </div>
          </div>

          {/* Depo Stok Durumu */}
          <div className="bg-[#161616] rounded-2xl p-5 border border-gray-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-400" />
              Depo Stok Durumu (Zimmete Hazır)
            </h3>
            <p className="text-xs text-gray-400">
              Yeni personeller için depoda bekletilen boşta donanımlar
            </p>

            <div className="space-y-2">
              {db.assets.filter(a => a.status === 'in_stock').slice(0, 3).map(stockAsset => (
                <div key={stockAsset.id} className="flex items-center justify-between p-2.5 bg-[#1A1A1A] border border-gray-800 rounded-xl text-xs">
                  <div>
                    <h5 className="font-semibold text-white">{stockAsset.name}</h5>
                    <span className="text-[11px] text-gray-400">
                      {stockAsset.locationDetail} • {stockAsset.assetTag}
                    </span>
                  </div>
                  <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-[10px] font-bold px-2 py-0.5 rounded">
                    Stokta
                  </span>
                </div>
              ))}
              {db.assets.filter(a => a.status === 'in_stock').length === 0 && (
                <p className="text-xs text-gray-500 italic">Depoda boşta cihaz bulunmuyor.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity / Assignment History Table */}
      <div className="bg-[#161616] rounded-2xl p-6 border border-gray-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="h-5 w-5 text-gray-400" />
              Son Zimmet Hareketleri
            </h3>
            <p className="text-xs text-gray-400">
              Personellere teslim edilen ve depoya iade alınan donanımların denetim defteri
            </p>
          </div>
          <button
            id="dash-view-all-logs-btn"
            onClick={() => onNavigateTab('logs')}
            className="text-xs font-semibold text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            Tümünü Gör &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#1A1A1A] text-gray-400 font-semibold border-b border-gray-800 text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Tutanak No</th>
                <th className="py-2.5 px-3">İşlem Türü</th>
                <th className="py-2.5 px-3">Cihaz / Donanım</th>
                <th className="py-2.5 px-3">İlgili Personel</th>
                <th className="py-2.5 px-3">Departman</th>
                <th className="py-2.5 px-3">Tarih</th>
                <th className="py-2.5 px-3">Yetkili IT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {db.logs.slice(0, 5).map(log => (
                <tr key={log.id} className="hover:bg-[#1A1A1A] transition-colors">
                  <td className="py-3 px-3 font-mono font-medium text-white">
                    {log.documentNumber}
                  </td>
                  <td className="py-3 px-3">
                    {log.actionType === 'checkout' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                        Zimmet Çıkışı
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-950/60 text-blue-400 border border-blue-800/40">
                        Depoya İade
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-white block">{log.assetName}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{log.assetTag}</span>
                  </td>
                  <td className="py-3 px-3 font-medium text-gray-200">
                    {log.personName || 'Genel Depo'}
                  </td>
                  <td className="py-3 px-3 text-gray-400">
                    {log.departmentName || '-'}
                  </td>
                  <td className="py-3 px-3 text-gray-400 font-mono text-[11px]">
                    {log.date}
                  </td>
                  <td className="py-3 px-3 text-gray-400">
                    {log.handledBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

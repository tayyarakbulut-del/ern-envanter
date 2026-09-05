import React from 'react';
import { 
  Server, 
  LayoutDashboard, 
  Laptop, 
  Network, 
  Users, 
  Building2, 
  ClipboardList, 
  HardDriveDownload, 
  PlusCircle, 
  ArrowLeftRight,
  FolderArchive,
} from 'lucide-react';
import { InventoryDatabase, NavigationTab } from '../types/inventory';

interface NavbarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  db: InventoryDatabase;
  onOpenNewAsset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  db,
  onOpenNewAsset,
}) => {
  const totalAssets = db.assets.length;
  const inUseAssets = db.assets.filter(a => a.status === 'in_use').length;
  const inStockAssets = db.assets.filter(a => a.status === 'in_stock').length;
  const networkDevices = db.assets.filter(a => a.category === 'network_devices').length;
  const totalPeople = db.people.length;

  const navItems: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'inventory', label: 'Envanter & Depo', icon: Laptop, badge: totalAssets },
    { id: 'network', label: 'Ağ & Altyapı & PtP', icon: Network, badge: networkDevices },
    { id: 'people', label: 'Personel & Departmanlar', icon: Users, badge: totalPeople },
    { id: 'locations', label: 'Lokasyonlar & Binalar', icon: Building2, badge: db.buildings.length },
    { id: 'logs', label: 'Zimmet Defteri', icon: ClipboardList, badge: db.logs.length },
    { id: 'media_vault', label: 'Medya & Evrak Deposu', icon: FolderArchive },
    { id: 'vps_plan', label: 'VPS Sunucu & Kurulum', icon: HardDriveDownload },
  ];

  return (
    <header className="bg-[#161616] text-gray-200 border-b border-gray-800 sticky top-0 z-40 shadow-xl no-print">
      {/* Top Banner with branding and quick stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold">
              IT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white uppercase">
                  IT Envanter & Zimmet <span className="text-blue-500 font-semibold text-sm">v2.0</span>
                </h1>
                <span className="bg-blue-500/10 text-blue-400 text-[11px] px-2 py-0.5 rounded-full font-medium border border-blue-500/20">
                  Elegant Dark
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Lokasyon, bina, ağ donanımları, PtP yansıtıcılar ve depo zimmet takip sistemi
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-1">
            <div className="bg-[#242424] px-3 py-1.5 rounded-lg border border-gray-700/60 text-xs">
              <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Kullanımda:</span>
              <span className="font-semibold text-emerald-400">{inUseAssets} Cihaz</span>
            </div>
            <div className="bg-[#242424] px-3 py-1.5 rounded-lg border border-gray-700/60 text-xs">
              <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Depoda Hazır:</span>
              <span className="font-semibold text-blue-400">{inStockAssets} Cihaz</span>
            </div>
            <div className="bg-[#242424] px-3 py-1.5 rounded-lg border border-gray-700/60 text-xs">
              <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Personel:</span>
              <span className="font-semibold text-purple-400">{totalPeople} Kişi</span>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-800">
              <button
                id="btn-quick-new-asset"
                onClick={onOpenNewAsset}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Cihaz Ekle</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-1.5 overflow-x-auto border-t border-gray-800/80 pt-1 pb-2 scrollbar-none">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-[#242424]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-[#242424] text-gray-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

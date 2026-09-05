import React, { useState } from 'react';
import { X, Building2, Save } from 'lucide-react';
import { Building, InventoryDatabase } from '../types/inventory';

interface BuildingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (building: Building) => void;
  db: InventoryDatabase;
}

export const BuildingFormModal: React.FC<BuildingFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  db,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [cityId, setCityId] = useState(db.cities[0]?.id || '');
  const [campusName, setCampusName] = useState('');
  const [address, setAddress] = useState('');
  const [isLocalNetwork, setIsLocalNetwork] = useState(true);
  const [hasServerRoom, setHasServerRoom] = useState(true);
  const [rackCount, setRackCount] = useState('2');
  const [floorsStr, setFloorsStr] = useState('Kat 1, Kat 2, Kat 3');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Lütfen bina adını giriniz.');
      return;
    }

    const floors = floorsStr.split(',').map(s => s.trim()).filter(Boolean);
    const newBuilding: Building = {
      id: 'bld-' + Date.now(),
      name: name.trim(),
      cityId,
      campusName: campusName.trim() || name.trim(),
      address: address.trim() || 'Şirket Yerleşkesi',
      isLocalNetwork,
      hasServerRoom,
      rackCount: parseInt(rackCount) || 1,
      floors: floors.length > 0 ? floors : ['Zemin Kat'],
      notes: notes.trim(),
    };

    onSave(newBuilding);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#161616] rounded-2xl max-w-lg w-full shadow-2xl border border-gray-800 overflow-hidden my-8 text-gray-200">
        <div className="bg-[#121212] border-b border-gray-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-500" />
            <h3 className="text-base font-bold">Yeni Şirket Lokasyonu / Bina Ekle</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-lg cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Bina / Tesis Adı *</label>
              <input
                type="text"
                required
                placeholder="Örn: Maslak C Blok Ar-Ge"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 font-medium text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Bulunduğu Şehir *</label>
              <select
                value={cityId}
                onChange={e => setCityId(e.target.value)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 font-medium text-white focus:outline-none focus:border-blue-500"
              >
                {db.cities.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Yerleşke / Kampüs Tanımı</label>
            <input
              type="text"
              placeholder="Örn: Maslak Ana Teknopark Kampüsü"
              value={campusName}
              onChange={e => setCampusName(e.target.value)}
              className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Fiziksel Adres</label>
            <input
              type="text"
              placeholder="Mahalle, cadde, kapı no..."
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Network Local vs Remote */}
          <div className="p-3.5 bg-[#1A1A1A] rounded-xl border border-gray-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Yerel Ağ (LAN / On-Premise) mi?</span>
                <span className="text-[11px] text-gray-400">
                  {isLocalNetwork ? 'Ana genel merkez ağı ile doğrudan bağlı' : 'Uzak saha / IPSec VPN bağlantılı'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={isLocalNetwork}
                onChange={e => setIsLocalNetwork(e.target.checked)}
                className="h-4 w-4 rounded accent-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-800">
              <div>
                <span className="font-semibold text-white block">Sistem Odası / Data Center Var mı?</span>
                <span className="text-[11px] text-gray-400">Özel klimalı sunucu / kabinet odası</span>
              </div>
              <input
                type="checkbox"
                checked={hasServerRoom}
                onChange={e => setHasServerRoom(e.target.checked)}
                className="h-4 w-4 rounded accent-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Rack Kabinet Sayısı</label>
              <input
                type="number"
                min="0"
                value={rackCount}
                onChange={e => setRackCount(e.target.value)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 font-medium text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Katlar (Virgülle ayırın)</label>
              <input
                type="text"
                placeholder="Zemin, 1. Kat, 2. Kat"
                value={floorsStr}
                onChange={e => setFloorsStr(e.target.value)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Açıklama / Notlar</label>
            <textarea
              rows={2}
              placeholder="Örn: Bu bina PtP Radyolink ile Maslak A Blok'a 1.8 km mesafeden bağlıdır."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-gray-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#242424] hover:bg-[#2e2e2e] text-gray-300 border border-gray-700 font-semibold rounded-xl cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Lokasyonu Kaydet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

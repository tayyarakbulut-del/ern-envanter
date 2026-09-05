import React, { useState } from 'react';
import { X, RotateCcw, Building2, MapPin, Check } from 'lucide-react';
import { Asset, InventoryDatabase } from '../types/inventory';

interface CheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    assetId: string,
    targetBuildingId: string,
    locationDetail: string,
    handledBy: string,
    notes: string,
    condition: 'new' | 'good' | 'fair' | 'damaged',
    newStatus: 'in_stock' | 'maintenance' | 'scrapped'
  ) => void;
  asset: Asset | null;
  db: InventoryDatabase;
}

export const CheckinModal: React.FC<CheckinModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  asset,
  db,
}) => {
  if (!isOpen || !asset) return null;

  const currentPerson = db.people.find(p => p.id === asset.assignedToPersonId);
  const [targetBuildingId, setTargetBuildingId] = useState<string>(asset.buildingId || db.buildings[0]?.id || '');
  const [locationDetail, setLocationDetail] = useState('IT Depo Raf B2 (Kullanıma Hazır)');
  const [handledBy, setHandledBy] = useState('Deniz Korkmaz (IT Destek)');
  const [condition, setCondition] = useState<'new' | 'good' | 'fair' | 'damaged'>('good');
  const [newStatus, setNewStatus] = useState<'in_stock' | 'maintenance' | 'scrapped'>('in_stock');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(asset.id, targetBuildingId, locationDetail, handledBy, notes, condition, newStatus);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#161616] rounded-2xl max-w-lg w-full shadow-2xl border border-gray-800 overflow-hidden my-8 text-gray-200">
        {/* Modal Header */}
        <div className="bg-[#121212] border-b border-gray-800 text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-amber-400" />
              Zimmet İadesi Al (Depoya Giriş)
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Cihazı personelden teslim alıp depoya, bakıma veya yeni lokasyona kaydedin
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-lg cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Cihaz ve mevcut sahip bilgisi */}
          <div className="p-3.5 bg-[#1A1A1A] rounded-xl border border-gray-800 space-y-1">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">İade Alınan Cihaz</span>
                <strong className="text-white text-sm">{asset.name}</strong>
              </div>
              <span className="font-mono text-xs font-bold bg-[#242424] text-amber-300 px-2 py-0.5 rounded border border-gray-700">
                {asset.assetTag}
              </span>
            </div>
            <div className="text-gray-400 text-[11px] pt-1">
              Mevcut Zimmetli: <strong className="text-gray-200">{currentPerson?.fullName || 'Bilinmiyor'}</strong> ({currentPerson?.title})
            </div>
          </div>

          {/* Hedef Depo / Bina */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Teslim Alınacak Bina / Depo *</label>
              <select
                required
                value={targetBuildingId}
                onChange={e => setTargetBuildingId(e.target.value)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2.5 font-medium text-white focus:outline-none focus:border-amber-500"
              >
                {db.buildings.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-semibold mb-1">Yeni Cihaz Durumu</label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as any)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2.5 font-medium text-white focus:outline-none focus:border-amber-500"
              >
                <option value="in_stock">Depoda (Tekrar Zimmete Hazır)</option>
                <option value="maintenance">Bakım / Onarım Gerekiyor</option>
                <option value="scrapped">Hurda / Kullanılamaz</option>
              </select>
            </div>
          </div>

          {/* Depo İçi Konum */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Depo İçi Raf / Konum Detayı</label>
            <input
              type="text"
              required
              placeholder="Örn: Maslak A Blok IT Depo - Raf A-3 Kutu 2"
              value={locationDetail}
              onChange={e => setLocationDetail(e.target.value)}
              className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 font-medium text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Handled By & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Teslim Alan IT Yetkilisi *</label>
              <input
                type="text"
                required
                value={handledBy}
                onChange={e => setHandledBy(e.target.value)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 font-medium text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Cihazın İade Fiziksel Durumu</label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value as any)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 font-medium text-white focus:outline-none focus:border-amber-500"
              >
                <option value="good">Eksiksiz & Çalışır Durumda</option>
                <option value="fair">Kullanım İzi Var / Normal</option>
                <option value="damaged">Hasarlı / Çizik / Arızalı</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1">İade Notu & Kontrol Açıklaması</label>
            <textarea
              rows={2}
              placeholder="Örn: Şarj adaptörü ve çantası eksiksiz teslim alındı. Cihaz formatlanıp depoya konuldu."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Footer */}
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
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>İadeyi Onayla & Depoya Al</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

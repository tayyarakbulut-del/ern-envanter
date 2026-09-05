import React, { useState } from 'react';
import { X, ArrowLeftRight, Check, User, Laptop } from 'lucide-react';
import { Asset, Person, InventoryDatabase } from '../types/inventory';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    assetId: string,
    personId: string,
    handledBy: string,
    accessories: string[],
    notes: string,
    condition: 'new' | 'good' | 'fair' | 'damaged'
  ) => void;
  db: InventoryDatabase;
  initialAsset?: Asset | null;
  initialPerson?: Person | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  db,
  initialAsset,
  initialPerson,
}) => {
  if (!isOpen) return null;

  const availableAssets = db.assets.filter(a => a.status === 'in_stock' || a.id === initialAsset?.id);
  const [selectedAssetId, setSelectedAssetId] = useState<string>(initialAsset?.id || availableAssets[0]?.id || '');
  const [selectedPersonId, setSelectedPersonId] = useState<string>(initialPerson?.id || db.people[0]?.id || '');
  const [handledBy, setHandledBy] = useState('Deniz Korkmaz (IT Destek)');
  const [condition, setCondition] = useState<'new' | 'good' | 'fair' | 'damaged'>('good');
  const [notes, setNotes] = useState('');

  // Accessories Checklist
  const commonAccessories = [
    'Orijinal Şarj Cihazı / Adaptör',
    'Taşıma Sırt Çantası',
    'Kablosuz Optik Mouse',
    'HDMI / Görüntü Kablosu',
    'RJ45 Cat6 Patch Ethernet Kablosu',
    'Type-C Çoklayıcı / Hub Dongle',
    'Kulaklık / Mikrofon Seti',
  ];
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([
    'Orijinal Şarj Cihazı / Adaptör',
    'Taşıma Sırt Çantası',
  ]);

  const toggleAccessory = (acc: string) => {
    setSelectedAccessories(prev =>
      prev.includes(acc) ? prev.filter(a => a !== acc) : [...prev, acc]
    );
  };

  const selectedAsset = db.assets.find(a => a.id === selectedAssetId);
  const selectedPerson = db.people.find(p => p.id === selectedPersonId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !selectedPersonId) {
      alert('Lütfen hem cihazı hem personeli seçiniz.');
      return;
    }
    onConfirm(selectedAssetId, selectedPersonId, handledBy, selectedAccessories, notes, condition);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#161616] rounded-2xl max-w-lg w-full shadow-2xl border border-gray-800 overflow-hidden my-8 text-gray-200">
        {/* Modal Header */}
        <div className="bg-[#121212] border-b border-gray-800 text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-emerald-400" />
              Yeni Donanım Zimmet Teslimi (Zimmet Çıkışı)
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Depodan cihazı personele zimmetleyin ve resmi teslim-tesellüm tutanağı oluşturun
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-lg cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Asset Selection */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1 flex items-center gap-1.5">
              <Laptop className="h-4 w-4 text-blue-400" />
              Zimmetlenecek Donanım / Cihaz *
            </label>
            <select
              required
              value={selectedAssetId}
              onChange={e => setSelectedAssetId(e.target.value)}
              className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2.5 font-medium text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Cihaz Seçiniz...</option>
              {availableAssets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.assetTag} - {asset.subCategory})
                </option>
              ))}
            </select>
            {selectedAsset && (
              <div className="mt-1.5 p-2 bg-[#1A1A1A] border border-gray-800 text-blue-300 rounded-lg text-[11px] flex items-center justify-between">
                <span>Seri No: <strong className="text-white">{selectedAsset.serialNumber}</strong></span>
                <span>Konum: {selectedAsset.locationDetail}</span>
              </div>
            )}
          </div>

          {/* Person Selection */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1 flex items-center gap-1.5">
              <User className="h-4 w-4 text-emerald-400" />
              Zimmet Yapılacak Personel *
            </label>
            <select
              required
              value={selectedPersonId}
              onChange={e => setSelectedPersonId(e.target.value)}
              className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2.5 font-medium text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Personel Seçiniz...</option>
              {db.people.map(person => (
                <option key={person.id} value={person.id}>
                  {person.fullName} - {person.title} ({person.employeeId})
                </option>
              ))}
            </select>
            {selectedPerson && (
              <div className="mt-1.5 p-2 bg-[#1A1A1A] border border-gray-800 text-emerald-300 rounded-lg text-[11px] flex items-center justify-between">
                <span>E-posta: {selectedPerson.email}</span>
                <span>Dahili: <strong className="text-white">{selectedPerson.extension || '-'}</strong></span>
              </div>
            )}
          </div>

          {/* Handled By & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Teslim Eden IT Personeli *</label>
              <input
                type="text"
                required
                value={handledBy}
                onChange={e => setHandledBy(e.target.value)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 font-medium text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Cihazın Fiziksel Durumu</label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value as any)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 font-medium text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="new">Kutusunda Sıfır</option>
                <option value="good">Kusursuz / Çok İyi</option>
                <option value="fair">Kullanılmış / Normal</option>
                <option value="damaged">Kozmetik Kusurlu</option>
              </select>
            </div>
          </div>

          {/* Accessories Checklist */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1.5">
              Cihaz ile Birlikte Teslim Edilen Aksesuarlar
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-[#1A1A1A] p-3 rounded-xl border border-gray-800">
              {commonAccessories.map((acc, index) => {
                const isChecked = selectedAccessories.includes(acc);
                return (
                  <label key={index} className="flex items-center gap-2 cursor-pointer text-gray-300">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleAccessory(acc)}
                      className="rounded accent-emerald-500"
                    />
                    <span className="text-[11px]">{acc}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Teslim Notları</label>
            <textarea
              rows={2}
              placeholder="Örn: Maslak A Blok Kat 3 ofisine kurulum yapıldı, şirket donanım sözleşmesi imzalatıldı."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Modal Footer */}
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
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Zimmeti Onayla & Tutanağı Kaydet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

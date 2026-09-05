import React, { useState } from 'react';
import { X, UserPlus, Save, Users } from 'lucide-react';
import { Person, InventoryDatabase } from '../types/inventory';

interface PersonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (person: Person) => void;
  personToEdit?: Person | null;
  db: InventoryDatabase;
}

export const PersonFormModal: React.FC<PersonFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  personToEdit,
  db,
}) => {
  if (!isOpen) return null;

  const [fullName, setFullName] = useState(personToEdit?.fullName || '');
  const [employeeId, setEmployeeId] = useState(personToEdit?.employeeId || 'PER-' + Math.floor(100 + Math.random() * 900));
  const [email, setEmail] = useState(personToEdit?.email || '');
  const [phone, setPhone] = useState(personToEdit?.phone || '');
  const [extension, setExtension] = useState(personToEdit?.extension || '');
  const [departmentId, setDepartmentId] = useState(personToEdit?.departmentId || db.departments[0]?.id || '');
  const [divisionId, setDivisionId] = useState(personToEdit?.divisionId || db.divisions[0]?.id || '');
  const [title, setTitle] = useState(personToEdit?.title || '');
  const [cityId, setCityId] = useState(personToEdit?.cityId || db.cities[0]?.id || '');
  const [buildingId, setBuildingId] = useState(personToEdit?.buildingId || db.buildings[0]?.id || '');
  const [roomDetail, setRoomDetail] = useState(personToEdit?.roomDetail || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !employeeId.trim()) {
      alert('Lütfen çalışan adı ve sicil numarasını giriniz.');
      return;
    }

    const newPerson: Person = {
      id: personToEdit?.id || 'per-' + Date.now(),
      employeeId: employeeId.trim(),
      fullName: fullName.trim(),
      email: email.trim() || `${fullName.toLowerCase().replace(/\s+/g, '.')}@sirket.com`,
      phone: phone.trim(),
      extension: extension.trim(),
      departmentId,
      divisionId: divisionId || undefined,
      title: title.trim() || 'Çalışan',
      cityId,
      buildingId,
      roomDetail: roomDetail.trim(),
      status: 'active',
      createdAt: personToEdit?.createdAt || new Date().toISOString().slice(0, 10),
    };

    onSave(newPerson);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#161616] rounded-2xl max-w-lg w-full shadow-2xl border border-gray-800 overflow-hidden my-8 text-gray-200">
        <div className="bg-[#121212] border-b border-gray-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <h3 className="text-base font-bold">{personToEdit ? 'Personeli Düzenle' : 'Yeni Personel Kaydı'}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-lg cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Ad Soyad *</label>
              <input
                type="text"
                required
                placeholder="Örn: Caner Yılmaz"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 font-medium text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Sicil Numarası *</label>
              <input
                type="text"
                required
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 font-mono font-bold text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Unvan / Pozisyon *</label>
              <input
                type="text"
                required
                placeholder="Örn: Ağ ve Güvenlik Uzmanı"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 font-medium text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Dahili Hat (Ext)</label>
              <input
                type="text"
                placeholder="Örn: 1042"
                value={extension}
                onChange={e => setExtension(e.target.value)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">E-Posta Adresi</label>
              <input
                type="email"
                placeholder="ornek@sirket.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Telefon / GSM</label>
              <input
                type="tel"
                placeholder="0532 000 00 00"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Departman</label>
              <select
                value={departmentId}
                onChange={e => setDepartmentId(e.target.value)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 font-medium text-white focus:outline-none focus:border-blue-500"
              >
                {db.departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Bağlı Bölüm / Birim</label>
              <select
                value={divisionId}
                onChange={e => setDivisionId(e.target.value)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 font-medium text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Genel / Yok</option>
                {db.divisions.map(div => (
                  <option key={div.id} value={div.id}>{div.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Şehir</label>
              <select
                value={cityId}
                onChange={e => {
                  setCityId(e.target.value);
                  const blds = db.buildings.filter(b => b.cityId === e.target.value);
                  if (blds.length > 0) setBuildingId(blds[0].id);
                }}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 text-white focus:outline-none focus:border-blue-500"
              >
                {db.cities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-300 font-semibold mb-1">Çalıştığı Bina / Tesis</label>
              <select
                value={buildingId}
                onChange={e => setBuildingId(e.target.value)}
                className="w-full bg-[#242424] border border-gray-700 rounded-xl p-2 text-white focus:outline-none focus:border-blue-500"
              >
                {db.buildings.filter(b => b.cityId === cityId).map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Oda / Masa / Kat Detayı</label>
            <input
              type="text"
              placeholder="Örn: Maslak A Blok Kat 3 Açık Ofis No: 304"
              value={roomDetail}
              onChange={e => setRoomDetail(e.target.value)}
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
              <span>{personToEdit ? 'Güncelle' : 'Personeli Kaydet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  MapPin, 
  Building2, 
  Phone, 
  Mail, 
  Laptop, 
  ArrowLeftRight, 
  FileText, 
  Edit, 
  Trash2,
  Briefcase
} from 'lucide-react';
import { InventoryDatabase, Person, Asset } from '../types/inventory';

interface PeopleViewProps {
  db: InventoryDatabase;
  onOpenNewPerson: () => void;
  onEditPerson: (person: Person) => void;
  onDeletePerson: (personId: string) => void;
  onCheckoutToPerson: (person: Person) => void;
  onViewReceipt: (asset: Asset) => void;
}

export const PeopleView: React.FC<PeopleViewProps> = ({
  db,
  onOpenNewPerson,
  onEditPerson,
  onDeletePerson,
  onCheckoutToPerson,
  onViewReceipt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  const filteredPeople = db.people.filter(p => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = p.fullName.toLowerCase().includes(term);
      const matchId = p.employeeId.toLowerCase().includes(term);
      const matchEmail = p.email.toLowerCase().includes(term);
      const matchTitle = p.title.toLowerCase().includes(term);
      const matchExt = p.extension.toLowerCase().includes(term);
      if (!matchName && !matchId && !matchEmail && !matchTitle && !matchExt) {
        return false;
      }
    }
    if (selectedDept !== 'all' && p.departmentId !== selectedDept) return false;
    if (selectedCity !== 'all' && p.cityId !== selectedCity) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#161616] p-5 rounded-2xl border border-gray-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Personel, Departmanlar ve Zimmetli Cihazlar
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Çalışan listesi, bağlı oldukları birimler, çalıştıkları binalar ve üzerlerindeki aktif demirbaşlar
          </p>
        </div>

        <button
          id="btn-add-person"
          onClick={onOpenNewPerson}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Yeni Personel Kaydet</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#161616] p-4 rounded-2xl border border-gray-800 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            id="people-search-input"
            type="text"
            placeholder="Personel adı, sicil no (PER-xxx), unvan veya e-posta ile ara..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-[#242424] border border-gray-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="bg-[#242424] border border-gray-700 rounded-xl p-2 text-xs font-medium text-gray-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tüm Departmanlar</option>
            {db.departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="bg-[#242424] border border-gray-700 rounded-xl p-2 text-xs font-medium text-gray-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tüm Şehirler</option>
            {db.cities.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* People Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPeople.map(person => {
          const dept = db.departments.find(d => d.id === person.departmentId);
          const division = db.divisions.find(d => d.id === person.divisionId);
          const city = db.cities.find(c => c.id === person.cityId);
          const building = db.buildings.find(b => b.id === person.buildingId);
          const assignedAssets = db.assets.filter(a => a.assignedToPersonId === person.id);

          return (
            <div
              key={person.id}
              className="bg-[#161616] rounded-2xl p-5 border border-gray-800 shadow-sm hover:border-blue-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Person Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{person.fullName}</h3>
                      <span className="text-[10px] font-mono bg-[#242424] text-gray-300 border border-gray-700 px-1.5 py-0.5 rounded font-bold">
                        {person.employeeId}
                      </span>
                    </div>
                    <p className="text-xs text-blue-400 font-medium mt-0.5">{person.title}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditPerson(person)}
                      title="Personeli Düzenle"
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-[#242424] rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`${person.fullName} personelini silmek istediğinize emin misiniz?`)) {
                          onDeletePerson(person.id);
                        }
                      }}
                      title="Personeli Sil"
                      className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Department & Division */}
                <div className="text-xs text-gray-300 space-y-1.5 bg-[#242424] p-3 rounded-xl border border-gray-700/60">
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="font-semibold text-white">{dept?.name}</span>
                    {division && <span className="text-gray-400">({division.name})</span>}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <MapPin className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                    <span>{city?.name} • {building?.name}</span>
                  </div>
                  {person.roomDetail && (
                    <div className="text-[11px] text-gray-400 pl-5">
                      {person.roomDetail}
                    </div>
                  )}
                </div>

                {/* Contact info */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300 pt-1">
                  <div className="flex items-center gap-1 truncate" title={person.email}>
                    <Mail className="h-3 w-3 text-gray-500 shrink-0" />
                    <span className="truncate">{person.email}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end font-mono">
                    <Phone className="h-3 w-3 text-gray-500 shrink-0" />
                    <span>Dahili: <strong className="text-amber-400">{person.extension || '-'}</strong></span>
                  </div>
                </div>

                {/* Assigned Assets section */}
                <div className="pt-2 border-t border-gray-800">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                      <Laptop className="h-3.5 w-3.5 text-blue-400" />
                      Zimmetli Cihazlar ({assignedAssets.length})
                    </span>
                    <button
                      onClick={() => onCheckoutToPerson(person)}
                      className="text-[11px] text-emerald-400 hover:underline font-semibold cursor-pointer"
                    >
                      + Zimmet Ver
                    </button>
                  </div>

                  {assignedAssets.length > 0 ? (
                    <div className="space-y-1.5">
                      {assignedAssets.map(asset => (
                        <div
                          key={asset.id}
                          className="flex items-center justify-between p-2.5 bg-[#1A1A1A] border border-gray-800 rounded-lg text-xs"
                        >
                          <div className="truncate max-w-[190px]">
                            <span className="font-semibold text-white block truncate">{asset.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono">{asset.assetTag} • {asset.subCategory}</span>
                          </div>
                          <button
                            title="Resmi Zimmet Tutanağını Görüntüle"
                            onClick={() => onViewReceipt(asset)}
                            className="p-1.5 text-purple-400 hover:text-purple-300 hover:bg-[#242424] rounded cursor-pointer"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic py-1">Üzerine kayıtlı zimmet bulunmuyor.</p>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
                <span className="text-[10px] text-gray-500">
                  Kayıt: {person.createdAt}
                </span>
                <button
                  onClick={() => onCheckoutToPerson(person)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#242424] hover:bg-[#2e2e2e] text-gray-200 border border-gray-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  <ArrowLeftRight className="h-3 w-3" />
                  <span>Cihaz Ata</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

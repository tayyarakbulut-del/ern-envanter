import { InventoryDatabase, Asset, Person, Building, City, AssignmentLog } from '../types/inventory';
import { INITIAL_INVENTORY_DATA } from '../data/initialData';

const STORAGE_KEY = 'itam_inventory_db_v1';

export function loadDatabase(): InventoryDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveDatabase(INITIAL_INVENTORY_DATA);
      return INITIAL_INVENTORY_DATA;
    }
    const parsed = JSON.parse(raw) as InventoryDatabase;
    // ensure all essential fields exist
    if (!parsed.assets || !parsed.people || !parsed.cities || !parsed.buildings) {
      saveDatabase(INITIAL_INVENTORY_DATA);
      return INITIAL_INVENTORY_DATA;
    }
    return parsed;
  } catch (err) {
    console.warn('Storage read error, loading defaults:', err);
    return INITIAL_INVENTORY_DATA;
  }
}

export function saveDatabase(db: InventoryDatabase): void {
  try {
    const updated = {
      ...db,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Storage save error:', err);
  }
}

export function resetDatabase(): InventoryDatabase {
  saveDatabase(INITIAL_INVENTORY_DATA);
  return INITIAL_INVENTORY_DATA;
}

export function exportDatabaseJSON(): string {
  const db = loadDatabase();
  return JSON.stringify(db, null, 2);
}

export function importDatabaseJSON(jsonString: string): { success: boolean; message: string; db?: InventoryDatabase } {
  try {
    const parsed = JSON.parse(jsonString) as InventoryDatabase;
    if (!parsed.assets || !Array.isArray(parsed.assets) || !parsed.people || !Array.isArray(parsed.people)) {
      return { success: false, message: 'Geçersiz veri formatı. assets ve people dizileri bulunamadı.' };
    }
    saveDatabase(parsed);
    return { success: true, message: 'Envanter veritabanı başarıyla içe aktarıldı.', db: parsed };
  } catch (err) {
    return { success: false, message: 'JSON ayrıştırma hatası: ' + (err instanceof Error ? err.message : String(err)) };
  }
}

// Check out (Zimmet Verme)
export function checkoutAsset(
  db: InventoryDatabase,
  assetId: string,
  personId: string,
  handledBy: string,
  accessories: string[],
  notes: string,
  condition: 'new' | 'good' | 'fair' | 'damaged' = 'good'
): InventoryDatabase {
  const assetIndex = db.assets.findIndex(a => a.id === assetId);
  const person = db.people.find(p => p.id === personId);
  if (assetIndex === -1 || !person) return db;

  const asset = db.assets[assetIndex];
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 16).replace('T', ' ');
  const docNum = `ZMT-${now.getFullYear()}-${String(db.logs.length + 1).padStart(4, '0')}`;

  const updatedAsset: Asset = {
    ...asset,
    status: 'in_use',
    assignedToPersonId: person.id,
    assignedDate: dateStr,
    cityId: person.cityId,
    buildingId: person.buildingId,
    updatedAt: dateStr,
  };

  const newLog: AssignmentLog = {
    id: 'log-' + Date.now(),
    documentNumber: docNum,
    assetId: asset.id,
    assetTag: asset.assetTag,
    assetName: asset.name,
    personId: person.id,
    personName: person.fullName,
    departmentName: db.departments.find(d => d.id === person.departmentId)?.name || '',
    actionType: 'checkout',
    date: dateStr,
    handledBy,
    condition,
    accessoriesIncluded: accessories,
    notes,
  };

  const newAssets = [...db.assets];
  newAssets[assetIndex] = updatedAsset;

  const newDb: InventoryDatabase = {
    ...db,
    assets: newAssets,
    logs: [newLog, ...db.logs],
  };

  saveDatabase(newDb);
  return newDb;
}

// Check in (Zimmet İadesi Alma / Depoya Dönüş)
export function checkinAsset(
  db: InventoryDatabase,
  assetId: string,
  targetBuildingId: string,
  locationDetail: string,
  handledBy: string,
  notes: string,
  condition: 'new' | 'good' | 'fair' | 'damaged' = 'good',
  newStatus: 'in_stock' | 'maintenance' | 'scrapped' = 'in_stock'
): InventoryDatabase {
  const assetIndex = db.assets.findIndex(a => a.id === assetId);
  if (assetIndex === -1) return db;

  const asset = db.assets[assetIndex];
  const prevPerson = db.people.find(p => p.id === asset.assignedToPersonId);
  const building = db.buildings.find(b => b.id === targetBuildingId);
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 16).replace('T', ' ');
  const docNum = `IAD-${now.getFullYear()}-${String(db.logs.length + 1).padStart(4, '0')}`;

  const updatedAsset: Asset = {
    ...asset,
    status: newStatus,
    assignedToPersonId: undefined,
    assignedDate: undefined,
    buildingId: targetBuildingId,
    cityId: building ? building.cityId : asset.cityId,
    locationDetail,
    updatedAt: dateStr,
  };

  const newLog: AssignmentLog = {
    id: 'log-' + Date.now(),
    documentNumber: docNum,
    assetId: asset.id,
    assetTag: asset.assetTag,
    assetName: asset.name,
    personId: prevPerson?.id,
    personName: prevPerson?.fullName || 'Bilinmiyor',
    departmentName: prevPerson ? db.departments.find(d => d.id === prevPerson.departmentId)?.name : '',
    actionType: 'checkin',
    date: dateStr,
    handledBy,
    condition,
    accessoriesIncluded: [],
    notes: `Depoya Teslim Alındı (${locationDetail}). ${notes}`,
  };

  const newAssets = [...db.assets];
  newAssets[assetIndex] = updatedAsset;

  const newDb: InventoryDatabase = {
    ...db,
    assets: newAssets,
    logs: [newLog, ...db.logs],
  };

  saveDatabase(newDb);
  return newDb;
}

import React, { useState, useEffect } from 'react';
import { 
  InventoryDatabase, 
  NavigationTab, 
  Asset, 
  Person, 
  Building, 
  AssignmentLog 
} from './types/inventory';
import { 
  loadDatabase, 
  saveDatabase, 
  checkoutAsset, 
  checkinAsset 
} from './services/storage';
import { deleteStoredFile } from './services/mediaStorage';

// Views
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { AssetListView } from './components/AssetListView';
import { NetworkTopologyView } from './components/NetworkTopologyView';
import { PeopleView } from './components/PeopleView';
import { LocationsView } from './components/LocationsView';
import { AssignmentLogsView } from './components/AssignmentLogsView';
import { MediaVaultView } from './components/MediaVaultView';
import { VpsSettingsView } from './components/VpsSettingsView';

// Modals
import { AssetFormModal } from './components/AssetFormModal';
import { CheckoutModal } from './components/CheckoutModal';
import { CheckinModal } from './components/CheckinModal';
import { ReceiptModal } from './components/ReceiptModal';
import { AssetDetailModal } from './components/AssetDetailModal';
import { PersonFormModal } from './components/PersonFormModal';
import { BuildingFormModal } from './components/BuildingFormModal';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';

export default function App() {
  const [db, setDb] = useState<InventoryDatabase>(loadDatabase);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  // Modals state
  const [isAssetFormOpen, setIsAssetFormOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutAssetTarget, setCheckoutAssetTarget] = useState<Asset | null>(null);
  const [checkoutPersonTarget, setCheckoutPersonTarget] = useState<Person | null>(null);

  const [isCheckinOpen, setIsCheckinOpen] = useState(false);
  const [checkinAssetTarget, setCheckinAssetTarget] = useState<Asset | null>(null);

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptAsset, setReceiptAsset] = useState<Asset | null>(null);
  const [receiptLog, setReceiptLog] = useState<AssignmentLog | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<Asset | null>(null);

  const [isPersonFormOpen, setIsPersonFormOpen] = useState(false);
  const [personToEdit, setPersonToEdit] = useState<Person | null>(null);

  const [isBuildingFormOpen, setIsBuildingFormOpen] = useState(false);

  // Signed document modal state
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [docModalAsset, setDocModalAsset] = useState<Asset | null>(null);
  const [docModalLog, setDocModalLog] = useState<AssignmentLog | null>(null);

  // Sync back to storage on DB changes
  const updateDatabase = (newDb: InventoryDatabase) => {
    setDb(newDb);
    saveDatabase(newDb);
  };

  // Asset CRUD Handlers
  const handleSaveAsset = (asset: Asset) => {
    const existingIndex = db.assets.findIndex(a => a.id === asset.id);
    let updatedAssets: Asset[];
    if (existingIndex >= 0) {
      updatedAssets = [...db.assets];
      updatedAssets[existingIndex] = asset;
    } else {
      updatedAssets = [asset, ...db.assets];
    }
    updateDatabase({ ...db, assets: updatedAssets });
  };

  const handleDeleteAsset = (assetId: string) => {
    const assetToDelete = db.assets.find(a => a.id === assetId);
    if (assetToDelete) {
      // Clean up files in the isolated IndexedDB vault
      const filesToClean: string[] = [];
      if (assetToDelete.primaryImage) filesToClean.push(assetToDelete.primaryImage);
      if (assetToDelete.images) filesToClean.push(...assetToDelete.images);
      if (assetToDelete.signedDocumentUrl) filesToClean.push(assetToDelete.signedDocumentUrl);
      filesToClean.forEach(path => {
        if (path && path.startsWith('/uploads/')) {
          deleteStoredFile(path);
        }
      });
    }
    const updatedAssets = db.assets.filter(a => a.id !== assetId);
    updateDatabase({ ...db, assets: updatedAssets });
  };

  // Document Modal Handlers
  const handleOpenDocumentModal = (asset?: Asset | null, log?: AssignmentLog | null) => {
    setDocModalAsset(asset || null);
    setDocModalLog(log || null);
    setIsDocumentModalOpen(true);
  };

  const handleSaveDocument = (fileData: { url: string; name: string; size: number }) => {
    const now = new Date().toISOString().slice(0, 10);
    let updatedAssets = [...db.assets];
    let updatedLogs = [...db.logs];

    if (docModalAsset) {
      const assetIdx = updatedAssets.findIndex(a => a.id === docModalAsset.id);
      if (assetIdx >= 0) {
        updatedAssets[assetIdx] = {
          ...updatedAssets[assetIdx],
          signedDocumentUrl: fileData.url,
          signedDocumentName: fileData.name,
          signedDocumentDate: now,
          signedDocumentSize: fileData.size,
        };
        if (selectedAssetForDetail?.id === docModalAsset.id) {
          setSelectedAssetForDetail(updatedAssets[assetIdx]);
        }
      }
    }

    if (docModalLog) {
      const logIdx = updatedLogs.findIndex(l => l.id === docModalLog.id);
      if (logIdx >= 0) {
        updatedLogs[logIdx] = {
          ...updatedLogs[logIdx],
          signedDocumentUrl: fileData.url,
          signedDocumentName: fileData.name,
          signedDocumentDate: now,
          signedDocumentSize: fileData.size,
        };
      }
    }

    updateDatabase({
      ...db,
      assets: updatedAssets,
      logs: updatedLogs,
    });
  };

  // Assignment (Checkout) Handlers
  const handleOpenCheckout = (asset?: Asset, person?: Person) => {
    setCheckoutAssetTarget(asset || null);
    setCheckoutPersonTarget(person || null);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutConfirm = (
    assetId: string,
    personId: string,
    handledBy: string,
    accessories: string[],
    notes: string,
    condition: 'new' | 'good' | 'fair' | 'damaged'
  ) => {
    const newDb = checkoutAsset(db, assetId, personId, handledBy, accessories, notes, condition);
    setDb(newDb);

    // Auto open the printable handover receipt
    const updatedAsset = newDb.assets.find(a => a.id === assetId);
    const latestLog = newDb.logs[0];
    if (updatedAsset) {
      setReceiptAsset(updatedAsset);
      setReceiptLog(latestLog || null);
      setIsReceiptOpen(true);
    }
  };

  // Return (Checkin) Handlers
  const handleOpenCheckin = (asset: Asset) => {
    setCheckinAssetTarget(asset);
    setIsCheckinOpen(true);
  };

  const handleCheckinConfirm = (
    assetId: string,
    targetBuildingId: string,
    locationDetail: string,
    handledBy: string,
    notes: string,
    condition: 'new' | 'good' | 'fair' | 'damaged',
    newStatus: 'in_stock' | 'maintenance' | 'scrapped'
  ) => {
    const newDb = checkinAsset(db, assetId, targetBuildingId, locationDetail, handledBy, notes, condition, newStatus);
    setDb(newDb);
  };

  // Person CRUD Handlers
  const handleSavePerson = (person: Person) => {
    const existingIndex = db.people.findIndex(p => p.id === person.id);
    let updatedPeople: Person[];
    if (existingIndex >= 0) {
      updatedPeople = [...db.people];
      updatedPeople[existingIndex] = person;
    } else {
      updatedPeople = [person, ...db.people];
    }
    updateDatabase({ ...db, people: updatedPeople });
  };

  const handleDeletePerson = (personId: string) => {
    const updatedPeople = db.people.filter(p => p.id !== personId);
    updateDatabase({ ...db, people: updatedPeople });
  };

  // Building CRUD Handlers
  const handleSaveBuilding = (building: Building) => {
    const existingIndex = db.buildings.findIndex(b => b.id === building.id);
    let updatedBuildings: Building[];
    if (existingIndex >= 0) {
      updatedBuildings = [...db.buildings];
      updatedBuildings[existingIndex] = building;
    } else {
      updatedBuildings = [...db.buildings, building];
    }
    updateDatabase({ ...db, buildings: updatedBuildings });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-200 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        db={db}
        onOpenNewAsset={() => {
          setAssetToEdit(null);
          setIsAssetFormOpen(true);
        }}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            db={db}
            onNavigateTab={setActiveTab}
            onOpenCheckout={(asset) => handleOpenCheckout(asset)}
            onViewDetails={(asset) => {
              setSelectedAssetForDetail(asset);
              setIsDetailOpen(true);
            }}
          />
        )}

        {activeTab === 'inventory' && (
          <AssetListView
            db={db}
            onOpenNewAsset={() => {
              setAssetToEdit(null);
              setIsAssetFormOpen(true);
            }}
            onEditAsset={(asset) => {
              setAssetToEdit(asset);
              setIsAssetFormOpen(true);
            }}
            onDeleteAsset={handleDeleteAsset}
            onCheckout={handleOpenCheckout}
            onCheckin={handleOpenCheckin}
            onViewReceipt={(asset) => {
              setReceiptAsset(asset);
              setReceiptLog(null);
              setIsReceiptOpen(true);
            }}
            onViewDetails={(asset) => {
              setSelectedAssetForDetail(asset);
              setIsDetailOpen(true);
            }}
            onOpenDocumentModal={(asset) => handleOpenDocumentModal(asset)}
          />
        )}

        {activeTab === 'network' && (
          <NetworkTopologyView
            db={db}
            onOpenNewAsset={() => {
              setAssetToEdit(null);
              setIsAssetFormOpen(true);
            }}
            onViewDetails={(asset) => {
              setSelectedAssetForDetail(asset);
              setIsDetailOpen(true);
            }}
            onEditAsset={(asset) => {
              setAssetToEdit(asset);
              setIsAssetFormOpen(true);
            }}
          />
        )}

        {activeTab === 'people' && (
          <PeopleView
            db={db}
            onOpenNewPerson={() => {
              setPersonToEdit(null);
              setIsPersonFormOpen(true);
            }}
            onEditPerson={(person) => {
              setPersonToEdit(person);
              setIsPersonFormOpen(true);
            }}
            onDeletePerson={handleDeletePerson}
            onCheckoutToPerson={(person) => handleOpenCheckout(undefined, person)}
            onViewReceipt={(asset) => {
              setReceiptAsset(asset);
              setReceiptLog(null);
              setIsReceiptOpen(true);
            }}
          />
        )}

        {activeTab === 'locations' && (
          <LocationsView
            db={db}
            onViewDetails={(asset) => {
              setSelectedAssetForDetail(asset);
              setIsDetailOpen(true);
            }}
            onOpenNewBuilding={() => setIsBuildingFormOpen(true)}
          />
        )}

        {activeTab === 'logs' && (
          <AssignmentLogsView
            db={db}
            onOpenCheckout={() => handleOpenCheckout()}
            onViewReceiptForLog={(log) => {
              setReceiptLog(log);
              setReceiptAsset(null);
              setIsReceiptOpen(true);
            }}
            onOpenDocumentForLog={(log) => {
              const matchedAsset = db.assets.find(ast => ast.id === log.assetId);
              handleOpenDocumentModal(matchedAsset || null, log);
            }}
          />
        )}

        {activeTab === 'media_vault' && (
          <MediaVaultView
            db={db}
            onOpenDocumentPreview={(docUrl) => {
              const matchedAsset = db.assets.find(a => a.signedDocumentUrl === docUrl);
              const matchedLog = db.logs.find(l => l.signedDocumentUrl === docUrl);
              handleOpenDocumentModal(matchedAsset || null, matchedLog || null);
            }}
          />
        )}

        {activeTab === 'vps_plan' && (
          <VpsSettingsView
            db={db}
            onDatabaseReload={(newDb) => setDb(newDb)}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#161616] border-t border-gray-800 py-4 px-6 text-center text-xs text-gray-400 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-gray-300">
            Kurumsal IT Envanter, Depo & Zimmet Yönetim Sistemi
          </span>
          <span className="text-[11px] text-gray-500">
            VPS Test Ortamı & Alan Adı Entegrasyonu Uyumlu • v2.0 Elegant Dark
          </span>
        </div>
      </footer>

      {/* MODALS */}
      <AssetFormModal
        isOpen={isAssetFormOpen}
        onClose={() => setIsAssetFormOpen(false)}
        onSave={handleSaveAsset}
        assetToEdit={assetToEdit}
        db={db}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onConfirm={handleCheckoutConfirm}
        db={db}
        initialAsset={checkoutAssetTarget}
        initialPerson={checkoutPersonTarget}
      />

      <CheckinModal
        isOpen={isCheckinOpen}
        onClose={() => setIsCheckinOpen(false)}
        onConfirm={handleCheckinConfirm}
        asset={checkinAssetTarget}
        db={db}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        asset={receiptAsset}
        log={receiptLog}
        db={db}
        onOpenDocumentUpload={(targetAsset, log) => handleOpenDocumentModal(targetAsset, log)}
      />

      <AssetDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        asset={selectedAssetForDetail}
        db={db}
        onEdit={(asset) => {
          setAssetToEdit(asset);
          setIsAssetFormOpen(true);
        }}
        onDelete={handleDeleteAsset}
        onCheckout={(asset) => handleOpenCheckout(asset)}
        onCheckin={(asset) => handleOpenCheckin(asset)}
        onViewReceipt={(asset) => {
          setReceiptAsset(asset);
          setReceiptLog(null);
          setIsReceiptOpen(true);
        }}
        onOpenDocumentModal={(asset) => handleOpenDocumentModal(asset)}
      />

      <PersonFormModal
        isOpen={isPersonFormOpen}
        onClose={() => setIsPersonFormOpen(false)}
        onSave={handleSavePerson}
        personToEdit={personToEdit}
        db={db}
      />

      <BuildingFormModal
        isOpen={isBuildingFormOpen}
        onClose={() => setIsBuildingFormOpen(false)}
        onSave={handleSaveBuilding}
        db={db}
      />

      <DocumentPreviewModal
        isOpen={isDocumentModalOpen}
        onClose={() => {
          setIsDocumentModalOpen(false);
          setDocModalAsset(null);
          setDocModalLog(null);
        }}
        asset={docModalAsset}
        log={docModalLog}
        onDocumentUploaded={handleSaveDocument}
      />
    </div>
  );
}

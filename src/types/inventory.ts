export type AssetCategory =
  | 'user_devices'
  | 'network_devices'
  | 'telephony'
  | 'software_licenses'
  | 'infrastructure';

export type AssetSubCategory =
  // User Devices
  | 'Laptop'
  | 'Masaüstü PC'
  | 'Monitör'
  | 'Tablet'
  | 'Yazıcı / Barkod'
  // Network
  | 'Switch'
  | 'Access Point'
  | 'PtP Yansıtıcı'
  | 'Router & Firewall'
  // Telephony
  | 'IP Telefon'
  | 'DECT Telefon'
  | 'Konferans Cihazı'
  | 'IP Santral'
  // Software
  | 'ERP / CRM'
  | 'İşletim Sistemi'
  | 'Güvenlik / Antivirüs'
  | 'Özel Yazılım'
  // Infrastructure
  | 'Sunucu'
  | 'Rack Kabin'
  | 'UPS Güç Kaynağı'
  | 'Kamera / NVR';

export type AssetStatus =
  | 'in_use'        // Zimmetli / Kullanımda
  | 'in_stock'      // Depoda / Kullanıma Hazır
  | 'maintenance'   // Bakımda / Arızalı
  | 'reserved'      // Rezerve
  | 'scrapped';     // Hurda / Düşüm

export interface AssetSpecs {
  // PC / Hardware specs
  cpu?: string;                // Örn: "Intel Core i7-13700H" / "Apple M3 Pro"
  ram?: string;                // Örn: "32 GB DDR5" / "16 GB Unified"
  storage?: string;            // Örn: "1 TB NVMe M.2 SSD"
  gpu?: string;                // Örn: "NVIDIA RTX 4060 8GB" / "Apple 18-Core GPU"
  screenSize?: string;         // Örn: '16.0" QHD IPS 165Hz'
  batteryHealth?: string;      // Örn: "%94 (86 Döngü)"
  os?: string;                 // Örn: "Windows 11 Pro" / "macOS Sonoma"
  
  // Network specs
  ipAddress?: string;          // Örn: "10.10.1.25"
  macAddress?: string;         // Örn: "00:1A:2B:3C:4D:5E"
  subnetMask?: string;         // Örn: "255.255.255.0"
  gateway?: string;            // Örn: "10.10.1.1"
  dns?: string;                // Örn: "10.10.1.2, 8.8.8.8"
  vlan?: string;               // Örn: "VLAN 20 (Personel Data)"
  ports?: number;              // Örn: 24, 48
  poeSupported?: boolean;      // PoE+ desteği
  wifiStandard?: string;       // Örn: "Wi-Fi 6E (802.11ax)"
  rackUnit?: string;           // Örn: "1U", "2U", "4U"
  powerWatt?: number;          // Güç tüketimi (Watt)

  // PtP (Point-to-Point) specs
  ptpFrequency?: string;       // Örn: "60 GHz (5 GHz Failover)"
  ptpDistanceKm?: number;      // Örn: 1.8
  ptpTargetBuildingId?: string;// Karşı hedef bina / kule
  ptpAzimuth?: string;         // Yön / Açı (örn: "42° Kuzeydoğu")
  ptpSignalRssi?: string;      // Sinyal gücü (örn: "-58 dBm")

  // Telephony specs
  extensionNumber?: string;    // Dahili No (örn: "1042")
  sipServer?: string;          // Örn: "sip.sirket.local"
  codec?: string;              // Örn: "G.711u / G.729"
  protocol?: string;           // Örn: "SIP / TLS"

  // Software / License specs
  licenseKey?: string;         // Lisans Anahtarı
  licenseType?: 'per_user' | 'per_device' | 'site_license';
  userLimit?: number;          // İzin verilen kullanıcı sayısı
  expireDate?: string;         // Son kullanma tarihi
  version?: string;            // Sürüm (örn: "v2024.2 Enterprise")
}

export interface Asset {
  id: string;
  assetTag: string;          // Demirbaş / Barkod Kodu (örn: "AST-2024-0104")
  objectCode?: string;       // Seri Nesne No / Nesne Kodu (örn: "NSN-2024-8921")
  serialNumber: string;       // Seri No (örn: "PF3J9K81")
  name: string;              // Model / Tanım
  category: AssetCategory;
  subCategory: AssetSubCategory;
  brand: string;             // Marka (Cisco, Dell, Ubiquiti, Mikrotik vb.)
  model: string;             // Model Kodu
  cityId: string;            // Bulunduğu Şehir
  buildingId: string;        // Bulunduğu Bina / Tesis
  locationDetail: string;    // Detay: "Kat 2 Sistem Odası Kabin 3 - U14"
  isLocal: boolean;          // Yerel (On-premise / Merkez) mi?
  status: AssetStatus;
  assignedToPersonId?: string;
  assignedDate?: string;
  purchaseDate?: string;
  warrantyEndDate?: string;
  supplier?: string;
  cost?: number;
  currency?: 'TRY' | 'USD' | 'EUR';
  specs?: AssetSpecs;
  images?: string[];         // Ayrı klasördeki dosya referans yolları (örn: ["/uploads/assets/dell-xps-1.webp"])
  primaryImage?: string;     // Kapak fotoğrafı yolu
  signedDocumentUrl?: string;// İmzalı evrak yolu referansı
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface City {
  id: string;
  name: string;              // Örn: "İstanbul"
  code: string;              // Örn: "IST"
  region: string;            // Örn: "Marmara"
  isHeadquarter: boolean;
  notes?: string;
}

export interface Building {
  id: string;
  cityId: string;
  name: string;              // Örn: "Genel Merkez A Blok"
  address: string;
  campusName: string;
  floors: string[];          // Örn: ["Bodrum", "Zemin", "Kat 1", "Kat 2", "Çatı"]
  hasServerRoom: boolean;
  rackCount: number;
  isLocalNetwork: boolean;   // Ana yerel ağa direkt bağlı mı
  notes?: string;
}

export interface Department {
  id: string;
  name: string;              // Örn: "Bilgi Teknolojileri"
  code: string;              // Örn: "IT"
  managerName: string;
}

export interface Division {
  id: string;
  departmentId: string;
  name: string;              // Örn: "Ağ ve Siber Güvenlik"
  code: string;              // Örn: "NET-SEC"
}

export interface Person {
  id: string;
  fullName: string;
  employeeId: string;        // Sicil No (örn: "PER-1049")
  email: string;
  phone: string;
  extension: string;         // Dahili hat no (örn: "2104")
  title: string;             // Görev unvanı (örn: "Kıdemli Ağ Mühendisi")
  departmentId: string;
  divisionId: string;
  cityId: string;
  buildingId: string;
  roomDetail?: string;       // Örn: "Kat 3 - Yazılım Ofisi Masa 12"
  status: 'active' | 'on_leave' | 'resigned';
  notes?: string;
  createdAt: string;
}

export interface AssignmentLog {
  id: string;
  documentNumber: string;    // Tutanak / Fiş No (örn: "ZMT-2024-0042")
  assetId: string;
  assetTag: string;
  objectCode?: string;       // Seri Nesne No
  assetName: string;
  personId?: string;
  personName?: string;
  departmentName?: string;
  actionType: 'checkout' | 'checkin' | 'maintenance' | 'scrap';
  date: string;
  handledBy: string;         // İşlemi yapan IT personeli
  condition: 'new' | 'good' | 'fair' | 'damaged';
  accessoriesIncluded: string[]; // ["Şarj Cihazı", "Taşıma Çantası", "Kablo"]
  notes?: string;
  signedDocumentUrl?: string;   // Ayrı klasördeki imzalı evrak yolu (örn: "/uploads/documents/zmt-2024-0042_imzali.pdf")
  signedDocumentName?: string;  // Orijinal dosya adı (örn: "ZMT-2024-0042_Islak_Imzali.pdf")
  signedDocumentDate?: string;  // Yükleme tarihi
  signedDocumentSize?: number;  // Dosya boyutu (byte)
}

export interface StoredMediaFile {
  path: string;              // Sanal klasör yolu: "/uploads/assets/..." veya "/uploads/documents/..."
  name: string;              // Dosya adı
  size: number;              // Boyut (bytes)
  type: string;              // MIME type (örn: "image/webp", "application/pdf")
  folder: 'assets' | 'documents';
  uploadedAt: string;
  dataUrl?: string;          // Yalnızca önizleme için çalışma zamanı Blob URL'i
}

export interface InventoryDatabase {
  cities: City[];
  buildings: Building[];
  departments: Department[];
  divisions: Division[];
  people: Person[];
  assets: Asset[];
  logs: AssignmentLog[];
  lastUpdated: string;
}

export type NavigationTab = 
  | 'dashboard' 
  | 'inventory' 
  | 'network' 
  | 'people' 
  | 'locations' 
  | 'logs' 
  | 'media_vault'
  | 'vps_plan';


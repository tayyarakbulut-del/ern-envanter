import React, { useState } from 'react';
import { 
  Server, 
  HardDriveDownload, 
  Upload, 
  RotateCcw, 
  Check, 
  Copy, 
  Terminal, 
  Globe, 
  ShieldCheck, 
  FileCode,
  FileDown,
  AlertTriangle,
  FolderCog,
  Layers,
  ExternalLink,
  Cpu,
  Lock,
  Sparkles
} from 'lucide-react';
import { InventoryDatabase } from '../types/inventory';
import { exportDatabaseJSON, importDatabaseJSON, resetDatabase } from '../services/storage';

interface VpsSettingsViewProps {
  db: InventoryDatabase;
  onDatabaseReload: (newDb: InventoryDatabase) => void;
}

export const VpsSettingsView: React.FC<VpsSettingsViewProps> = ({
  db,
  onDatabaseReload,
}) => {
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [aaPanelDeployMode, setAaPanelDeployMode] = useState<'static_subfolder' | 'static_root' | 'nodejs_proxy'>('static_subfolder');

  const domain = 'ernsaha.com.tr';
  const filePath = '/www/wwwroot/ernsaha.com.tr/ern-envanter';

  const handleExport = () => {
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `it-envanter-yedek-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMessage({ type: 'success', text: 'Envanter yedeği JSON dosyası olarak bilgisayarınıza indirildi.' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const res = importDatabaseJSON(content);
      if (res.success && res.db) {
        onDatabaseReload(res.db);
        setStatusMessage({ type: 'success', text: 'Dosyadan envanter yedeği başarıyla yüklendi.' });
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Tüm verileri varsayılan örnek şablona geri döndürmek istediğinize emin misiniz?')) {
      const resetDb = resetDatabase();
      onDatabaseReload(resetDb);
      setStatusMessage({ type: 'success', text: 'Veritabanı varsayılan örnek verilere sıfırlandı.' });
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Nginx Config 1: Subfolder (/ern-envanter)
  const nginxSubfolderConfig = `# aaPanel > Website > ernsaha.com.tr > Configuration (Nginx)
# server { ... } bloğunun içine ekleyin:

location ^~ /ern-envanter {
    alias /www/wwwroot/ernsaha.com.tr/ern-envanter/;
    index index.html index.htm;
    try_files $uri $uri/ /ern-envanter/index.html;

    # Statik varlıklar için önbellekleme
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}`;

  // Nginx Config 2: Root Directory Rewrite
  const nginxRootRewrite = `# aaPanel > Website > ernsaha.com.tr > URL rewrite sekmesine yapıştırın:

location / {
    try_files $uri $uri/ /index.html;
}`;

  // aaPanel Node.js Reverse Proxy Config
  const aaPanelReverseProxyConfig = `# aaPanel > Website > ernsaha.com.tr > Reverse Proxy > Add reverse proxy
# Proxy Name: it-envanter
# Target URL: http://127.0.0.1:3000
# Sent Domain: $host

location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header REMOTE-HOST $remote_addr;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    add_header X-Cache $upstream_cache_status;
}`;

  const permissionCommand = `chown -R www:www ${filePath} && chmod -R 755 ${filePath}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#161616] p-5 rounded-2xl border border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-950/80 text-blue-400 border border-blue-800/40 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              aaPanel & Domain Entegrasyonu
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
              {domain}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 mt-1">
            <Server className="h-5 w-5 text-blue-500" />
            aaPanel VPS Kurulumu & Canlıya Alma Rehberi
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Hedef Dizin: <span className="font-mono text-gray-200 bg-[#242424] px-1.5 py-0.5 rounded border border-gray-700">{filePath}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <HardDriveDownload className="h-4 w-4" />
            <span>Envanter JSON Yedek Al</span>
          </button>
        </div>
      </div>

      {/* Alert / Status Message */}
      {statusMessage && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' 
            : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
        }`}>
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-gray-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* AAPANEL SPECIALIZED CONFIGURATION CARD */}
      <div className="bg-[#161616] rounded-2xl p-6 border border-blue-900/40 shadow-xl space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
          <div>
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              aaPanel Nginx & Dizin Yapılandırması
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              {domain} için Kurulum Metodu Seçin
            </h3>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-[#0F0F0F] rounded-xl border border-gray-800 text-xs font-medium self-start sm:self-auto">
            <button
              onClick={() => setAaPanelDeployMode('static_subfolder')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                aaPanelDeployMode === 'static_subfolder'
                  ? 'bg-blue-600 text-white font-bold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              1. Alt Klasör (/ern-envanter)
            </button>
            <button
              onClick={() => setAaPanelDeployMode('static_root')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                aaPanelDeployMode === 'static_root'
                  ? 'bg-blue-600 text-white font-bold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              2. Kök Dizin (Site Başı)
            </button>
            <button
              onClick={() => setAaPanelDeployMode('nodejs_proxy')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                aaPanelDeployMode === 'nodejs_proxy'
                  ? 'bg-blue-600 text-white font-bold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              3. Node.js Manager (Port 3000)
            </button>
          </div>
        </div>

        {/* MODE 1: Alt Klasör (/ern-envanter) - ÖNERİLEN */}
        {aaPanelDeployMode === 'static_subfolder' && (
          <div className="space-y-4 text-xs">
            <div className="bg-blue-950/30 border border-blue-800/40 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
                <FolderCog className="h-4 w-4" />
                <span>Nasıl Çalışır? (URL: https://{domain}/ern-envanter)</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Mevcut <strong className="text-white">{domain}</strong> web siteniz ana dizinde çalışmaya devam ederken, envanter yazılımınız doğrudan <strong className="text-blue-300">{filePath}</strong> klasöründen sunulur. <code className="text-emerald-400 font-mono">base: './'</code> desteği projeye eklenmiştir, dolayısıyla tüm stiller ve scriptler hatasız yüklenir.
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-950 text-blue-400 border border-blue-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</div>
                <div>
                  <h4 className="font-bold text-white">Projeyi Derleyin (Build)</h4>
                  <p className="text-gray-400 mt-0.5">Bilgisayarınızda veya sunucu terminalinde <code className="bg-[#242424] text-emerald-400 px-1.5 py-0.5 rounded font-mono border border-gray-700">npm run build</code> komutunu çalıştırın. Çıktı olarak oluşan <strong className="text-white">dist</strong> klasörü hazır olacaktır.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-950 text-blue-400 border border-blue-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</div>
                <div>
                  <h4 className="font-bold text-white">aaPanel Dosya Yöneticisi ile Yükleyin</h4>
                  <p className="text-gray-400 mt-0.5">
                    aaPanel &gt; <strong>Files</strong> menüsünden <code className="bg-[#242424] text-gray-200 px-1.5 py-0.5 rounded font-mono border border-gray-700">{filePath}</code> dizinine gidin. <strong className="text-white">dist</strong> klasörünün içindeki tüm dosyaları (index.html, assets klasörü vb.) buraya yükleyin ve zip'ten çıkarın.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-950 text-blue-400 border border-blue-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</div>
                <div className="w-full space-y-2">
                  <h4 className="font-bold text-white">aaPanel Nginx Yapılandırmasına Kuralı Ekleyin</h4>
                  <p className="text-gray-400">
                    aaPanel &gt; <strong>Website</strong> &gt; <strong className="text-white">{domain}</strong> &gt; <strong>Configuration (Nginx Ayarları)</strong> sekmesini açın ve aşağıdaki bloğu <code className="text-blue-300">server &#123; ... &#125;</code> içine yapıştırıp kaydedin:
                  </p>
                  <div className="bg-[#0A0A0A] text-emerald-400 p-3.5 rounded-xl font-mono text-[11px] relative border border-gray-800">
                    <pre className="overflow-x-auto whitespace-pre">{nginxSubfolderConfig}</pre>
                    <button
                      onClick={() => copyToClipboard(nginxSubfolderConfig, 'nginx_subfolder')}
                      className="absolute top-2.5 right-2.5 p-1.5 text-gray-400 hover:text-white bg-[#242424] border border-gray-700 rounded cursor-pointer"
                      title="Kopyala"
                    >
                      {copiedCode === 'nginx_subfolder' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-950 text-blue-400 border border-blue-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">4</div>
                <div className="w-full space-y-1">
                  <h4 className="font-bold text-white">Dosya İzinlerini Verin (Terminal veya aaPanel)</h4>
                  <p className="text-gray-400">Nginx web sunucusunun (www kullanıcısı) dosyaları okuyabilmesi için terminalden uygulayın:</p>
                  <div className="bg-[#0A0A0A] text-emerald-400 p-2.5 rounded-xl font-mono text-[11px] relative border border-gray-800">
                    <code>{permissionCommand}</code>
                    <button
                      onClick={() => copyToClipboard(permissionCommand, 'perm1')}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white bg-[#242424] border border-gray-700 rounded cursor-pointer"
                    >
                      {copiedCode === 'perm1' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: Kök Dizin Olarak Çalıştırma */}
        {aaPanelDeployMode === 'static_root' && (
          <div className="space-y-4 text-xs">
            <div className="bg-blue-950/30 border border-blue-800/40 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
                <Globe className="h-4 w-4" />
                <span>Nasıl Çalışır? (URL: https://{domain}/)</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Eğer <strong className="text-white">{domain}</strong> adresini açtığınızda doğrudan bu IT Envanter sisteminin açılmasını istiyorsanız, aaPanel üzerinde site dizinini <strong className="text-blue-300">{filePath}</strong> olarak seçip URL Rewrite kuralını eklemeniz yeterlidir.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-950 text-blue-400 border border-blue-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</div>
                <div>
                  <h4 className="font-bold text-white">aaPanel Site Dizinini Ayarlayın</h4>
                  <p className="text-gray-400 mt-0.5">
                    aaPanel &gt; <strong>Website</strong> &gt; <strong>{domain}</strong> &gt; <strong>Site directory</strong> sekmesine girin. Site directory yolunu <code className="bg-[#242424] text-white px-1.5 py-0.5 rounded font-mono border border-gray-700">{filePath}</code> olarak seçin ve kaydedin.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-blue-950 text-blue-400 border border-blue-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</div>
                <div className="w-full space-y-2">
                  <h4 className="font-bold text-white">URL Rewrite (Yeniden Yazma) Kuralı</h4>
                  <p className="text-gray-400">
                    aaPanel &gt; <strong>Website</strong> &gt; <strong>{domain}</strong> &gt; <strong>URL rewrite</strong> sekmesini açın ve aşağıdaki kuralı yapıştırıp Save deyin:
                  </p>
                  <div className="bg-[#0A0A0A] text-emerald-400 p-3.5 rounded-xl font-mono text-[11px] relative border border-gray-800">
                    <pre className="overflow-x-auto whitespace-pre">{nginxRootRewrite}</pre>
                    <button
                      onClick={() => copyToClipboard(nginxRootRewrite, 'nginx_root')}
                      className="absolute top-2.5 right-2.5 p-1.5 text-gray-400 hover:text-white bg-[#242424] border border-gray-700 rounded cursor-pointer"
                    >
                      {copiedCode === 'nginx_root' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE 3: Node.js Project Manager */}
        {aaPanelDeployMode === 'nodejs_proxy' && (
          <div className="space-y-4 text-xs">
            <div className="bg-purple-950/30 border border-purple-800/40 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                <Cpu className="h-4 w-4" />
                <span>aaPanel Node.js Project Manager ile Yönetim</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                aaPanel App Store içinde yer alan <strong className="text-white">Node.js Project Manager</strong> eklentisi ile sunucuda Node.js arka plan servisini (Vite preview veya Node server) çalıştırabilir ve Reverse Proxy ile <strong className="text-white">{domain}</strong> alan adına yönlendirebilirsiniz.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-purple-950 text-purple-400 border border-purple-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</div>
                <div>
                  <h4 className="font-bold text-white">aaPanel &gt; Node.js Project Manager'ı Açın</h4>
                  <p className="text-gray-400 mt-0.5">
                    aaPanel App Store'dan <strong>Node.js project manager</strong> eklentisini kurun. <strong>Node.js Version Manager</strong> sekmesinden Node v20+ sürümünü seçin.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-purple-950 text-purple-400 border border-purple-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</div>
                <div>
                  <h4 className="font-bold text-white">Proje Ekle (Add Project)</h4>
                  <ul className="text-gray-400 space-y-1 list-disc pl-4 mt-1">
                    <li><strong>Path:</strong> <code className="text-gray-200 font-mono">{filePath}</code></li>
                    <li><strong>Name:</strong> <code className="text-gray-200 font-mono">it-envanter</code></li>
                    <li><strong>Run Opt:</strong> <code className="text-emerald-400 font-mono">preview</code> veya <code className="text-emerald-400 font-mono">start</code></li>
                    <li><strong>Port:</strong> <code className="text-gray-200 font-mono">3000</code></li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-purple-950 text-purple-400 border border-purple-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</div>
                <div className="w-full space-y-2">
                  <h4 className="font-bold text-white">Reverse Proxy (Ters Vekil) Ayarı</h4>
                  <p className="text-gray-400">
                    aaPanel &gt; <strong>Website</strong> &gt; <strong>{domain}</strong> &gt; <strong>Reverse proxy</strong> &gt; <strong>Add reverse proxy</strong> sekmesine girin. Hedef URL olarak <code className="text-emerald-400 font-mono">http://127.0.0.1:3000</code> girip kaydedin.
                  </p>
                  <div className="bg-[#0A0A0A] text-emerald-400 p-3.5 rounded-xl font-mono text-[11px] relative border border-gray-800">
                    <pre className="overflow-x-auto whitespace-pre">{aaPanelReverseProxyConfig}</pre>
                    <button
                      onClick={() => copyToClipboard(aaPanelReverseProxyConfig, 'reverse_proxy')}
                      className="absolute top-2.5 right-2.5 p-1.5 text-gray-400 hover:text-white bg-[#242424] border border-gray-700 rounded cursor-pointer"
                    >
                      {copiedCode === 'reverse_proxy' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SSL Notice */}
        <div className="bg-[#121212] border border-gray-800 p-4 rounded-xl flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-white">aaPanel Tek Tıkla Ücretsiz Let's Encrypt SSL (HTTPS)</h4>
            <p className="text-gray-400 leading-relaxed">
              aaPanel &gt; <strong>Website</strong> &gt; <strong className="text-white">{domain}</strong> &gt; <strong>SSL</strong> sekmesine gelin. <strong>Let's Encrypt</strong> seçeneğini işaretleyip alan adınızı seçin ve <strong className="text-emerald-400">Apply</strong> butonuna tıklayın. Ardından <strong>Force HTTPS</strong> düğmesini aktif ederek tüm bağlantıları otomatik güvenli bağlantıya zorlayın.
            </p>
          </div>
        </div>
      </div>

      {/* Data Backup & Restore Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Export JSON Card */}
        <div className="bg-[#161616] p-5 rounded-2xl border border-gray-800 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-xl bg-blue-950/60 text-blue-400 border border-blue-800/40 flex items-center justify-center mb-3">
              <FileDown className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Envanter Yedeği İndir (JSON)</h3>
            <p className="text-xs text-gray-400 mt-1">
              Mevcut tüm şehirler, binalar, personeller, switchler, PtP yansıtıcılar, IP telefonlar ve zimmet loglarını tam yedek olarak indirin.
            </p>
          </div>

          <button
            onClick={handleExport}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs shadow-sm transition-colors cursor-pointer"
          >
            <HardDriveDownload className="h-4 w-4" />
            <span>Yedek Dosyasını İndir (.json)</span>
          </button>
        </div>

        {/* Import JSON Card */}
        <div className="bg-[#161616] p-5 rounded-2xl border border-gray-800 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center justify-center mb-3">
              <Upload className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Yedekten Geri Yükle</h3>
            <p className="text-xs text-gray-400 mt-1">
              Bilgisayarınızdaki veya VPS'inizdeki .json yedek dosyasını seçerek tüm verileri sisteme geri yükleyin.
            </p>
          </div>

          <label className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-sm transition-colors cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>JSON Dosyası Seç & Yükle</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Reset Defaults Card */}
        <div className="bg-[#161616] p-5 rounded-2xl border border-gray-800 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800/40 flex items-center justify-center mb-3">
              <RotateCcw className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Örnek Veritabanına Sıfırla</h3>
            <p className="text-xs text-gray-400 mt-1">
              Test ortamınızı sıfırlamak isterseniz, hazır İstanbul, Ankara, İzmir lokasyonları ve örnek ağ donanımı şablonuna geri dönebilirsiniz.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#242424] hover:bg-rose-950/40 hover:text-rose-400 text-gray-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer border border-gray-700"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Varsayılan Şablona Sıfırla</span>
          </button>
        </div>
      </div>
    </div>
  );
};

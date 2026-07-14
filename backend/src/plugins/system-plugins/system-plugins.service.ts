import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemPlugin } from './entities/system-plugin.entity';

@Injectable()
export class SystemPluginsService implements OnModuleInit {
  private activePluginsCache = new Set<string>();

  constructor(
    @InjectRepository(SystemPlugin)
    private readonly pluginRepo: Repository<SystemPlugin>,
  ) {}

  async onModuleInit() {
    const defaultPlugins = [
      { identifier: 'current-accounts', name: 'Cari Hesap Yönetimi', description: 'Bağışçı, Müşteri ve Personel Cari Kayıtları', isCore: true, isActive: true },
      { identifier: 'wallets', name: 'Kasa Yönetimi', description: 'Nakit, Banka ve Döviz Kasaları İşlemleri', isCore: true, isActive: true },
      { identifier: 'sacrifices', name: 'Kurban Organizasyonu', description: 'Kurban bağışları ve organizasyon süreçleri', isCore: false, isActive: false },
      { identifier: 'personnel', name: 'Personel Yönetimi', description: 'Personel Maaş, Avans ve İzin Yönetimi', isCore: false, isActive: false },
      { identifier: 'scholarships', name: 'Burs Yönetimi', description: 'Öğrenci Burs Tahakkuk ve Ödemeleri', isCore: false, isActive: false },
      { identifier: 'assets', name: 'Demirbaş Yönetimi', description: 'Vakıf Demirbaş ve Zimmet Takibi', isCore: false, isActive: false },
      { identifier: 'lodgings', name: 'Lojman Yönetimi', description: 'Lojman ve Kira Takip Sistemi', isCore: false, isActive: false },
      { identifier: 'warehouses', name: 'Depo Yönetimi', description: 'Ayni Yardım ve Stok Depoları', isCore: false, isActive: false },
      { identifier: 'stock', name: 'Ayni Yardım (Stok)', description: 'Stok Hareketleri ve Yardım Dağıtımı', isCore: false, isActive: false },
      { identifier: 'tasks', name: 'Görev Yönetimi', description: 'Görevler, masraflar ve avans tahsisleri.', isCore: false, isActive: true },
      { identifier: 'projects', name: 'Proje Yönetimi', description: 'Bağış projeleri, kampanyalar ve bütçeler.', isCore: false, isActive: true },
      { identifier: 'publications', name: 'Yayın Yönetimi', description: 'Dergi abonelikleri, hediye kitaplar ve POS.', isCore: false, isActive: true },
      { identifier: 'soup-kitchen', name: 'Aşevi ve Yemek Dağıtım', description: 'Günlük menü ve yemek dağıtım kayıtları.', isCore: false, isActive: true },
      { identifier: 'households', name: 'Aile, Yetim ve Yardım', description: 'İhtiyaç havuzu, aile ve yetim kayıtları.', isCore: false, isActive: true },
      { identifier: 'accommodations', name: 'Misafirhane Yönetimi', description: 'Konaklama ve rezervasyon işlemleri.', isCore: false, isActive: true },
      { identifier: 'cost-centers', name: 'Masraf Merkezleri', description: 'Şube ve departman bazlı maliyet yönetimi.', isCore: false, isActive: true },
      { identifier: 'events', name: 'Etkinlik ve Ajanda', description: 'Vakıf etkinlikleri ve takvim yönetimi.', isCore: false, isActive: true },
      { identifier: 'sponsorships', name: 'Sponsorluk ve Düzenli Bağış', description: 'Hafızlık, eğitim ve düzenli bağış takibi.', isCore: false, isActive: true },
      { identifier: 'vehicles', name: 'Araç ve Filo Yönetimi', description: 'Araç zimmet, bakım ve yakıt takibi.', isCore: false, isActive: true },
    ];

    for (const p of defaultPlugins) {
      const exists = await this.pluginRepo.findOneBy({ identifier: p.identifier });
      if (!exists) {
        await this.pluginRepo.save(this.pluginRepo.create(p));
      } else if (exists.isCore !== p.isCore) {
        exists.isCore = p.isCore;
        if (p.isCore) exists.isActive = true; // Core plugins must be active
        await this.pluginRepo.save(exists);
      }
    }

    await this.refreshCache();
  }

  async refreshCache() {
    const activePlugins = await this.pluginRepo.find({ where: { isActive: true } });
    this.activePluginsCache.clear();
    activePlugins.forEach(p => this.activePluginsCache.add(p.identifier));
  }

  isPluginActive(identifier: string): boolean {
    return this.activePluginsCache.has(identifier);
  }

  findAll() {
    return this.pluginRepo.find({ order: { name: 'ASC' } });
  }

  async toggleStatus(id: number, isActive: boolean) {
    const plugin = await this.pluginRepo.findOneBy({ id });
    if (!plugin) throw new Error('Eklenti bulunamadı');
    if (plugin.isCore) throw new Error('Çekirdek (Core) eklentiler kapatılamaz!');
    
    plugin.isActive = isActive;
    const saved = await this.pluginRepo.save(plugin);
    await this.refreshCache();
    return saved;
  }
}

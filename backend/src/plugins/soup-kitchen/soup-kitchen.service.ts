import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SoupKitchenMenu } from './entities/soup-kitchen-menu.entity';
import { SoupKitchenDistribution } from './entities/soup-kitchen-distribution.entity';
import { CreateMenuDto, UpdateMenuDto, CreateDistributionDto, UpdateDistributionDto } from './dto/soup-kitchen.dto';

@Injectable()
export class SoupKitchenService {
  constructor(
    @InjectRepository(SoupKitchenMenu)
    private readonly menuRepo: Repository<SoupKitchenMenu>,
    @InjectRepository(SoupKitchenDistribution)
    private readonly distRepo: Repository<SoupKitchenDistribution>,
  ) {}

  // --- MENU ---
  async createMenu(dto: CreateMenuDto): Promise<SoupKitchenMenu> {
    const menu = this.menuRepo.create(dto);
    return await this.menuRepo.save(menu);
  }

  async findAllMenus(): Promise<SoupKitchenMenu[]> {
    return await this.menuRepo.find({ order: { date: 'DESC' } });
  }

  async findMenu(id: number): Promise<SoupKitchenMenu> {
    const menu = await this.menuRepo.findOne({
      where: { id },
      relations: { distributions: { household: true } }
    });
    if (!menu) throw new NotFoundException('Menü bulunamadı');
    return menu;
  }

  async updateMenu(id: number, dto: UpdateMenuDto): Promise<SoupKitchenMenu> {
    const menu = await this.findMenu(id);
    Object.assign(menu, dto);
    return await this.menuRepo.save(menu);
  }

  async removeMenu(id: number): Promise<void> {
    const menu = await this.findMenu(id);
    await this.menuRepo.remove(menu);
  }

  // --- DISTRIBUTION ---
  async addDistribution(dto: CreateDistributionDto): Promise<SoupKitchenDistribution> {
    const menu = await this.findMenu(dto.menuId);
    
    const dist = this.distRepo.create(dto);
    const saved = await this.distRepo.save(dist);

    // Update distributed portions
    menu.distributedPortions += dto.portionCount;
    await this.menuRepo.save(menu);

    return await this.distRepo.findOne({ where: { id: saved.id }, relations: { household: true } }) as SoupKitchenDistribution;
  }

  async updateDistribution(id: number, dto: UpdateDistributionDto): Promise<SoupKitchenDistribution> {
    const dist = await this.distRepo.findOne({ where: { id }, relations: { menu: true } });
    if (!dist) throw new NotFoundException('Dağıtım kaydı bulunamadı');

    const oldPortionCount = dist.portionCount;
    Object.assign(dist, dto);
    const newPortionCount = dist.portionCount;

    const saved = await this.distRepo.save(dist);

    if (oldPortionCount !== newPortionCount && dist.menu) {
      dist.menu.distributedPortions += (newPortionCount - oldPortionCount);
      await this.menuRepo.save(dist.menu);
    }

    return saved;
  }

  async removeDistribution(id: number): Promise<void> {
    const dist = await this.distRepo.findOne({ where: { id }, relations: { menu: true } });
    if (!dist) throw new NotFoundException('Dağıtım kaydı bulunamadı');

    const menu = dist.menu;
    const portionCount = dist.portionCount;

    await this.distRepo.remove(dist);

    if (menu) {
      menu.distributedPortions -= portionCount;
      if (menu.distributedPortions < 0) menu.distributedPortions = 0;
      await this.menuRepo.save(menu);
    }
  }
}

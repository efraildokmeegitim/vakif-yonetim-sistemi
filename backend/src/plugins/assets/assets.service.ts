import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Asset } from './entities/asset.entity';
import { AssetCategory } from './entities/asset-category.entity';
import { AssetAssignment } from './entities/asset-assignment.entity';
import { AssetMaintenance } from './entities/asset-maintenance.entity';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepo: Repository<Asset>,
    @InjectRepository(AssetCategory)
    private readonly categoryRepo: Repository<AssetCategory>,
    @InjectRepository(AssetAssignment)
    private readonly assignmentRepo: Repository<AssetAssignment>,
    @InjectRepository(AssetMaintenance)
    private readonly maintenanceRepo: Repository<AssetMaintenance>,
    private dataSource: DataSource
  ) {}

  // -- Kategori İşlemleri --
  getCategories() {
    return this.categoryRepo.find({ order: { name: 'ASC' } });
  }

  createCategory(name: string) {
    return this.categoryRepo.save({ name });
  }

  deleteCategory(id: number) {
    return this.categoryRepo.delete(id);
  }

  // -- Demirbaş İşlemleri --
  findAll() {
    return this.assetRepo.find({ order: { id: 'DESC' } });
  }

  findOne(id: number) {
    return this.assetRepo.findOneBy({ id });
  }

  async create(createDto: any) {
    // transaction is simulated or skipped here for simplicity unless fully required
    // In a real app we'd also hit wallet transactions if purchase_price > 0 and wallet_id present
    const asset = this.assetRepo.create(createDto) as any;
    if (!asset.stockQuantity) {
      asset.stockQuantity = asset.totalQuantity || 1;
    }
    return this.assetRepo.save(asset);
  }

  async update(id: number, updateDto: any) {
    await this.assetRepo.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const assignments = await this.assignmentRepo.count({ where: { assetId: id } });
    if (assignments > 0) {
      throw new BadRequestException('Zimmet geçmişi olan bir demirbaş silinemez. Durumunu "Hurda" olarak güncelleyebilirsiniz.');
    }
    return this.assetRepo.delete(id);
  }

  // -- Zimmet İşlemleri --
  async getAssignments(assetId: number) {
    return this.assignmentRepo.find({ where: { assetId }, order: { assignmentDate: 'DESC' } });
  }

  async assignAsset(assetId: number, assignDto: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const asset = await queryRunner.manager.findOne(Asset, { where: { id: assetId } });
      const qty = parseInt(assignDto.quantity || '1', 10);

      if (!asset || asset.stockQuantity < qty) {
        throw new BadRequestException('Stokta yeterli demirbaş yok.');
      }

      asset.stockQuantity -= qty;
      asset.status = 'Zimmetli';
      await queryRunner.manager.save(asset);

      const assignment = queryRunner.manager.create(AssetAssignment, {
        assetId,
        personnelCaId: assignDto.personnelCaId,
        assignmentDate: assignDto.assignmentDate,
        notes: assignDto.notes,
        quantity: qty,
        status: 'Zimmetli'
      });
      await queryRunner.manager.save(assignment);

      await queryRunner.commitTransaction();
      return assignment;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async returnAsset(assignmentId: number, returnDate: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const assignment = await queryRunner.manager.findOne(AssetAssignment, { where: { id: assignmentId } });
      if (!assignment) throw new BadRequestException('Zimmet bulunamadı.');

      const asset = await queryRunner.manager.findOne(Asset, { where: { id: assignment.assetId } });
      if (!asset) throw new BadRequestException('Demirbaş bulunamadı.');

      asset.stockQuantity += assignment.quantity;
      if (asset.stockQuantity >= asset.totalQuantity) {
        asset.status = 'Stokta';
      }
      await queryRunner.manager.save(asset);

      assignment.status = 'İade Edildi';
      assignment.returnDate = returnDate;
      await queryRunner.manager.save(assignment);

      await queryRunner.commitTransaction();
      return assignment;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // -- Bakım İşlemleri --
  async getMaintenanceRecords(assetId: number) {
    return this.maintenanceRepo.find({ where: { assetId }, order: { maintenanceDate: 'DESC' } });
  }

  async addMaintenance(assetId: number, data: any) {
    const maintenance = this.maintenanceRepo.create({
      assetId,
      ...data
    });
    return this.maintenanceRepo.save(maintenance);
  }

  async deleteMaintenance(id: number) {
    return this.maintenanceRepo.delete(id);
  }
}

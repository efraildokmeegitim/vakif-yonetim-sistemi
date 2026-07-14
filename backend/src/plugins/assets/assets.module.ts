import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { Asset } from './entities/asset.entity';
import { AssetCategory } from './entities/asset-category.entity';
import { AssetAssignment } from './entities/asset-assignment.entity';
import { AssetMaintenance } from './entities/asset-maintenance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Asset, AssetCategory, AssetAssignment, AssetMaintenance])],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}

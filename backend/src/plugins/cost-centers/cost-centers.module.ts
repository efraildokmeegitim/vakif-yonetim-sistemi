import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostCentersService } from './cost-centers.service';
import { CostCentersController } from './cost-centers.controller';
import { CostCenter } from './entities/cost-center.entity';
import { SystemPluginsModule } from '../system-plugins/system-plugins.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CostCenter]),
    SystemPluginsModule,
  ],
  controllers: [CostCentersController],
  providers: [CostCentersService],
  exports: [CostCentersService],
})
export class CostCentersModule {}

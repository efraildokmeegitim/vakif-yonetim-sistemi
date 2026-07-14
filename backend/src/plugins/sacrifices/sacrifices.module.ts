import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrentAccount } from '../current-accounts/entities/current-account.entity';
import { SacrificesService } from './sacrifices.service';
import { SacrificesController } from './sacrifices.controller';
import { SacrificeCampaign } from './entities/sacrifice-campaign.entity';
import { SacrificeGroup } from './entities/sacrifice-group.entity';
import { SacrificeShare } from './entities/sacrifice-share.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SacrificeCampaign, SacrificeGroup, SacrificeShare, CurrentAccount])],
  controllers: [SacrificesController],
  providers: [SacrificesService],
})
export class SacrificesModule {}

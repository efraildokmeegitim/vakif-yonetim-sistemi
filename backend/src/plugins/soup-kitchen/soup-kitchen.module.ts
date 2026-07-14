import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SoupKitchenController } from './soup-kitchen.controller';
import { SoupKitchenService } from './soup-kitchen.service';
import { SoupKitchenMenu } from './entities/soup-kitchen-menu.entity';
import { SoupKitchenDistribution } from './entities/soup-kitchen-distribution.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SoupKitchenMenu, SoupKitchenDistribution])],
  controllers: [SoupKitchenController],
  providers: [SoupKitchenService],
  exports: [SoupKitchenService],
})
export class SoupKitchenModule {}

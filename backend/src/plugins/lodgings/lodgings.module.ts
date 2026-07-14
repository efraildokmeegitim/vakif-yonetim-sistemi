import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LodgingsService } from './lodgings.service';
import { LodgingsController } from './lodgings.controller';
import { Lodging } from './entities/lodging.entity';
import { LodgingAccrual } from './entities/lodging-accrual.entity';
import { LodgingPayment } from './entities/lodging-payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lodging, LodgingAccrual, LodgingPayment])],
  controllers: [LodgingsController],
  providers: [LodgingsService],
})
export class LodgingsModule {}

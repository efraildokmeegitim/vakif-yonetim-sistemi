import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { Reservation } from './entities/reservation.entity';
import { AccommodationGuest } from './entities/accommodation-guest.entity';
import { CurrentAccount } from '../current-accounts/entities/current-account.entity';
import { AccommodationsController } from './accommodations.controller';
import { AccommodationsService } from './accommodations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, Reservation, AccommodationGuest, CurrentAccount]),
  ],
  controllers: [AccommodationsController],
  providers: [AccommodationsService],
  exports: [AccommodationsService],
})
export class AccommodationsModule {}

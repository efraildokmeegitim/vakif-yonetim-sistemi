import { Module } from '@nestjs/common';
import { SponsorshipsService } from './sponsorships.service';
import { SponsorshipsController } from './sponsorships.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sponsorship } from './entities/sponsorship.entity';
import { SponsorshipPayment } from './entities/sponsorship-payment.entity';
import { CurrentAccount } from '../current-accounts/entities/current-account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sponsorship, SponsorshipPayment, CurrentAccount])],
  controllers: [SponsorshipsController],
  providers: [SponsorshipsService],
})
export class SponsorshipsModule {}

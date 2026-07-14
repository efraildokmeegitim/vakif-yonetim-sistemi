import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicationsService } from './publications.service';
import { PublicationsController } from './publications.controller';
import { Publication } from './entities/publication.entity';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionPayment } from './entities/subscription-payment.entity';
import { PublicationSale } from './entities/publication-sale.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Publication, Subscription, SubscriptionPayment, PublicationSale])],
  controllers: [PublicationsController],
  providers: [PublicationsService]
})
export class PublicationsModule {}

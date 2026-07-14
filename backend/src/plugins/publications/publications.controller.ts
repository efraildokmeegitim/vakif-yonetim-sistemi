import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { CreateSubscriptionDto, CreateSaleDto } from './dto/publications.dto';

@UseGuards(JwtAuthGuard)
@Controller('publications')
export class PublicationsController {
  constructor(private readonly pubService: PublicationsService) {}

  @Get('stats')
  getStats() {
    return this.pubService.getDashboardStats();
  }

  @Get('catalog')
  getCatalog() {
    return this.pubService.getCatalog();
  }

  @Post('catalog')
  addCatalog(@Body() body: any) {
    return this.pubService.addCatalog(body);
  }

  @Get('subscriptions')
  getSubscriptions(@Query() query: any) {
    return this.pubService.getSubscriptions(query);
  }

  @Post('subscriptions')
  createSubscription(@Body() dto: CreateSubscriptionDto) {
    if (dto.gift_publication_id === '') dto.gift_publication_id = undefined;
    if (dto.wallet_id === '') dto.wallet_id = undefined;
    return this.pubService.addSubscription(dto as any);
  }

  @Post('subscriptions/:id/deliver')
  deliverGift(@Param('id') id: string) {
    return this.pubService.markGiftDelivered(+id);
  }

  @Post('sales')
  createSale(@Body() dto: CreateSaleDto) {
    return this.pubService.processSale(dto);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { LodgingsService } from './lodgings.service';

@Controller('lodgings')
export class LodgingsController {
  constructor(private readonly lodgingsService: LodgingsService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.lodgingsService.create(createDto);
  }

  @Get()
  findAll(@Query('status') status: string) {
    const isActive = status === 'archived' ? false : true;
    return this.lodgingsService.findAll(isActive);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lodgingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.lodgingsService.update(+id, updateDto);
  }

  @Patch(':id/toggle')
  toggleActive(@Param('id') id: string) {
    return this.lodgingsService.toggleActive(+id);
  }

  @Get(':id/accruals')
  getAccruals(@Param('id') id: string) {
    return this.lodgingsService.getAccruals(+id);
  }

  @Post(':id/accruals')
  generateAccrual(@Param('id') id: string, @Body() body: any) {
    return this.lodgingsService.generateAccrual(+id, body);
  }

  @Get(':id/payments')
  getPayments(@Param('id') id: string) {
    return this.lodgingsService.getPayments(+id);
  }

  @Post(':id/payments')
  addPayment(@Param('id') id: string, @Body() body: any) {
    return this.lodgingsService.addPayment(+id, body);
  }
}

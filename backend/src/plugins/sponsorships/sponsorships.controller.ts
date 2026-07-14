import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { SponsorshipsService } from './sponsorships.service';
import { CreateSponsorshipDto, CreateSponsorshipPaymentDto } from './dto/create-sponsorship.dto';
import { UpdateSponsorshipDto } from './dto/update-sponsorship.dto';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sponsorships')
export class SponsorshipsController {
  constructor(private readonly sponsorshipsService: SponsorshipsService) {}

  @Post()
  create(@Body() createSponsorshipDto: CreateSponsorshipDto) {
    return this.sponsorshipsService.create(createSponsorshipDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.sponsorshipsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sponsorshipsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSponsorshipDto: UpdateSponsorshipDto) {
    return this.sponsorshipsService.update(+id, updateSponsorshipDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sponsorshipsService.remove(+id);
  }

  @Post(':id/payments')
  addPayment(@Param('id') id: string, @Body() dto: CreateSponsorshipPaymentDto) {
    return this.sponsorshipsService.addPayment(+id, dto);
  }

  @Delete('payments/:id')
  removePayment(@Param('id') id: string) {
    return this.sponsorshipsService.removePayment(+id);
  }
}

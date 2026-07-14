import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SacrificesService } from './sacrifices.service';
import { CreateSacrificeCampaignDto, UpdateSacrificeCampaignDto } from './dto/sacrifice-campaign.dto';
import { CreateSacrificeGroupDto, UpdateSacrificeGroupDto } from './dto/sacrifice-group.dto';
import { CreateSacrificeShareDto, UpdateSacrificeShareDto, BulkCreatePartnerSharesDto, UpdateShareDonorDto } from './dto/sacrifice-share.dto';

@Controller('sacrifices')
export class SacrificesController {
  constructor(private readonly sacrificesService: SacrificesService) {}

  // --- CAMPAIGNS ---
  @Post('campaigns')
  createCampaign(@Body() dto: CreateSacrificeCampaignDto) {
    return this.sacrificesService.createCampaign(dto);
  }

  @Get('campaigns')
  findAllCampaigns() {
    return this.sacrificesService.findAllCampaigns();
  }

  @Get('campaigns/:campaignId/report')
  getCampaignReport(@Param('campaignId') campaignId: string) {
    return this.sacrificesService.getCampaignReport(+campaignId);
  }

  // --- GROUPS ---
  @Post('groups')
  createGroup(@Body() dto: CreateSacrificeGroupDto) {
    return this.sacrificesService.createGroup(dto);
  }

  @Get('campaigns/:campaignId/groups')
  findGroupsByCampaign(@Param('campaignId') campaignId: string) {
    return this.sacrificesService.findGroupsByCampaign(+campaignId);
  }

  @Patch('groups/:id')
  updateGroup(@Param('id') id: string, @Body() dto: UpdateSacrificeGroupDto) {
    return this.sacrificesService.updateGroup(+id, dto);
  }

  @Get('groups/:id')
  findOneGroup(@Param('id') id: string) {
    return this.sacrificesService.findOneGroup(+id);
  }

  @Post('groups/bulk-transfer')
  bulkTransferGroups(@Body() body: { groupIds: number[], transferredInstitution: string, purchaseCosts: Record<string, number> }) {
    return this.sacrificesService.bulkTransferGroups(body.groupIds, body.transferredInstitution, body.purchaseCosts);
  }

  @Delete('groups/:id')
  removeGroup(@Param('id') id: string) {
    return this.sacrificesService.removeGroup(+id);
  }

  // --- SHARES ---
  @Post('shares')
  addShare(@Body() dto: CreateSacrificeShareDto) {
    return this.sacrificesService.addShare(dto);
  }

  @Patch('shares/:id')
  updateShare(@Param('id') id: string, @Body() dto: UpdateSacrificeShareDto) {
    return this.sacrificesService.updateShare(+id, dto);
  }

  @Delete('shares/:id')
  removeShare(@Param('id') id: string) {
    return this.sacrificesService.removeShare(+id);
  }

  @Get('shares/donor/:donorId')
  findSharesByDonor(@Param('donorId') donorId: string) {
    return this.sacrificesService.findSharesByDonor(+donorId);
  }

  // --- PARTNER & SMS ---
  @Post('partner-shares')
  addBulkPartnerShares(@Body() dto: BulkCreatePartnerSharesDto) {
    return this.sacrificesService.addBulkPartnerShares(dto);
  }

  @Patch('shares/:id/assign-donor')
  assignDonorToShare(@Param('id') id: string, @Body() dto: UpdateShareDonorDto) {
    return this.sacrificesService.assignDonorToShare(+id, dto);
  }

  @Get('campaigns/:campaignId/partners/:partnerId/report')
  getPartnerReport(@Param('campaignId') campaignId: string, @Param('partnerId') partnerId: string) {
    return this.sacrificesService.getPartnerReport(+campaignId, +partnerId);
  }

  @Post('shares/:id/send-sms')
  sendSmsToShareholder(@Param('id') id: string) {
    return this.sacrificesService.sendSmsToShareholder(+id);
  }

  @Post('campaigns/:campaignId/partners/:partnerId/pay-debt')
  payPartnerDebt(
    @Param('campaignId') campaignId: string, 
    @Param('partnerId') partnerId: string,
    @Body() dto: { amount: number; currency: string; description?: string }
  ) {
    return this.sacrificesService.payPartnerDebt(+campaignId, +partnerId, dto);
  }
}


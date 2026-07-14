import { Controller, Get, Post, Body, Param, Query, Patch } from '@nestjs/common';
import { HouseholdsService } from './households.service';

@Controller('households')
export class HouseholdsController {
  constructor(private readonly householdsService: HouseholdsService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.householdsService.findAll(query);
  }

  @Post()
  create(@Body() body: any) {
    return this.householdsService.create(body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.householdsService.findOne(+id);
  }

  @Get('current-account/:caId')
  getByCurrentAccount(@Param('caId') caId: string) {
    return this.householdsService.getByCurrentAccount(+caId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.householdsService.updateStatus(+id, body.status);
  }

  @Patch(':id/personal-info')
  updatePersonalInfo(@Param('id') id: string, @Body() body: any) {
    return this.householdsService.updatePersonalInfo(+id, body);
  }

  @Get(':id/aid-history')
  getAidHistory(@Param('id') id: string) {
    return this.householdsService.getAidHistory(+id);
  }

  @Post(':id/archive')
  archive(@Param('id') id: string) {
    return this.householdsService.archive(+id);
  }

  // --- Nested Details ---
  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() body: any) {
    return this.householdsService.addMember(+id, body);
  }
  @Post('members/:memberId/delete')
  removeMember(@Param('memberId') memberId: string) {
    return this.householdsService.removeMember(+memberId);
  }

  @Post(':id/financials')
  addFinancial(@Param('id') id: string, @Body() body: any) {
    return this.householdsService.addFinancial(+id, body);
  }
  @Post('financials/:finId/delete')
  removeFinancial(@Param('finId') finId: string) {
    return this.householdsService.removeFinancial(+finId);
  }

  @Post(':id/needs')
  addNeed(@Param('id') id: string, @Body() body: any) {
    return this.householdsService.addNeed(+id, body);
  }
  @Post('needs/:needId/delete')
  removeNeed(@Param('needId') needId: string) {
    return this.householdsService.removeNeed(+needId);
  }

  @Post(':id/external-aids')
  addExternalAid(@Param('id') id: string, @Body() body: any) {
    return this.householdsService.addExternalAid(+id, body);
  }
  @Post('external-aids/:aidId/delete')
  removeExternalAid(@Param('aidId') aidId: string) {
    return this.householdsService.removeExternalAid(+aidId);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CostCentersService } from './cost-centers.service';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { PluginGuard } from '../system-plugins/plugin.guard';

@UseGuards(JwtAuthGuard, PluginGuard)
@Controller('cost-centers')
export class CostCentersController {
  constructor(private readonly costCentersService: CostCentersService) {}

  @Post()
  create(@Body() createCostCenterDto: any) {
    return this.costCentersService.create(createCostCenterDto);
  }

  @Get()
  findAll() {
    return this.costCentersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.costCentersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCostCenterDto: any) {
    return this.costCentersService.update(+id, updateCostCenterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.costCentersService.remove(+id);
  }
}

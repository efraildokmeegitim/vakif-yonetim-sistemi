import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AssetsService } from './assets.service';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // -- Kategoriler --
  @Get('categories')
  getCategories() {
    return this.assetsService.getCategories();
  }
  @Post('categories')
  createCategory(@Body('name') name: string) {
    return this.assetsService.createCategory(name);
  }
  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.assetsService.deleteCategory(+id);
  }

  // -- Demirbaşlar --
  @Post()
  create(@Body() createDto: any) {
    return this.assetsService.create(createDto);
  }
  @Get()
  findAll() {
    return this.assetsService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(+id);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.assetsService.update(+id, updateDto);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assetsService.remove(+id);
  }

  // -- Zimmetler --
  @Get(':id/assignments')
  getAssignments(@Param('id') id: string) {
    return this.assetsService.getAssignments(+id);
  }
  @Post(':id/assignments')
  assignAsset(@Param('id') id: string, @Body() assignDto: any) {
    return this.assetsService.assignAsset(+id, assignDto);
  }
  @Post('assignments/:id/return')
  returnAsset(@Param('id') id: string, @Body('returnDate') returnDate: string) {
    return this.assetsService.returnAsset(+id, returnDate);
  }

  // -- Bakım Kayıtları --
  @Get(':id/maintenances')
  getMaintenanceRecords(@Param('id') id: string) {
    return this.assetsService.getMaintenanceRecords(+id);
  }
  @Post(':id/maintenances')
  addMaintenance(@Param('id') id: string, @Body() data: any) {
    return this.assetsService.addMaintenance(+id, data);
  }
  @Delete(':id/maintenances/:maintenanceId')
  deleteMaintenance(@Param('maintenanceId') maintenanceId: string) {
    return this.assetsService.deleteMaintenance(+maintenanceId);
  }
}

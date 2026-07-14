import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { SystemPluginsService } from './system-plugins.service';

@Controller('system-plugins')
export class SystemPluginsController {
  constructor(private readonly systemPluginsService: SystemPluginsService) {}

  @Get()
  findAll() {
    return this.systemPluginsService.findAll();
  }

  @Patch(':id/toggle')
  toggleStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.systemPluginsService.toggleStatus(+id, isActive);
  }
}

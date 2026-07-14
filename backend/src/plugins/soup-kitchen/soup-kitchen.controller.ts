import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { SoupKitchenService } from './soup-kitchen.service';
import { CreateMenuDto, UpdateMenuDto, CreateDistributionDto, UpdateDistributionDto } from './dto/soup-kitchen.dto';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('soup-kitchen')
export class SoupKitchenController {
  constructor(private readonly soupService: SoupKitchenService) {}

  @Post('menus')
  createMenu(@Body() dto: CreateMenuDto) {
    return this.soupService.createMenu(dto);
  }

  @Get('menus')
  findAllMenus() {
    return this.soupService.findAllMenus();
  }

  @Get('menus/:id')
  findMenu(@Param('id') id: string) {
    return this.soupService.findMenu(+id);
  }

  @Put('menus/:id')
  updateMenu(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.soupService.updateMenu(+id, dto);
  }

  @Delete('menus/:id')
  removeMenu(@Param('id') id: string) {
    return this.soupService.removeMenu(+id);
  }

  @Post('distributions')
  addDistribution(@Body() dto: CreateDistributionDto) {
    return this.soupService.addDistribution(dto);
  }

  @Put('distributions/:id')
  updateDistribution(@Param('id') id: string, @Body() dto: UpdateDistributionDto) {
    return this.soupService.updateDistribution(+id, dto);
  }

  @Delete('distributions/:id')
  removeDistribution(@Param('id') id: string) {
    return this.soupService.removeDistribution(+id);
  }
}

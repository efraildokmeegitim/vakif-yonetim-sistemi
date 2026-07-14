import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentAccountsService } from './current-accounts.service';
import { CreateCurrentAccountDto, UpdateCurrentAccountDto } from './dto/current-account.dto';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { PluginGuard } from '../system-plugins/plugin.guard';
import { ImportService } from '../../core/import/import.service';

@UseGuards(JwtAuthGuard, PluginGuard)
@Controller('current-accounts')
export class CurrentAccountsController {
  constructor(
    private readonly currentAccountsService: CurrentAccountsService,
    private readonly importService: ImportService
  ) {}

  @Post()
  create(@Body() createCurrentAccountDto: CreateCurrentAccountDto) {
    return this.currentAccountsService.create(createCurrentAccountDto);
  }

  @Get()
  findAll(
    @Query('type') type?: string,
    @Query('isActive') isActive?: string,
  ) {
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.currentAccountsService.findAll(type, isActiveBool);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importAccounts(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Dosya bulunamadı.');
    
    // Beklenen sütunlar
    const expected = ['Ad Soyad/Ünvan', 'Tip ID', 'TC/VKN', 'Telefon'];
    const rows = await this.importService.parseExcel(file.buffer, expected);
    
    let added = 0;
    let errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const title = row['Ad Soyad/Ünvan'];
        const typeId = parseInt(row['Tip ID']);
        
        if (!title || isNaN(typeId)) {
          errors.push(`Satır ${i+2}: Ad Soyad ve Tip ID zorunludur.`);
          continue;
        }

        await this.currentAccountsService.create({
          title: title.toString(),
          typeId: typeId,
          tcVkn: row['TC/VKN']?.toString(),
          phone: row['Telefon']?.toString(),
          email: row['E-posta']?.toString(),
          address: row['Adres']?.toString(),
          city: row['İl']?.toString(),
          district: row['İlçe']?.toString(),
        } as any);

        added++;
      } catch (err) {
        errors.push(`Satır ${i+2}: Hata - ${err.message}`);
      }
    }

    return { message: 'İçe aktarma tamamlandı', added, errors };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.currentAccountsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCurrentAccountDto: UpdateCurrentAccountDto) {
    return this.currentAccountsService.update(+id, updateCurrentAccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.currentAccountsService.remove(+id);
  }

  // --- Documents ---
  @Get(':id/documents')
  getDocuments(@Param('id') id: string) {
    return this.currentAccountsService.getDocuments(+id);
  }

  @Post(':id/documents')
  addDocument(@Param('id') id: string, @Body() data: any) {
    return this.currentAccountsService.addDocument(+id, data);
  }

  @Post(':id/documents/:docId/delete')
  removeDocument(@Param('docId') docId: string) {
    return this.currentAccountsService.removeDocument(+docId);
  }

  // --- Aid Limits ---
  @Get(':id/aid-limits')
  getAidLimits(@Param('id') id: string) {
    return this.currentAccountsService.getAidLimits(+id);
  }

  @Post(':id/aid-limits')
  addAidLimit(@Param('id') id: string, @Body() data: any) {
    return this.currentAccountsService.addAidLimit(+id, data);
  }

  @Post('aid-limits/:limitId/delete')
  removeAidLimit(@Param('limitId') limitId: string) {
    return this.currentAccountsService.removeAidLimit(+limitId);
  }
}

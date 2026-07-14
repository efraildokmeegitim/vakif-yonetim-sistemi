import { Controller, Get, Param, Post, Res, UseGuards, InternalServerErrorException, Body, Delete } from '@nestjs/common';
import { ReportsService } from './reports.service';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import * as fs from 'fs';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('tables')
  getTables() {
    return this.reportsService.getTables();
  }

  @Get('export/:table')
  async exportTable(@Param('table') table: string, @Res() res: Response) {
    try {
      const workbook = await this.reportsService.exportTable(table);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${table}.xlsx`);
      
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      res.status(500).send('Dışa aktarma hatası');
    }
  }

  @Post('backup')
  async backupDatabase(@Res() res: Response) {
    try {
      const backupResult = await this.reportsService.backupDatabase();
      if (backupResult.success) {
        res.download(backupResult.file, backupResult.fileName, (err) => {
          if (err) {
            console.error(err);
          }
          // Optionally delete after download
          // fs.unlinkSync(backupResult.file);
        });
      }
    } catch (error) {
      res.status(500).json({ message: 'Yedekleme hatası' });
    }
  }

  @Get('columns/:table')
  async getColumns(@Param('table') table: string) {
    return this.reportsService.getColumns(table);
  }

  @Post('generate')
  async generateDynamicReport(@Body() dto: any) {
    return this.reportsService.generateDynamicReport(dto);
  }

  @Post('templates')
  createTemplate(@Body() dto: any) {
    return this.reportsService.createTemplate(dto);
  }

  @Get('templates')
  getTemplates() {
    return this.reportsService.getTemplates();
  }

  @Delete('templates/:id')
  deleteTemplate(@Param('id') id: string) {
    return this.reportsService.deleteTemplate(+id);
  }
}

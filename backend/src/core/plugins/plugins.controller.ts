import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import AdmZip = require('adm-zip');
import * as path from 'path';
import * as fs from 'fs';

@Controller('core/plugins')
@UseGuards(JwtAuthGuard) // Sadece giriş yapmış yetkililer yükleyebilir
export class PluginsController {
  
  @Post('upload')
  @UseInterceptors(FileInterceptor('pluginZip'))
  async uploadPlugin(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('Lütfen bir ZIP dosyası yükleyin.', HttpStatus.BAD_REQUEST);
    }

    if (file.mimetype !== 'application/zip' && file.mimetype !== 'application/x-zip-compressed' && file.mimetype !== 'application/octet-stream') {
      throw new HttpException('Sadece .zip uzantılı dosyalar desteklenmektedir.', HttpStatus.BAD_REQUEST);
    }

    try {
      // ZIP dosyasını bellekte oku
      const zip = new AdmZip(file.buffer);
      
      // Çıkartılacak hedef klasör (src/plugins)
      // __dirname = src/core/plugins veya dist/core/plugins
      const baseDir = __dirname.includes('dist') 
        ? path.join(__dirname, '..', '..', '..', 'src', 'plugins') 
        : path.join(__dirname, '..', '..', 'plugins');

      // Klasör yoksa oluştur
      if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir, { recursive: true });
      }

      // ZIP içeriğini çıkart (overwrite = true)
      zip.extractAllTo(baseDir, true);

      return {
        message: 'Eklenti başarıyla yüklendi. Sistem otomatik olarak yeniden başlatılıyor...',
        success: true
      };
    } catch (error) {
      throw new HttpException(`Eklenti yüklenirken hata oluştu: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ImportService {
  async parseExcel(buffer: any, expectedColumns: string[]): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0]; // İlk sayfayı al
    
    if (!worksheet) {
      throw new BadRequestException('Excel dosyası boş veya okunamıyor.');
    }

    const rows: any[] = [];
    const headers: string[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        // Başlıklar
        row.eachCell((cell, colNumber) => {
          headers[colNumber] = cell.value?.toString().trim() || '';
        });

        // Beklenen sütunlar var mı kontrolü (opsiyonel)
        if (expectedColumns && expectedColumns.length > 0) {
          const missing = expectedColumns.filter(c => !headers.includes(c));
          if (missing.length > 0) {
            throw new BadRequestException(`Eksik sütunlar var: ${missing.join(', ')}`);
          }
        }
      } else {
        // Veri satırları
        const rowData: any = {};
        row.eachCell((cell, colNumber) => {
          const headerName = headers[colNumber];
          if (headerName) {
            rowData[headerName] = cell.value;
          }
        });
        
        // Boş satırları atla
        if (Object.keys(rowData).length > 0) {
          rows.push(rowData);
        }
      }
    });

    return rows;
  }
}

import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as ExcelJS from 'exceljs';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { ReportTemplate } from './entities/report-template.entity';

const execAsync = promisify(exec);

@Injectable()
export class ReportsService {
  constructor(
    private readonly entityManager: EntityManager,
    @InjectRepository(ReportTemplate)
    private readonly templateRepo: Repository<ReportTemplate>
  ) {}

  async exportTable(tableName: string) {
    try {
      const data = await this.entityManager.query(`SELECT * FROM ${tableName}`);
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(tableName);

      if (data && data.length > 0) {
        const columns = Object.keys(data[0]).map(key => ({ header: key, key: key, width: 20 }));
        worksheet.columns = columns;
        data.forEach((row: any) => worksheet.addRow(row));
      } else {
        worksheet.addRow(['No data found']);
      }

      return workbook;
    } catch (error) {
      throw new InternalServerErrorException('Tablo dışa aktarılamadı');
    }
  }

  async getTables() {
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = '${process.env.DB_NAME || 'vakif_core_db'}'
    `;
    const tables = await this.entityManager.query(query);
    return tables.map((t: any) => t.table_name || t.TABLE_NAME);
  }

  async getColumns(tableName: string) {
    const tables = await this.getTables();
    if (!tables.includes(tableName)) {
      throw new InternalServerErrorException('Geçersiz tablo adı');
    }
    const query = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = '${process.env.DB_NAME || 'vakif_core_db'}' AND table_name = ?
    `;
    const columns = await this.entityManager.query(query, [tableName]);
    return columns.map((c: any) => ({
      name: c.column_name || c.COLUMN_NAME,
      type: c.data_type || c.DATA_TYPE
    }));
  }

  async generateDynamicReport(dto: any) {
    const { table, columns, filters, sort, limit } = dto;
    
    // Validate table
    const validTables = await this.getTables();
    if (!validTables.includes(table)) {
      throw new InternalServerErrorException('Geçersiz tablo adı');
    }

    const qb = this.entityManager.createQueryBuilder().from(table, 't');

    // Select columns
    if (columns && Array.isArray(columns) && columns.length > 0) {
      qb.select(columns.map(c => `t.${c} AS \`${c}\``));
    } else {
      qb.select('t.*');
    }

    // Apply filters safely
    if (filters && Array.isArray(filters)) {
      filters.forEach((filter, index) => {
        const paramName = `param${index}`;
        const { column, operator, value } = filter;
        // column must be alphanumeric
        if (!/^[a-zA-Z0-9_]+$/.test(column)) return;
        
        switch (operator) {
          case 'eq': qb.andWhere(`t.${column} = :${paramName}`, { [paramName]: value }); break;
          case 'neq': qb.andWhere(`t.${column} != :${paramName}`, { [paramName]: value }); break;
          case 'gt': qb.andWhere(`t.${column} > :${paramName}`, { [paramName]: value }); break;
          case 'gte': qb.andWhere(`t.${column} >= :${paramName}`, { [paramName]: value }); break;
          case 'lt': qb.andWhere(`t.${column} < :${paramName}`, { [paramName]: value }); break;
          case 'lte': qb.andWhere(`t.${column} <= :${paramName}`, { [paramName]: value }); break;
          case 'like': qb.andWhere(`t.${column} LIKE :${paramName}`, { [paramName]: `%${value}%` }); break;
          case 'in': 
            if (Array.isArray(value) && value.length > 0) {
              qb.andWhere(`t.${column} IN (:...${paramName})`, { [paramName]: value }); 
            }
            break;
        }
      });
    }

    // Apply Sort
    if (sort && sort.column) {
       if (/^[a-zA-Z0-9_]+$/.test(sort.column)) {
         qb.orderBy(`t.${sort.column}`, sort.order === 'DESC' ? 'DESC' : 'ASC');
       }
    } else {
      // default sort if ID exists (we don't know for sure, so skip or order by first col)
    }

    // Apply Limit
    if (limit && typeof limit === 'number') {
      qb.limit(Math.min(limit, 5000)); // cap at 5000 rows for safety
    } else {
      qb.limit(1000); // default limit
    }

    const data = await qb.getRawMany();
    return { data, count: data.length };
  }

  async createTemplate(dto: any) {
    const template = this.templateRepo.create({
      title: dto.title,
      tableName: dto.tableName,
      columns: dto.columns,
      filters: dto.filters,
      sortBy: dto.sortBy,
      limit: dto.limit || 1000,
    });
    return this.templateRepo.save(template);
  }

  async getTemplates() {
    return this.templateRepo.find({ order: { createdAt: 'DESC' } });
  }

  async deleteTemplate(id: number) {
    const template = await this.templateRepo.findOneBy({ id });
    if (!template) throw new NotFoundException('Şablon bulunamadı');
    await this.templateRepo.remove(template);
    return { success: true };
  }

  async backupDatabase() {
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '3306';
    const dbUser = process.env.DB_USER || 'root';
    const dbPass = process.env.DB_PASSWORD || 'root';
    const dbName = process.env.DB_NAME || 'vakif_core_db';

    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup-${dbName}-${timestamp}.sql`;
    const filePath = path.join(backupDir, fileName);

    const command = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} -p${dbPass} ${dbName} > ${filePath}`;

    try {
      await execAsync(command);
      return { success: true, file: filePath, fileName };
    } catch (error) {
      console.error('Backup error:', error);
      throw new InternalServerErrorException('Yedekleme başarısız oldu');
    }
  }
}

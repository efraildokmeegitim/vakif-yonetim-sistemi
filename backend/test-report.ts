import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ReportsService } from './src/core/reports/reports.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const reportsService = app.get(ReportsService);

  const res = await reportsService.generateDynamicReport({
    table: 'current_accounts',
    columns: ['id', 'name'],
    filters: [],
    sort: { column: '', order: 'DESC' },
    limit: 100
  });
  
  console.log(res);
  await app.close();
}
bootstrap();

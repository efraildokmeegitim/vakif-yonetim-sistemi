import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api');
  
  // Gelen tüm HTTP isteklerinde DTO doğrulamasını aktif et (class-validator)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // DTO'da olmayan ekstra verileri siler
    forbidNonWhitelisted: true, // DTO'da olmayan veri gelirse hata fırlatır
    transform: true, // Gelen stringleri otomatik olarak DTO'daki tiplere (number, boolean vb.) çevirir
  }));

  app.useGlobalFilters(new AllExceptionsFilter());

  // Güvenlik Başlıkları (Helmet)
  app.use(helmet());

  // CORS Yapılandırması (Çevresel Değişkene Bağlı)
  const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173'];
  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3000, '0.0.0.0');
}
bootstrap();

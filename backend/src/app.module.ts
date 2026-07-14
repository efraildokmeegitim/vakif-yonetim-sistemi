import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import { PluginModule } from './core/plugins/plugin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './core/auth/auth.module';
import { UsersModule } from './core/users/users.module';
import { SettingsModule } from './core/settings/settings.module';
import { SystemPluginsModule } from './plugins/system-plugins/system-plugins.module';
import { PersonnelModule } from './plugins/personnel/personnel.module';
import { ScholarshipsModule } from './plugins/scholarships/scholarships.module';
import { AssetsModule } from './plugins/assets/assets.module';
import { LodgingsModule } from './plugins/lodgings/lodgings.module';
import { WarehousesModule } from './plugins/warehouses/warehouses.module';
import { StockModule } from './plugins/stock/stock.module';
import { TasksModule } from './plugins/tasks/tasks.module';
import { ProjectsModule } from './plugins/projects/projects.module';
import { PublicationsModule } from './plugins/publications/publications.module';
import { CostCentersModule } from './plugins/cost-centers/cost-centers.module';
import { HouseholdsModule } from './plugins/households/households.module';
import { SoupKitchenModule } from './plugins/soup-kitchen/soup-kitchen.module';
import { VehiclesModule } from './plugins/vehicles/vehicles.module';
import { EventsModule } from './plugins/events/events.module';
import { SponsorshipsModule } from './plugins/sponsorships/sponsorships.module';
import { ReportsModule } from './core/reports/reports.module';
import { DashboardModule } from './plugins/dashboard/dashboard.module';
import { NotificationsModule } from './core/notifications/notifications.module';
import { ImportModule } from './core/import/import.module';
import { AccommodationsModule } from './plugins/accommodations/accommodations.module';
import { WhatsappModule } from './core/whatsapp/whatsapp.module';
import { TodosModule } from './core/todos/todos.module';
@Module({
  imports: [
    // .env dosyasını tüm projede kullanılabilir hale getirir
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Veritabanı bağlantısı
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Geliştirme aşamasında tabloları otomatik oluşturur. (Canlıda kapatılmalıdır)
      }),
    }),
    
    // Core Modules
    AuthModule,
    UsersModule,
    SettingsModule,

    // Olay Güdümlü İletişim (Event Emitter)
    EventEmitterModule.forRoot(),

    // Static Dosya Sunucusu (Yüklenen dosyalar için)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Rate Limiting (DDoS ve Brute Force koruması)
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [{
        ttl: configService.get<number>('RATE_LIMIT_TTL', 60000), // Default 60000 ms (1 dk)
        limit: configService.get<number>('RATE_LIMIT_LIMIT', 100), // Default 100 req per TTL
      }],
    }),

    // Dinamik Eklenti Yükleyici
    PluginModule.registerPlugins(),

    SystemPluginsModule,

    PersonnelModule,
    ScholarshipsModule,
    AssetsModule,
    LodgingsModule,
    WarehousesModule,
    StockModule,
    TasksModule,
    ProjectsModule,
    PublicationsModule,
    CostCentersModule,
    HouseholdsModule,
    SoupKitchenModule,
    VehiclesModule,
    EventsModule,
    SponsorshipsModule,
    ReportsModule,
    DashboardModule,
    NotificationsModule,
    ImportModule,
    AccommodationsModule,
    WhatsappModule,
    TodosModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule {}

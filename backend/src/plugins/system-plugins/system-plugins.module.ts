import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { SystemPluginsService } from './system-plugins.service';
import { SystemPluginsController } from './system-plugins.controller';
import { SystemPlugin } from './entities/system-plugin.entity';
import { PluginGuard } from './plugin.guard';

@Module({
  imports: [TypeOrmModule.forFeature([SystemPlugin])],
  controllers: [SystemPluginsController],
  providers: [
    SystemPluginsService,
    {
      provide: APP_GUARD,
      useClass: PluginGuard,
    },
  ],
  exports: [SystemPluginsService],
})
export class SystemPluginsModule {}

import { DynamicModule, Module, Logger } from '@nestjs/common';
import { PluginsController } from './plugins.controller';
import * as fs from 'fs';
import * as path from 'path';

// Core Plugins (Always loaded)
import { SacrificesModule } from '../../plugins/sacrifices/sacrifices.module';
import { CurrentAccountsModule } from '../../plugins/current-accounts/current-accounts.module';
import { WalletsModule } from '../../plugins/wallets/wallets.module';

@Module({
  imports: [
    SacrificesModule,
    CurrentAccountsModule,
    WalletsModule,
  ],
  controllers: [PluginsController],
})
export class PluginModule {
  private static readonly logger = new Logger('PluginLoader');

  static registerPlugins(): DynamicModule {
    const pluginsPath = path.join(__dirname, '..', '..', 'plugins'); // dist/plugins
    const imports: any[] = [];

    if (fs.existsSync(pluginsPath)) {
      const pluginDirs = fs.readdirSync(pluginsPath).filter(file => {
        return fs.statSync(path.join(pluginsPath, file)).isDirectory();
      });

      for (const dir of pluginDirs) {
        // We expect the module file to be named <dir>.module.js
        const modulePath = path.join(pluginsPath, dir, `${dir}.module`);
        
        try {
          // Dynamic require (synchronous)
          const importedModule = require(modulePath);
          
          // Find the exported class that ends with 'Module'
          const moduleClass = Object.values(importedModule).find(
            (val: any) => typeof val === 'function' && val.name.endsWith('Module')
          );

          if (moduleClass) {
            this.logger.log(`Eklenti basariyla yuklendi: [${dir}]`);
            imports.push(moduleClass);
          } else {
            this.logger.warn(`Eklenti klasoru bulundu ama gecerli bir Modul sinifi bulunamadi: [${dir}]`);
          }
        } catch (e) {
          this.logger.error(`Eklenti yuklenirken hata olustu [${dir}]: ${e.message}`);
        }
      }
    } else {
      this.logger.log('Plugins klasoru bulunamadi veya bos.');
    }

    return {
      module: PluginModule,
      imports,
    };
  }
}

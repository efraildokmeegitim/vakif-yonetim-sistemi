import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SystemPluginsService } from './system-plugins.service';
import { Request } from 'express';

@Injectable()
export class PluginGuard implements CanActivate {
  constructor(private readonly pluginsService: SystemPluginsService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    // request.path example: /api/sacrifices/campaigns
    const path = request.path;
    
    // Yalnızca /api ile başlayan rotalar plugin sistemine dahildir
    if (!path.startsWith('/api/')) return true;

    // /api/ kısmı atıldığında ilk segment plugin identifier'dır.
    // Örn: /api/sacrifices -> sacrifices
    const segments = path.replace('/api/', '').split('/');
    const identifier = segments[0];

    let pluginName = identifier;
    if (pluginName === 'current-account-types') pluginName = 'current-accounts';

    // Auth, system-plugins, core vb. core modüller her zaman açıktır
    if (['auth', 'system-plugins', 'core', 'users', 'settings', 'reports', 'dashboard', 'notifications', 'whatsapp', 'todos'].includes(pluginName)) {
      return true;
    }

    // Eğer identifier bir eklenti (plugin) ise ve kapalıysa engelle
    if (!this.pluginsService.isPluginActive(pluginName)) {
      throw new ForbiddenException(`Bu eklenti (${identifier}) şu anda pasif durumdadır. Erişmek için Eklentiler menüsünden aktifleştirin.`);
    }

    return true;
  }
}

import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('whatsapp')
@UseGuards(JwtAuthGuard)
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('status')
  getStatus() {
    return this.whatsappService.getStatus();
  }

  @Get('qr')
  getQrCode() {
    return this.whatsappService.getQrCode();
  }

  @Post('logout')
  async logout() {
    return this.whatsappService.logout();
  }

  @Post('send-bulk')
  async sendBulk(@Body() body: { recipients: string[], message: string }) {
    return this.whatsappService.sendBulkMessages(body.recipients, body.message);
  }

  @Get('queue')
  getQueue() {
    return this.whatsappService.getQueueStatus();
  }
}

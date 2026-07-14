import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsappMessage } from './entities/whatsapp-message.entity';
// @ts-ignore
import * as qrcode from 'qrcode';

@Injectable()
export class WhatsappService implements OnModuleInit, OnModuleDestroy {
  private client: Client;
  private readonly logger = new Logger(WhatsappService.name);
  
  private qrCodeBase64: string | null = null;
  private isConnected: boolean = false;
  private isInitializing: boolean = false;
  
  public messageQueue: { id: string, dbId?: number, phone: string, status: 'queued' | 'sent' | 'failed', message: string, error?: string, timestamp: Date }[] = [];

  constructor(
    @InjectRepository(WhatsappMessage)
    private readonly messageRepo: Repository<WhatsappMessage>,
  ) {
    this.client = new Client({
      authStrategy: new LocalAuth({ dataPath: './whatsapp-auth' }),
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-extensions']
      }
    });

    this.client.on('qr', async (qr) => {
      this.logger.log('QR Code received');
      try {
        this.qrCodeBase64 = await qrcode.toDataURL(qr);
        this.isConnected = false;
      } catch (err) {
        this.logger.error('Error generating QR code base64', err);
      }
    });

    this.client.on('ready', () => {
      this.logger.log('WhatsApp Client is ready!');
      this.isConnected = true;
      this.qrCodeBase64 = null;
    });

    this.client.on('authenticated', () => {
      this.logger.log('WhatsApp Authenticated');
    });

    this.client.on('auth_failure', msg => {
      this.logger.error('WhatsApp Authentication failure', msg);
      this.isConnected = false;
      this.qrCodeBase64 = null;
    });

    this.client.on('disconnected', (reason) => {
      this.logger.warn('WhatsApp Client was disconnected', reason);
      this.isConnected = false;
      this.qrCodeBase64 = null;
    });
  }

  async onModuleInit() {
    this.logger.log('Initializing WhatsApp Client...');
    this.isInitializing = true;
    try {
      await this.client.initialize();
    } catch (error) {
      this.logger.error('Failed to initialize WhatsApp Client', error);
    } finally {
      this.isInitializing = false;
    }
  }

  async onModuleDestroy() {
    this.logger.log('Destroying WhatsApp Client...');
    try {
      await this.client.destroy();
    } catch (error) {
      this.logger.error('Failed to destroy WhatsApp Client', error);
    }
  }

  getStatus() {
    return {
      connected: this.isConnected,
      hasQr: !!this.qrCodeBase64,
      initializing: this.isInitializing
    };
  }

  getQrCode() {
    return {
      qr: this.qrCodeBase64
    };
  }

  async logout() {
    if (this.isConnected) {
      await this.client.logout();
      this.isConnected = false;
      this.qrCodeBase64 = null;
      // Re-initialize to get a new QR code
      await this.client.initialize();
    }
    return { success: true };
  }

  async sendBulkMessages(recipients: string[], message: string) {
    if (!this.isConnected) {
      throw new Error('WhatsApp is not connected');
    }

    const newItems = [];
    for (const phone of recipients) {
      // Save to database first
      const dbMsg = new WhatsappMessage();
      dbMsg.phone = phone;
      dbMsg.message = message;
      dbMsg.status = 'queued';
      const savedMsg = await this.messageRepo.save(dbMsg);

      newItems.push({
        id: Math.random().toString(36).substring(7) + Date.now().toString(36),
        dbId: savedMsg.id,
        phone,
        message,
        status: 'queued' as const,
        timestamp: savedMsg.createdAt || new Date()
      });
    }

    this.messageQueue.push(...newItems);

    // Run in background so it doesn't block the request
    this.processBulkQueue();
    return { success: true, count: recipients.length };
  }

  async getQueueStatus() {
    // Return database-stored messages to show history and queue
    return await this.messageRepo.find({
      order: { createdAt: 'DESC' },
      take: 200 // Show latest 200 messages for auditing/proof
    });
  }

  private isProcessingQueue = false;

  private async processBulkQueue() {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    try {
      while (true) {
        if (!this.isConnected) {
          this.logger.warn('WhatsApp disconnected during bulk send. Pausing queue.');
          break;
        }

        const nextItem = this.messageQueue.find(q => q.status === 'queued');
        if (!nextItem) break; // Queue is empty or all sent/failed

        // Format phone number to WhatsApp format (e.g., 905xxxxxxxxx@c.us)
        let cleanPhone = nextItem.phone.replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('0')) {
          cleanPhone = '9' + cleanPhone; // Convert 05... to 905...
        } else if (cleanPhone.length === 10) {
          cleanPhone = '90' + cleanPhone; // Convert 5... to 905...
        }
        
        const chatId = `${cleanPhone}@c.us`;

        try {
          await this.client.sendMessage(chatId, nextItem.message);
          nextItem.status = 'sent';
          this.logger.log(`Message sent successfully to ${cleanPhone}`);

          if (nextItem.dbId) {
            await this.messageRepo.update(nextItem.dbId, { status: 'sent' });
          }
          
          // Delay to prevent spam detection (3-6 seconds)
          const delay = Math.floor(Math.random() * 3000) + 3000;
          await new Promise(resolve => setTimeout(resolve, delay));
        } catch (error: any) {
          this.logger.error(`Failed to send message to ${cleanPhone}`, error);
          nextItem.status = 'failed';
          nextItem.error = error.message || 'Unknown error';

          if (nextItem.dbId) {
            await this.messageRepo.update(nextItem.dbId, { 
              status: 'failed', 
              error: error.message || 'Unknown error' 
            });
          }
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }
}

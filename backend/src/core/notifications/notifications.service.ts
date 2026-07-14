import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import * as nodemailer from 'nodemailer';
import { User } from '../users/entities/user.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    private notificationsGateway: NotificationsGateway,
  ) {
    // E-posta gönderimi için basit bir transport (Geliştirmede ethereal veya SMTP kullanılabilir)
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.SMTP_USER || 'test@ethereal.email',
        pass: process.env.SMTP_PASS || 'password'
      }
    });
  }

  async sendNotification(user: User, title: string, message: string, type: string = 'info') {
    const notification = this.notificationsRepository.create({
      title,
      message,
      type,
      user
    });
    const saved = await this.notificationsRepository.save(notification);

    // Socket üzerinden anlık gönder
    this.notificationsGateway.sendNotificationToUser(user.id.toString(), saved);

    // E-posta at (Opsiyonel)
    if (user.email) {
      try {
        await this.transporter.sendMail({
          from: '"Vakıf Yönetim Sistemi" <noreply@vakif.org>',
          to: user.email,
          subject: title,
          text: message,
          html: `<b>${title}</b><p>${message}</p>`
        });
      } catch (err) {
        this.logger.error('E-posta gönderilemedi: ' + err.message);
      }
    }

    return saved;
  }

  async getUserNotifications(userId: number) {
    return this.notificationsRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 50
    });
  }

  async markAsRead(id: number) {
    return this.notificationsRepository.update(id, { isRead: true });
  }

  async markAllAsRead(userId: number) {
    return this.notificationsRepository.update({ user: { id: userId }, isRead: false }, { isRead: true });
  }
}

import { Injectable } from '@nestjs/common';
import * as twilio from 'twilio';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from '../prisma.service';
import { Notification, Prisma } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async sendSMS(message: string, receiver: string): Promise<object> {
    try {
      const client = twilio(
        process.env.TWILO_SID,
        process.env.TWILO_AUTH_TOKEN,
      );

      return await client.messages.create({
        body: message,
        from: process.env.TWILO_PHONE,
        to: receiver,
      });
    } catch (error) {}
  }

  async createNotification(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    return await this.prisma.notification.create({
      data: createNotificationDto,
    });
  }

  async updateNotification(params: {
    where: Prisma.NotificationWhereUniqueInput;
    data: Prisma.NotificationUpdateInput;
  }): Promise<Notification> {
    const { where, data } = params;
    return await this.prisma.notification.update({
      data,
      where,
    });
  }

  async deleteNotification(
    where: Prisma.NotificationWhereUniqueInput,
  ): Promise<Notification> {
    return await this.prisma.notification.delete({
      where,
    });
  }

  async returnNotifications(userId: string): Promise<Notification[]> {
    return await this.prisma.notification.findMany({
      where: {
        userId,
      },
    });
  }
}

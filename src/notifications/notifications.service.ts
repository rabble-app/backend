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
    } catch (error) {
      console.log(error);
    }
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

  async createConversation(title: string) {
    try {
      const client = twilio(
        process.env.TWILO_SID,
        process.env.TWILO_AUTH_TOKEN,
      );
      const response = await client.conversations.v1.conversations.create({
        friendlyName: `${title}`,
      });
      return response.sid;
    } catch (error) {}
  }

  async addParticipant(converstionId: string, participantPhoneNumber: string) {
    try {
      const client = twilio(
        process.env.TWILO_SID,
        process.env.TWILO_AUTH_TOKEN,
      );
      // await client.conversations.v1
      //   .conversations(converstionId)
      //   .participants.create({
      //     'messagingBinding.address': `whatsapp:${participantPhoneNumber}`,
      //     'messagingBinding.proxyAddress': 'whatsapp:+14155238886',
      //   });

      await client.messages.create({
        to: `whatsapp:${participantPhoneNumber}`,
        from: `whatsapp:+14155238886`,
        body: ' Rabble has invited you to join a group conversation. *Please tap the button below to confirm your participation.*',
      });
    } catch (error) {
      console.log(error);
    }
  }

  async sendConversationMessage(converstionId: string, message: string) {
    try {
      const client = twilio(
        process.env.TWILO_SID,
        process.env.TWILO_AUTH_TOKEN,
      );
      const response = await client.conversations.v1
        .conversations(converstionId)
        .messages.create({
          author: 'Rabble',
          body: message,
        });

      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }
}

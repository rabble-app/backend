import * as firebase from 'firebase-admin';
import twilio from 'twilio';
import { ICreateNotification } from '../../src/lib/types';
import { Inject, Injectable } from '@nestjs/common';
import { Notification, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    @Inject('AWS_PARAMETERS') private readonly parameters: Record<string, any>,
  ) {
    firebase.initializeApp({
      credential: firebase.credential.cert({
        projectId: this.parameters.FIREBASE_PROJECT_ID,
        privateKey: this.parameters.FIREBASE_PRIVATE_KEY,
        clientEmail: this.parameters.FIREBASE_CLIENT_EMAIL,
      }),
    });
  }
  async sendSMS(message: string, receiver: string): Promise<object> {
    try {
      const client = twilio(
        this.parameters.TWILO_SID,
        this.parameters.TWILO_AUTH_TOKEN,
      );

      return await client.messages.create({
        body: message,
        from: this.parameters.TWILO_PHONE,
        to: receiver,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async createNotification(
    createNotificationDto: ICreateNotification,
  ): Promise<Notification> {
    const notificationToken = createNotificationDto.notficationToken
      ? createNotificationDto.notficationToken
      : '';
    delete createNotificationDto.notficationToken;
    const result = await this.prisma.notification.create({
      data: createNotificationDto,
    });
    // send push notification
    if (notificationToken) {
      await firebase
        .messaging()
        .send({
          notification: {
            title: createNotificationDto.title,
            body: createNotificationDto.text,
          },
          data: {
            title: createNotificationDto.title,
            body: createNotificationDto.text,
            teamId: createNotificationDto.teamId,
            type: createNotificationDto.type,
          },
          token: notificationToken,
          android: { priority: 'high' },
        })
        .catch((/*error: any*/) => {
          // console.error(error);
        });
    }

    return result;
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

  async clearNotification(userId: string): Promise<object> {
    return await this.prisma.notification.updateMany({
      where: {
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async returnNotifications(userId: string): Promise<Notification[]> {
    const notificationsWithoutChat = await this.prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
        type: {
          not: 'CHAT',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const chatNotifications = await this.prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
        type: 'CHAT',
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const chatNotificationUnique = [
      ...new Map(chatNotifications.map((m) => [m.teamId, m])).values(),
    ];

    return notificationsWithoutChat.concat(chatNotificationUnique);
  }

  async createConversation(title: string) {
    try {
      const client = twilio(
        this.parameters.TWILO_SID,
        this.parameters.TWILO_AUTH_TOKEN,
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
        this.parameters.TWILO_SID,
        this.parameters.TWILO_AUTH_TOKEN,
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
        this.parameters.TWILO_SID,
        this.parameters.TWILO_AUTH_TOKEN,
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

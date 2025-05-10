import * as firebase from 'firebase-admin';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class FirebaseService {
  private readonly messaging: firebase.messaging.Messaging;

  constructor(
    @Inject('AWS_PARAMETERS') private readonly parameters: Record<string, any>,
  ) {
    firebase.initializeApp({
      credential: firebase.credential.cert({
        projectId: this.parameters.FIREBASE_PROJECT_ID,
        privateKey: this.parameters.FIREBASE_PRIVATE_KEY,
        clientEmail: this.parameters.FIREBASE_CLIENT_EMAIL,
      }),
    });
    this.messaging = firebase.messaging();
  }

  async sendPushNotification(params: {
    token: string;
    title: string;
    body: string;
    data?: Record<string, string>;
  }): Promise<void> {
    const { token, title, body, data } = params;
    await this.messaging
      .send({
        notification: {
          title,
          body,
        },
        data: {
          title,
          body,
          ...data,
        },
        token,
        android: { priority: 'high' },
      })
      .catch((error) => {
        console.error('Failed to send push notification:', error);
      });
  }
}

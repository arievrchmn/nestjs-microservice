/* eslint-disable no-useless-catch */
// libs/firebase/src/lib/firebase.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app!: admin.app.App;

  onModuleInit() {
    const requiredEnvVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
    const missingVars = requiredEnvVars.filter((varName) => {
      return !process.env[varName];
    });
    if (missingVars.length > 0) {
      throw new Error(`Missing Firebase env vars: ${missingVars.join(', ')}`);
    }

    try {
      if (!admin.apps.length) {
        this.app = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        });
      } else {
        this.app = admin.app();
      }
    } catch (error) {
      throw error;
    }
  }

  async subscribeToTopic(token: string, topic: string): Promise<void> {
    await this.app.messaging().subscribeToTopic([token], topic);
  }

  async sendToTopic(topic: string, title: string, body: string, data?: Record<string, string>): Promise<void> {
    const message: admin.messaging.Message = {
      notification: {
        title,
        body,
      },
      ...(data && { data }),
      topic,
    };
    await this.app.messaging().send(message);
  }
}

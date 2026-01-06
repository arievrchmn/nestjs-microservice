// apps/log-service/src/app/app.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log, LogDocument } from '../model/log.schema';

@Injectable()
export class AppService {
  constructor(@InjectModel(Log.name) private logModel: Model<LogDocument>) {}

  async createLog(data: { userId?: number; userName?: string; changes?: Record<string, any>; updatedBy?: number }) {
    try {
      await this.logModel.create(data);
    } catch (error) {
      console.error('Failed to save log:', error);
    }
  }

  async getAllLogs() {
    return this.logModel.find().exec();
  }
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LogDocument = HydratedDocument<Log>;

@Schema({
  timestamps: true,
  collection: 'logs',
})
export class Log {
  @Prop({ required: false })
  userId?: number;

  @Prop({ required: false })
  userName?: string;

  @Prop({ type: Object, required: false })
  changes?: Record<string, any>;

  @Prop({ required: false })
  updatedBy?: number;
}

export const LogSchema = SchemaFactory.createForClass(Log);

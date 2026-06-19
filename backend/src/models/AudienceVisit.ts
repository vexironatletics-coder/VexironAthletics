import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAudienceVisit extends Document {
  userIp: string;
  deviceIp: string;
  country: string;
  city: string;
  region: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
  userAgent: string;
  deviceType: string;
  browser: string;
  os: string;
  path: string;
  referrer: string;
  referrerHost: string;
  user?: Types.ObjectId;
  sessionId?: string;
  visitedAt: Date;
}

const audienceVisitSchema = new Schema<IAudienceVisit>(
  {
    userIp: { type: String, required: true, index: true },
    deviceIp: { type: String, required: true },
    country: { type: String, default: 'Unknown', index: true },
    city: { type: String, default: 'Unknown', index: true },
    region: { type: String, default: '' },
    timezone: { type: String, default: '' },
    latitude: { type: Number },
    longitude: { type: Number },
    userAgent: { type: String, default: '' },
    deviceType: { type: String, default: 'unknown', index: true },
    browser: { type: String, default: '' },
    os: { type: String, default: '' },
    path: { type: String, default: '/', index: true },
    referrer: { type: String, default: '' },
    referrerHost: { type: String, default: 'direct', index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    sessionId: { type: String, index: true },
    visitedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

audienceVisitSchema.index({ visitedAt: -1 });
audienceVisitSchema.index({ country: 1, city: 1 });

export const AudienceVisit = mongoose.model<IAudienceVisit>('AudienceVisit', audienceVisitSchema);

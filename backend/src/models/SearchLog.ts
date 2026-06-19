import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISearchLog extends Document {
  query: string;
  resultsCount: number;
  source: 'text' | 'visual' | 'autocomplete';
  user?: Types.ObjectId;
  filters?: Record<string, unknown>;
  createdAt: Date;
}

const searchLogSchema = new Schema<ISearchLog>(
  {
    query: { type: String, required: true, trim: true },
    resultsCount: { type: Number, default: 0 },
    source: { type: String, enum: ['text', 'visual', 'autocomplete'], default: 'text' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    filters: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

searchLogSchema.index({ createdAt: -1 });
searchLogSchema.index({ query: 1 });

export const SearchLog = mongoose.model<ISearchLog>('SearchLog', searchLogSchema);

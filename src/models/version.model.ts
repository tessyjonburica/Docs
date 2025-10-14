import { Schema, model, Document, Types } from 'mongoose';

export interface IVersion extends Document {
  documentId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  versionNumber: number;
  changes: string;
  createdAt: Date;
}

const versionSchema = new Schema<IVersion>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    versionNumber: { type: Number, required: true },
    changes: { type: String, required: true },
  },
  { timestamps: true }
);

export default model<IVersion>('Version', versionSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  title: string;
  content: Buffer;
  owner: mongoose.Types.ObjectId;
  collaborators: mongoose.Types.ObjectId[];
  lastEditedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    title: { type: String, required: true },
    content: { type: Buffer, default: Buffer.from('') }, // initialize empty buffer
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lastEditedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model<IDocument>('Document', documentSchema);

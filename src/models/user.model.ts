import mongoose, { Document, Schema } from "mongoose";

export const ROLES = ['user', 'admin'];

export interface IUser extends Document {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: string;
    lastActiveAt: Date;
}

const UserSchema = new Schema<IUser>({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: 'user' },
    lastActiveAt: { type: Date, default: Date.now },
}, { timestamps: true, toJSON: { virtuals: true } });

export default mongoose.model<IUser>('User', UserSchema);
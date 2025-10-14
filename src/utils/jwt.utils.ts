import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/user.model';

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

const expiresIn: SignOptions['expiresIn'] = (process.env.JWT_EXPIRES_IN || '1h') as SignOptions['expiresIn'];

export interface UserPayload {
  id: string;
  email: string;
  role: string;
}


export const generateToken = (user: IUser): string => {
  const payload: UserPayload = {
    id: user.id.toString(),
    email: user.email,
    role: user.role,
  };

  const options: SignOptions = { expiresIn };

  return jwt.sign(payload, secretKey, options);
};



export const verifyToken = (token: string): UserPayload | null => {
  try {
    return jwt.verify(token, secretKey) as UserPayload;
  } catch {
    return null;
  }
};

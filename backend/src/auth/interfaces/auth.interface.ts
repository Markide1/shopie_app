import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: Role;
  };
  accessToken?: string;
}

export interface PasswordResetToken {
  token: string;
  userId: string;
  expiresAt: Date;
}

import { Request } from 'express';
import { Role } from '../users/role.enum.js';

export interface JwtPayload {
  sub: string;
  role: Role;
}

export type AuthenticatedRequest = Request & { user: JwtPayload };

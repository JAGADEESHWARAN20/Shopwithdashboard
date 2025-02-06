// lib/types.ts
import { IncomingMessage } from 'http';

export interface CustomRequest extends IncomingMessage {
  cookies: Partial<{ [key: string]: string }>;
}

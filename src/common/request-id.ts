import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

const VALID_REQUEST_ID = /^[A-Za-z0-9-]{1,64}$/;

export function resolveRequestId(req: IncomingMessage): string {
  if (typeof req.id === 'string') {
    return req.id;
  }
  const incoming = req.headers['x-request-id'];
  const id =
    typeof incoming === 'string' && VALID_REQUEST_ID.test(incoming)
      ? incoming
      : randomUUID();
  req.id = id;
  return id;
}

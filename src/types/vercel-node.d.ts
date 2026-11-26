declare module '@vercel/node' {
  import type { IncomingMessage, ServerResponse } from 'node:http';

  export interface VercelRequest extends IncomingMessage {
    body: any;
    cookies?: Record<string, string>;
    query: Record<string, string | string[] | undefined>;
  }

  export interface VercelResponse extends ServerResponse {
    json(body: unknown): this;
    send(body: unknown): this;
    status(code: number): this;
  }
}

import { app } from '../server/app'
import type { IncomingMessage, ServerResponse } from 'node:http'

/**
 * Vercel 原生 catch-all API。
 * /api/analyze、/api/rewrite、/api/export 会保留原始路径进入 Express。
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  app(req, res)
}

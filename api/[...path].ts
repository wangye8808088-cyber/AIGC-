import { app } from '../server/app'

/**
 * Vercel 原生 catch-all API。
 * /api/analyze、/api/rewrite、/api/export 会保留原始路径进入 Express。
 */
export default app

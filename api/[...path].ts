import type { IncomingMessage, ServerResponse } from 'node:http'

/**
 * Vercel 原生 catch-all API。
 * /api/analyze、/api/rewrite、/api/export 会保留原始路径进入 Express。
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.url?.startsWith('/api/health')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ ok: true }))
    return
  }

  try {
    const { app } = await import('../server/app.js')
    app(req, res)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown serverless startup error'
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(
      JSON.stringify({
        message: 'API 函数启动失败，请查看 Vercel Function Logs。',
        detail: message,
      }),
    )
  }
}

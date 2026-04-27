import serverless from 'serverless-http'
import { app } from '../server/app'

/**
 * Vercel Serverless：将同一套 Express 应用挂到 /api
 * 配合 vercel.json 中 rewrites: /api/(.*) -> /api
 */
export default serverless(app, {
  binary: ['*/*'],
})

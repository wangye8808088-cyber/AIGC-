import { Router } from 'express'
import { z } from 'zod'
import { buildDocHtml, buildDocxBuffer } from '../services/documentExporter.js'

const exportSchema = z.object({
  text: z.string().min(1),
  format: z.enum(['txt', 'docx', 'doc']),
})

const router = Router()

function encodeFilename(filename: string) {
  return encodeURIComponent(filename).replaceAll('%20', '+')
}

router.post('/', async (req, res) => {
  try {
    const body = exportSchema.parse(req.body)
    const filename = `aigc-rewrite-result.${body.format}`

    if (body.format === 'txt') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeFilename(filename)}`)
      return res.send(body.text)
    }

    if (body.format === 'doc') {
      res.setHeader('Content-Type', 'application/msword; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeFilename(filename)}`)
      return res.send(buildDocHtml(body.text))
    }

    const buffer = await buildDocxBuffer(body.text)
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    )
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeFilename(filename)}`)
    return res.send(buffer)
  } catch {
    return res.status(400).json({ message: '导出失败，请检查文本内容。' })
  }
})

export default router

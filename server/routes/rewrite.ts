import { Router } from 'express'
import multer from 'multer'
import { z } from 'zod'
import { rewriteTextRequestSchema } from '../../src/types/rewrite'
import { isDocx, isLegacyDoc, parseDocx } from '../services/documentParser'
import { hasLlmConfig, rewriteTextWithLlm } from '../services/llmDetector'
import { rewriteTextWithMock } from '../services/mockRewriter'
import { assertTextLength, getErrorMessage } from './shared'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
})

const router = Router()

async function rewriteText(text: string, sourceType: 'text' | 'docx') {
  if (!hasLlmConfig()) {
    return rewriteTextWithMock(text, sourceType)
  }

  return rewriteTextWithLlm(text, sourceType)
}

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (req.file) {
      if (isLegacyDoc(req.file.originalname, req.file.mimetype)) {
        return res.status(400).json({
          message: '暂不支持旧版 DOC，请另存为 DOCX 后上传。',
        })
      }

      if (!isDocx(req.file.originalname, req.file.mimetype)) {
        return res.status(400).json({
          message: '仅支持 DOCX 文档，或直接粘贴文本进行改写。',
        })
      }

      const text = await parseDocx(req.file.buffer)
      assertTextLength(text)
      return res.json(await rewriteText(text, 'docx'))
    }

    const body = rewriteTextRequestSchema.parse(req.body)
    assertTextLength(body.text)
    return res.json(await rewriteText(body.text, body.sourceType))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: '请求格式不正确，请检查输入内容。' })
    }

    if (error instanceof Error && error.name === 'BadRequest') {
      return res.status(400).json({ message: error.message })
    }

    return res.status(500).json({
      message: getErrorMessage(error, '改写失败，请稍后重试。'),
    })
  }
})

export default router

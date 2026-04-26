import { Router } from 'express'
import multer from 'multer'
import { z } from 'zod'
import { textAnalysisRequestSchema } from '../../src/types/analysis'
import { isDocx, isLegacyDoc, parseDocx } from '../services/documentParser'
import { analyzeTextWithMock } from '../services/mockDetector'

const MAX_TEXT_LENGTH = 12_000
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
})

const router = Router()

function assertTextLength(text: string) {
  if (text.trim().length === 0) {
    const error = new Error('文本为空，请粘贴内容或上传包含正文的 DOCX 文档。')
    error.name = 'BadRequest'
    throw error
  }

  if (text.length > MAX_TEXT_LENGTH) {
    const error = new Error('文本过长，请拆分为较短内容后重新检测。')
    error.name = 'BadRequest'
    throw error
  }
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
          message: '仅支持 DOCX 文档，或直接粘贴文本进行检测。',
        })
      }

      const text = await parseDocx(req.file.buffer)
      assertTextLength(text)
      return res.json(analyzeTextWithMock(text, 'docx'))
    }

    const body = textAnalysisRequestSchema.parse(req.body)
    assertTextLength(body.text)
    return res.json(analyzeTextWithMock(body.text, body.sourceType))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: '请求格式不正确，请检查输入内容。' })
    }

    if (error instanceof Error && error.name === 'BadRequest') {
      return res.status(400).json({ message: error.message })
    }

    return res.status(500).json({ message: '检测失败，请稍后重试。' })
  }
})

export default router

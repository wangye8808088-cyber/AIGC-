export const MAX_TEXT_LENGTH = 12_000

export function assertTextLength(text: string) {
  if (text.trim().length === 0) {
    const error = new Error('文本为空，请粘贴内容或上传包含正文的 DOCX 文档。')
    error.name = 'BadRequest'
    throw error
  }

  if (text.length > MAX_TEXT_LENGTH) {
    const error = new Error('文本过长，请拆分为较短内容后重新处理。')
    error.name = 'BadRequest'
    throw error
  }
}

export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

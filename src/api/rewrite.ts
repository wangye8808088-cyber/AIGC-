import { parseRewriteResponse, type RewriteResult } from '@/types/rewrite'

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string }
    return body.message || '改写失败，请稍后重试。'
  } catch {
    return '改写失败，请稍后重试。'
  }
}

export async function rewriteText(text: string, signal?: AbortSignal): Promise<RewriteResult> {
  const response = await fetch('/api/rewrite', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      sourceType: 'text',
      locale: 'zh',
    }),
    signal,
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return parseRewriteResponse(await response.json())
}

export async function rewriteFile(file: File, signal?: AbortSignal): Promise<RewriteResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('locale', 'zh')

  const response = await fetch('/api/rewrite', {
    method: 'POST',
    body: formData,
    signal,
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return parseRewriteResponse(await response.json())
}

export async function downloadRewrite(text: string, format: 'txt' | 'docx' | 'doc') {
  const response = await fetch('/api/export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, format }),
  })

  if (!response.ok) {
    throw new Error('导出失败，请稍后重试。')
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `aigc-rewrite-result.${format}`
  anchor.click()
  URL.revokeObjectURL(url)
}

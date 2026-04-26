import { parseAnalysisResponse, type AnalysisResult } from '@/types/analysis'

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string }
    return body.message || '检测失败，请稍后重试。'
  } catch {
    return '检测失败，请稍后重试。'
  }
}

export async function analyzeText(text: string, signal?: AbortSignal): Promise<AnalysisResult> {
  const response = await fetch('/api/analyze', {
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

  return parseAnalysisResponse(await response.json())
}

export async function analyzeFile(file: File, signal?: AbortSignal): Promise<AnalysisResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('locale', 'zh')

  const response = await fetch('/api/analyze', {
    method: 'POST',
    body: formData,
    signal,
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return parseAnalysisResponse(await response.json())
}

import { ref } from 'vue'
import { analyzeFile, analyzeText } from '@/api/analyze'
import type { AnalysisResult } from '@/types/analysis'

export type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error'

export function useAigcAnalysis() {
  const status = ref<AnalysisStatus>('idle')
  const result = ref<AnalysisResult | null>(null)
  const errorMessage = ref('')
  let controller: AbortController | null = null

  function resetResult() {
    result.value = null
    errorMessage.value = ''
  }

  function abort() {
    controller?.abort()
    controller = null
  }

  async function run(task: (signal: AbortSignal) => Promise<AnalysisResult>) {
    abort()
    controller = new AbortController()
    status.value = 'loading'
    resetResult()

    try {
      result.value = await task(controller.signal)
      status.value = 'success'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      status.value = 'error'
      errorMessage.value = error instanceof Error ? error.message : '检测失败，请稍后重试。'
    } finally {
      controller = null
    }
  }

  function submitText(text: string) {
    return run((signal) => analyzeText(text, signal))
  }

  function submitFile(file: File) {
    return run((signal) => analyzeFile(file, signal))
  }

  return {
    status,
    result,
    errorMessage,
    submitText,
    submitFile,
    abort,
  }
}

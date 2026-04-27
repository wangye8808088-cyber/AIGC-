import { ref } from 'vue'
import { rewriteFile, rewriteText } from '@/api/rewrite'
import type { RewriteResult } from '@/types/rewrite'

export type RewriteStatus = 'idle' | 'loading' | 'success' | 'error'

export function useAigcRewrite() {
  const status = ref<RewriteStatus>('idle')
  const result = ref<RewriteResult | null>(null)
  const errorMessage = ref('')
  let controller: AbortController | null = null

  function reset() {
    result.value = null
    errorMessage.value = ''
  }

  function abort() {
    controller?.abort()
    controller = null
  }

  async function run(task: (signal: AbortSignal) => Promise<RewriteResult>): Promise<RewriteResult | null> {
    abort()
    controller = new AbortController()
    status.value = 'loading'
    reset()

    try {
      const nextResult = await task(controller.signal)
      result.value = nextResult
      status.value = 'success'
      return nextResult
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return null
      status.value = 'error'
      errorMessage.value = error instanceof Error ? error.message : '改写失败，请稍后重试。'
      return null
    } finally {
      controller = null
    }
  }

  function submitText(text: string) {
    return run((signal) => rewriteText(text, signal))
  }

  function submitFile(file: File) {
    return run((signal) => rewriteFile(file, signal))
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

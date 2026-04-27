import { ref } from 'vue'

const STORAGE_KEY = 'aigc-guard-shared-text'

const _sharedText = ref<string>('')

export function useSharedText() {
  function setSharedText(text: string) {
    _sharedText.value = text
    try {
      sessionStorage.setItem(STORAGE_KEY, text)
    } catch {
      // ignore
    }
  }

  function popSharedText(): string {
    let text = _sharedText.value
    if (!text) {
      try {
        text = sessionStorage.getItem(STORAGE_KEY) ?? ''
      } catch {
        text = ''
      }
    }
    _sharedText.value = ''
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    return text
  }

  return { setSharedText, popSharedText }
}

/**
 * Module-level shared state for passing detect-page input to the reduce page.
 * Text is backed by sessionStorage for page-refresh resilience.
 * File lives in memory only (cannot be serialized).
 */
import { ref } from 'vue'

const TEXT_KEY = 'aigc-guard-shared-text'

const _text = ref('')
const _file = ref<File | null>(null)

export function useSharedInput() {
  /* ── Setters ──────────────────────────────────────── */

  function setSharedText(text: string) {
    _text.value = text
    _file.value = null
    try { sessionStorage.setItem(TEXT_KEY, text) } catch { /* ignore */ }
  }

  function setSharedFile(file: File) {
    _file.value = file
    _text.value = ''
    try { sessionStorage.removeItem(TEXT_KEY) } catch { /* ignore */ }
  }

  /* ── Pop (consume once) ───────────────────────────── */

  function popSharedInput(): { mode: 'text'; text: string } | { mode: 'file'; file: File } | null {
    // File has priority (in-memory only)
    if (_file.value) {
      const file = _file.value
      _file.value = null
      return { mode: 'file', file }
    }

    // Text: check in-memory first, then sessionStorage
    let text = _text.value
    if (!text) {
      try { text = sessionStorage.getItem(TEXT_KEY) ?? '' } catch { text = '' }
    }
    _text.value = ''
    try { sessionStorage.removeItem(TEXT_KEY) } catch { /* ignore */ }

    if (text) return { mode: 'text', text }

    return null
  }

  return { setSharedText, setSharedFile, popSharedInput }
}

import { describe, expect, it } from 'vitest'
import { hasLlmConfig, normalizeDeepSeekBaseUrl } from './llmDetector'

describe('llmDetector config helpers', () => {
  it('detects DeepSeek config from environment values', () => {
    expect(hasLlmConfig({ DEEPSEEK_API_KEY: 'sk-test' })).toBe(true)
    expect(hasLlmConfig({ LLM_API_KEY: 'sk-test' })).toBe(true)
    expect(hasLlmConfig({})).toBe(false)
  })

  it('normalizes the DeepSeek chat completions endpoint', () => {
    expect(normalizeDeepSeekBaseUrl('https://api.deepseek.com')).toBe(
      'https://api.deepseek.com/v1/chat/completions',
    )
    expect(normalizeDeepSeekBaseUrl('https://api.deepseek.com/v1')).toBe(
      'https://api.deepseek.com/v1/chat/completions',
    )
  })
})

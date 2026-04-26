import { describe, expect, it } from 'vitest'
import { analyzeTextWithMock } from './mockDetector'

describe('analyzeTextWithMock', () => {
  it('returns a higher score for template-heavy text', () => {
    const result = analyzeTextWithMock(
      '综上所述，我们应该高度重视这一问题。首先，其次，最后，这不仅有利于发展，也有利于进步。',
    )

    expect(result.score).toBeGreaterThanOrEqual(60)
    expect(result.evidences.length).toBeGreaterThan(0)
  })

  it('marks very short text as uncertain', () => {
    const result = analyzeTextWithMock('你好。')

    expect(result.level).toBe('uncertain')
  })
})

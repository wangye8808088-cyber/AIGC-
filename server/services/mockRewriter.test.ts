import { describe, expect, it } from 'vitest'
import { rewriteTextWithMock } from './mockRewriter'

describe('rewriteTextWithMock', () => {
  it('replaces common template phrases with more concrete wording', () => {
    const result = rewriteTextWithMock('综上所述，我们应该高度重视这一问题。首先，其次，最后。')

    expect(result.rewrittenText).not.toContain('综上所述')
    expect(result.changedPoints.length).toBeGreaterThan(0)
  })
})

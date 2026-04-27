import { describe, expect, it } from 'vitest'
import { stabilizeRewriteResult } from './rewriteStabilizer'
import { getStableRiskScore } from './stableScoring'

describe('stabilizeRewriteResult', () => {
  it('removes high-risk template phrases from rewritten text', () => {
    const result = stabilizeRewriteResult({
      rewrittenText: '综上所述，我们应该高度重视这一问题。因此，我们应该积极推动发展。',
      summary: '已改写。',
      changedPoints: ['初步改写。'],
    })

    expect(result.rewrittenText).not.toContain('综上所述')
    expect(result.rewrittenText).not.toContain('高度重视')
    expect(result.changedPoints).toContain('二次清理了残留的模板化表达。')
  })

  it('keeps stabilized rewritten text under the 30 percent target when possible', () => {
    const result = stabilizeRewriteResult({
      rewrittenText:
        '人工智能能提升学习效率，也能促进教学模式完善。这些变化对学生发展和教育质量都有积极意义。',
      summary: '已改写。',
      changedPoints: ['初步改写。'],
    })

    expect(getStableRiskScore(result.rewrittenText).score).toBeLessThan(30)
  })
})

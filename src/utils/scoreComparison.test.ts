import { describe, expect, it } from 'vitest'
import { getScoreComparison } from './scoreComparison'

describe('getScoreComparison', () => {
  it('formats a lower rewritten score', () => {
    const comparison = getScoreComparison(77, 24)

    expect(comparison.delta).toBe(53)
    expect(comparison.message).toBe('本次检测从 77% 降为 24%，降低 53 个百分点。')
  })

  it('formats an unchanged or higher rewritten score', () => {
    const comparison = getScoreComparison(24, 30)

    expect(comparison.delta).toBe(-6)
    expect(comparison.message).toBe('本次检测从 24% 变为 30%，未达到降低效果。')
  })
})

import { describe, expect, it } from 'vitest'
import { parseAnalysisResponse } from './analysis'

describe('parseAnalysisResponse', () => {
  it('accepts a valid AIGC analysis result', () => {
    const result = parseAnalysisResponse({
      score: 68,
      level: 'high',
      summary: '文本存在较高 AIGC 风险。',
      evidences: [
        {
          text: '综上所述，我们应该高度重视这一问题。',
          type: '模板化总结',
          reason: '表达较泛化，缺少具体事实支撑。',
          confidence: 76,
        },
      ],
      suggestions: ['补充真实经历、数据或上下文。'],
      meta: {
        model: 'mock-detector',
        wordCount: 23,
      },
    })

    expect(result.score).toBe(68)
    expect(result.evidences).toHaveLength(1)
  })

  it('rejects a score outside 0-100', () => {
    expect(() =>
      parseAnalysisResponse({
        score: 120,
        level: 'high',
        summary: 'invalid',
        evidences: [],
        suggestions: [],
      }),
    ).toThrow()
  })
})

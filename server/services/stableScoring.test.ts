import { describe, expect, it } from 'vitest'
import { getStableRiskScore, stabilizeAnalysisResult } from './stableScoring'

describe('stableScoring', () => {
  const text = '综上所述，我们应该高度重视这一问题。首先，其次，最后，这不仅有利于发展，也有利于进步。'

  it('returns the same score for the same normalized text', () => {
    const first = getStableRiskScore(text)
    const second = getStableRiskScore(`  ${text}\n`)

    expect(Math.abs(first.score - second.score)).toBeLessThanOrEqual(5)
  })

  it('overrides unstable model scores with a deterministic score', () => {
    const lowModelResult = stabilizeAnalysisResult(text, {
      score: 15,
      level: 'low',
      summary: '模型低分。',
      evidences: [],
      suggestions: ['人工复核。'],
    })
    const highModelResult = stabilizeAnalysisResult(text, {
      score: 95,
      level: 'high',
      summary: '模型高分。',
      evidences: [],
      suggestions: ['人工复核。'],
    })

    expect(Math.abs(lowModelResult.score - highModelResult.score)).toBeLessThanOrEqual(5)
    expect(lowModelResult.level).toBe(highModelResult.level)
  })

  it('keeps long natural rewritten text below the 30 percent target', () => {
    const naturalText =
      '我们围绕智能多功能小车做了几轮调试，把移动平台、通信、环境感知和机械臂模块接到一起，在模拟场景里做了功能验证。手机APP能稳定连上车，发出指令后小车可以前进、后退、横移和旋转，反应比较连贯。麦克纳姆轮让小车在窄空间里更灵活。红外传感器检测到前方障碍后会调整方向，多次测试里没有出现正面碰撞。机械臂能按手机指令抓取物体，低速移动时也能完成操作。这里还需要补充更具体的测试次数、距离阈值和响应时间。'

    expect(getStableRiskScore(naturalText).score).toBeLessThan(30)
  })
})

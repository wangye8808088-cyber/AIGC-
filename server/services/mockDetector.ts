import type { AnalysisLevel, AnalysisResult, Evidence } from '../../src/types/analysis.js'

const templatePatterns = [
  { phrase: '综上所述', type: '模板化总结' },
  { phrase: '高度重视', type: '抽象号召' },
  { phrase: '具有重要意义', type: '泛化表达' },
  { phrase: '首先', type: '机械结构' },
  { phrase: '其次', type: '机械结构' },
  { phrase: '最后', type: '机械结构' },
  { phrase: '不仅', type: '对称句式' },
  { phrase: '而且', type: '对称句式' },
  { phrase: '有利于', type: '泛化收益' },
] as const

function getLevel(score: number, wordCount: number, evidenceCount: number): AnalysisLevel {
  if (wordCount < 20 || evidenceCount === 0) return 'uncertain'
  if (score >= 66) return 'high'
  if (score >= 36) return 'medium'
  return 'low'
}

function getWordCount(text: string) {
  return text.replace(/\s+/g, '').length
}

function buildEvidence(text: string): Evidence[] {
  const evidences: Evidence[] = []

  for (const pattern of templatePatterns) {
    const index = text.indexOf(pattern.phrase)
    if (index === -1) continue

    const start = Math.max(0, index - 18)
    const end = Math.min(text.length, index + pattern.phrase.length + 28)
    evidences.push({
      text: text.slice(start, end),
      type: pattern.type,
      reason: `检测到「${pattern.phrase}」等较常见的模板化表达，建议补充更具体的事实、场景或个人判断。`,
      confidence: Math.min(92, 62 + evidences.length * 5),
    })

    if (evidences.length >= 5) break
  }

  return evidences
}

export function analyzeTextWithMock(text: string, sourceType: 'text' | 'docx' = 'text'): AnalysisResult {
  const normalizedText = text.trim()
  const wordCount = getWordCount(normalizedText)
  const evidences = buildEvidence(normalizedText)
  const lengthBonus = wordCount > 500 ? 8 : wordCount > 160 ? 4 : 0
  const score = Math.min(100, Math.max(0, 18 + evidences.length * 14 + lengthBonus))
  const level = getLevel(score, wordCount, evidences.length)

  return {
    score,
    level,
    summary:
      level === 'uncertain'
        ? '文本信息较少或证据不足，建议补充更多上下文后再检测。'
        : `该文本存在${score}% 的 AIGC 风险可能性，请结合证据片段进行人工复核。`,
    evidences,
    suggestions: [
      '补充真实经历、数据来源、时间地点或具体案例。',
      '减少空泛口号和过于工整的总分总表达。',
      '将结论改写为更具体的判断，并说明判断依据。',
    ],
    meta: {
      model: 'mock-detector',
      wordCount,
      sourceType,
    },
  }
}

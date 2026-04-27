import type { AnalysisLevel, AnalysisResult } from '../../src/types/analysis'

const templatePhrases = [
  '综上所述',
  '高度重视',
  '具有重要意义',
  '首先',
  '其次',
  '最后',
  '不仅',
  '而且',
  '有利于',
  '推动',
  '促进',
  '提升',
  '完善',
]

export function normalizeTextForScoring(text: string) {
  return text.replace(/\s+/g, '').trim()
}

function getLevel(score: number, wordCount: number): AnalysisLevel {
  if (wordCount < 20) return 'uncertain'
  if (score >= 66) return 'high'
  if (score >= 36) return 'medium'
  return 'low'
}

function countOccurrences(text: string, phrase: string) {
  return text.split(phrase).length - 1
}

export function getStableRiskScore(text: string) {
  const normalizedText = normalizeTextForScoring(text)
  const wordCount = normalizedText.length
  const phraseHits = templatePhrases.reduce(
    (count, phrase) => count + countOccurrences(normalizedText, phrase),
    0,
  )
  const abstractHits = (normalizedText.match(/问题|发展|进步|意义|价值|效率|质量/g) ?? []).length
  const punctuationCount = (normalizedText.match(/[，。；：！？、]/g) ?? []).length
  const punctuationDensity = wordCount > 0 ? punctuationCount / wordCount : 0
  const structureBonus = /首先.*其次|一方面.*另一方面|不仅.*而且/.test(normalizedText) ? 14 : 0
  const abstractBonus = phraseHits > 0 || abstractHits >= 3 ? 8 : 0
  const lengthBonus = wordCount > 800 ? 8 : wordCount > 300 ? 5 : wordCount > 120 ? 3 : 0
  const densityBonus = punctuationDensity > 0.08 ? 4 : 0
  const score = Math.min(
    100,
    Math.max(0, Math.round(16 + phraseHits * 9 + structureBonus + abstractBonus + lengthBonus + densityBonus)),
  )

  return {
    score,
    level: getLevel(score, wordCount),
    wordCount,
  }
}

export function stabilizeAnalysisResult(text: string, result: AnalysisResult): AnalysisResult {
  const stable = getStableRiskScore(text)

  return {
    ...result,
    score: stable.score,
    level: stable.level,
    summary:
      stable.level === 'uncertain'
        ? '文本信息较少或稳定证据不足，建议补充更多上下文后再检测。'
        : `该文本存在${stable.score}% 的 AIGC 风险可能性，请结合证据片段进行人工复核。`,
    meta: {
      ...result.meta,
      wordCount: stable.wordCount,
    },
  }
}

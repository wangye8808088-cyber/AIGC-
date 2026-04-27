import { createHash } from 'node:crypto'
import type { AnalysisResult } from '../../src/types/analysis.js'
import { normalizeTextForScoring } from './stableScoring.js'

const cache = new Map<string, AnalysisResult>()

export function getAnalysisCacheKey(text: string, model: string, sourceType: 'text' | 'docx') {
  const hash = createHash('sha256').update(normalizeTextForScoring(text)).digest('hex')
  return `${model}:${sourceType}:${hash}`
}

export function getCachedAnalysis(key: string) {
  return cache.get(key)
}

export function setCachedAnalysis(key: string, result: AnalysisResult) {
  cache.set(key, result)
}

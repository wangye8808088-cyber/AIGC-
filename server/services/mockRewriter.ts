import type { RewriteResult } from '../../src/types/rewrite.js'
import { stabilizeRewriteResult } from './rewriteStabilizer.js'

const replacements: Array<[string, string]> = [
  ['综上所述，', '结合上面的内容来看，'],
  ['高度重视', '结合具体场景认真处理'],
  ['具有重要意义', '会对实际结果产生影响'],
  ['首先，', '第一个需要说明的是，'],
  ['其次，', '另一个值得注意的点是，'],
  ['最后，', '收尾时可以看到，'],
  ['不仅', '一方面'],
  ['而且', '另一方面'],
  ['有利于', '可能帮助'],
]

export function rewriteTextWithMock(text: string, sourceType: 'text' | 'docx' = 'text'): RewriteResult {
  let rewrittenText = text.trim()
  const changedPoints: string[] = []

  for (const [from, to] of replacements) {
    if (!rewrittenText.includes(from)) continue
    rewrittenText = rewrittenText.replaceAll(from, to)
    changedPoints.push(`将「${from}」调整为更具体、少模板化的表达。`)
  }

  if (changedPoints.length === 0) {
    changedPoints.push('保留原意，建议补充真实经历、数据或具体场景来增强人工表达特征。')
    rewrittenText = `${rewrittenText}\n\n建议补充：这里可以加入你的真实经历、时间地点、数据来源或具体判断依据。`
  }

  return stabilizeRewriteResult({
    rewrittenText,
    summary: '已在不改变核心意思的前提下，降低模板化表达并增强具体性。',
    changedPoints,
    meta: {
      model: 'mock-rewriter',
      sourceType,
    },
  })
}

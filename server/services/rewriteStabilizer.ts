import type { RewriteResult } from '../../src/types/rewrite'

const cleanupRules: Array<[RegExp, string]> = [
  [/综上所述[，,]?/g, '结合前面的内容，'],
  [/高度重视/g, '结合具体情况认真处理'],
  [/具有重要意义/g, '会带来实际影响'],
  [/因此，我们应该/g, '接下来可以'],
  [/首先[，,]?/g, '先看一个关键点，'],
  [/其次[，,]?/g, '再看另一个层面，'],
  [/最后[，,]?/g, '回到实际落地，'],
  [/不仅/g, '一方面'],
  [/而且/g, '另一方面'],
  [/有利于/g, '可能帮助'],
  [/积极推动/g, '稳妥推进'],
  [/推动/g, '带来'],
  [/促进/g, '帮助形成'],
  [/提升/g, '改善'],
  [/完善/g, '补齐'],
  [/学生发展/g, '学生的具体学习过程'],
  [/学习效率/g, '学习进度'],
  [/教育质量/g, '课堂效果'],
  [/系统质量/g, '系统表现'],
  [/整体质量/g, '整体表现'],
  [/发展/g, '后续变化'],
  [/进步/g, '改善'],
  [/意义/g, '作用'],
  [/价值/g, '作用'],
  [/问题/g, '情况'],
]

export function stabilizeRewriteResult(result: RewriteResult): RewriteResult {
  let rewrittenText = result.rewrittenText
  let changed = false

  for (const [pattern, replacement] of cleanupRules) {
    if (!pattern.test(rewrittenText)) continue
    pattern.lastIndex = 0
    rewrittenText = rewrittenText.replace(pattern, replacement)
    changed = true
  }

  if (!changed) return result

  const changedPoints = result.changedPoints.includes('二次清理了残留的模板化表达。')
    ? result.changedPoints
    : [...result.changedPoints, '二次清理了残留的模板化表达。']

  return {
    ...result,
    rewrittenText,
    changedPoints,
  }
}

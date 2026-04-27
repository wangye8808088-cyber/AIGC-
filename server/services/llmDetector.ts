import { analysisResultSchema, type AnalysisResult } from '../../src/types/analysis.js'
import { rewriteResultSchema, type RewriteResult } from '../../src/types/rewrite.js'
import { getAnalysisCacheKey, getCachedAnalysis, setCachedAnalysis } from './analysisCache.js'
import { stabilizeRewriteResult } from './rewriteStabilizer.js'
import { stabilizeAnalysisResult } from './stableScoring.js'

type EnvLike = Record<string, string | undefined>

type DeepSeekMessage = {
  role: 'system' | 'user'
  content: string
}

type DeepSeekResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

const defaultModel = 'deepseek-v4-flash'
const defaultBaseUrl = 'https://api.deepseek.com/v1/chat/completions'

export function hasLlmConfig(env: EnvLike = process.env): boolean {
  return Boolean(env.DEEPSEEK_API_KEY || env.LLM_API_KEY)
}

export function normalizeDeepSeekBaseUrl(baseUrl = 'https://api.deepseek.com'): string {
  const trimmed = baseUrl.replace(/\/+$/, '')
  if (trimmed.endsWith('/chat/completions')) return trimmed
  if (trimmed.endsWith('/v1')) return `${trimmed}/chat/completions`
  return `${trimmed}/v1/chat/completions`
}

function buildMessages(text: string): DeepSeekMessage[] {
  return [
    {
      role: 'system',
      content:
        '你是一个中文文本 AIGC 风险分析助手。你只能输出 JSON，不要输出 Markdown。检测结果仅表示风险可能性，不能作为唯一判断依据。不要编造原文不存在的片段。',
    },
    {
      role: 'user',
      content: `请分析以下文本的 AIGC 风险，并严格返回这个 JSON 结构：
{
  "score": 0-100 的整数,
  "level": "low" | "medium" | "high" | "uncertain",
  "summary": "一句简体中文总结",
  "evidences": [
    {
      "text": "原文中的具体片段",
      "type": "风险类型",
      "reason": "为什么这个片段有 AIGC 风险",
      "confidence": 0-100 的整数
    }
  ],
  "suggestions": ["人工复核或提升真实性的建议"]
}

评分规则：0-35 为 low，36-65 为 medium，66-100 为 high；证据不足时用 uncertain。

待检测文本：
${text}`,
    },
  ]
}

function buildRewriteMessages(text: string): DeepSeekMessage[] {
  return [
    {
      role: 'system',
      content:
        '你是一个中文写作润色助手。你的任务是降低文本的模板化和 AIGC 风险，同时保留原意与信息量。不要编造新事实，不要让文本用于欺骗检测。只能输出 JSON，不要输出 Markdown。',
    },
    {
      role: 'user',
      content: `请在不编造事实的前提下，生成一版更像人工写作的完整改写文本，并严格返回这个 JSON 结构：
{
  "rewrittenText": "完整改写后的文本",
  "summary": "一句简体中文总结",
  "changedPoints": ["说明做了哪些修改"]
}

改写要求：
1. 尽量让改写后的文本在再次检测时进入低风险区间（目标 35% 以下）。
2. 保留原文事实与核心观点，长度尽量不低于原文的 70%，不要简单缩短来规避风险。
3. 移除或改写这些高风险表达：综上所述、高度重视、具有重要意义、首先、其次、最后、不仅、而且、有利于、积极推动。
4. 尽量减少这些抽象词：问题、发展、进步、意义、价值、效率、质量；必要时换成更具体的场景表达。
5. 将空泛结论改成更自然的人工表达；如果缺少事实，只能写成“这里需要补充具体例子/数据”，不能自行编造。
6. 避免整齐排比、口号式总结、过度概括，保持段落自然。
7. 输出简体中文。

原文：
${text}`,
    },
  ]
}

function parseJsonContent(content: string): unknown {
  const trimmed = content.trim()
  const withoutFence = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim()

  return JSON.parse(withoutFence)
}

export async function analyzeTextWithLlm(
  text: string,
  sourceType: 'text' | 'docx',
  env: EnvLike = process.env,
): Promise<AnalysisResult> {
  const apiKey = env.DEEPSEEK_API_KEY || env.LLM_API_KEY
  if (!apiKey) {
    throw new Error('缺少 DeepSeek API Key。')
  }

  const endpoint = normalizeDeepSeekBaseUrl(env.DEEPSEEK_BASE_URL || env.LLM_BASE_URL || defaultBaseUrl)
  const model = env.DEEPSEEK_MODEL || env.LLM_MODEL || defaultModel
  const cacheKey = getAnalysisCacheKey(text, model, sourceType)
  const cached = getCachedAnalysis(cacheKey)
  if (cached) return cached

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: buildMessages(text),
      temperature: 0,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    throw new Error(`DeepSeek 调用失败：${response.status}`)
  }

  const data = (await response.json()) as DeepSeekResponse
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('DeepSeek 返回内容为空。')
  }

  const parsed = stabilizeAnalysisResult(text, analysisResultSchema.parse(parseJsonContent(content)))
  const result = {
    ...parsed,
    meta: {
      ...parsed.meta,
      model,
      sourceType,
    },
  }
  setCachedAnalysis(cacheKey, result)
  return result
}

export async function rewriteTextWithLlm(
  text: string,
  sourceType: 'text' | 'docx',
  env: EnvLike = process.env,
): Promise<RewriteResult> {
  const apiKey = env.DEEPSEEK_API_KEY || env.LLM_API_KEY
  if (!apiKey) {
    throw new Error('缺少 DeepSeek API Key。')
  }

  const endpoint = normalizeDeepSeekBaseUrl(env.DEEPSEEK_BASE_URL || env.LLM_BASE_URL || defaultBaseUrl)
  const model = env.DEEPSEEK_MODEL || env.LLM_MODEL || defaultModel

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: buildRewriteMessages(text),
      temperature: 0.2,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    throw new Error(`DeepSeek 调用失败：${response.status}`)
  }

  const data = (await response.json()) as DeepSeekResponse
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('DeepSeek 返回内容为空。')
  }

  const parsed = stabilizeRewriteResult(rewriteResultSchema.parse(parseJsonContent(content)))
  return {
    ...parsed,
    meta: {
      ...parsed.meta,
      model,
      sourceType,
    },
  }
}

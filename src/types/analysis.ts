import { z } from 'zod'

export const analysisLevelSchema = z.enum(['low', 'medium', 'high', 'uncertain'])

export const evidenceSchema = z.object({
  text: z.string().min(1),
  type: z.string().min(1),
  reason: z.string().min(1),
  confidence: z.number().int().min(0).max(100),
})

export const analysisResultSchema = z.object({
  score: z.number().int().min(0).max(100),
  level: analysisLevelSchema,
  summary: z.string().min(1),
  evidences: z.array(evidenceSchema),
  suggestions: z.array(z.string().min(1)),
  meta: z
    .object({
      model: z.string().optional(),
      wordCount: z.number().int().nonnegative().optional(),
      sourceType: z.enum(['text', 'docx']).optional(),
    })
    .optional(),
})

export const textAnalysisRequestSchema = z.object({
  text: z.string().min(1),
  sourceType: z.literal('text'),
  locale: z.enum(['zh', 'en']).optional(),
})

export type AnalysisLevel = z.infer<typeof analysisLevelSchema>
export type Evidence = z.infer<typeof evidenceSchema>
export type AnalysisResult = z.infer<typeof analysisResultSchema>
export type TextAnalysisRequest = z.infer<typeof textAnalysisRequestSchema>

export function parseAnalysisResponse(raw: unknown): AnalysisResult {
  return analysisResultSchema.parse(raw)
}

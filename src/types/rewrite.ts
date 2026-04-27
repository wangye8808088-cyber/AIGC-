import { z } from 'zod'

export const rewriteResultSchema = z.object({
  rewrittenText: z.string().min(1),
  summary: z.string().min(1),
  changedPoints: z.array(z.string().min(1)),
  meta: z
    .object({
      model: z.string().optional(),
      sourceType: z.enum(['text', 'docx']).optional(),
    })
    .optional(),
})

export const rewriteTextRequestSchema = z.object({
  text: z.string().min(1),
  sourceType: z.literal('text'),
  locale: z.enum(['zh', 'en']).optional(),
})

export type RewriteResult = z.infer<typeof rewriteResultSchema>
export type RewriteTextRequest = z.infer<typeof rewriteTextRequestSchema>

export function parseRewriteResponse(raw: unknown): RewriteResult {
  return rewriteResultSchema.parse(raw)
}

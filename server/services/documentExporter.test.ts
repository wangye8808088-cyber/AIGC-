import { describe, expect, it } from 'vitest'
import { buildDocHtml } from './documentExporter'

describe('documentExporter', () => {
  it('escapes html content for doc export', () => {
    const html = buildDocHtml('<script>alert(1)</script>')

    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>alert')
  })
})

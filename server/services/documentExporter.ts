import { Document, Packer, Paragraph, TextRun } from 'docx'

function escapeHtml(text: string) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function buildDocHtml(text: string) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll('\n', '<br />')}</p>`)
    .join('\n')

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>AIGC 改写结果</title>
  </head>
  <body>
    ${paragraphs}
  </body>
</html>`
}

export async function buildDocxBuffer(text: string): Promise<Buffer> {
  const document = new Document({
    sections: [
      {
        children: text.split(/\n{2,}/).map(
          (paragraph) =>
            new Paragraph({
              children: [new TextRun(paragraph)],
              spacing: { after: 240 },
            }),
        ),
      },
    ],
  })

  return Packer.toBuffer(document)
}

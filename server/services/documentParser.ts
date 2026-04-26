import mammoth from 'mammoth'

export async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer })
  return result.value.trim()
}

export function isDocx(filename: string, mimetype?: string): boolean {
  return (
    filename.toLowerCase().endsWith('.docx') ||
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
}

export function isLegacyDoc(filename: string, mimetype?: string): boolean {
  return filename.toLowerCase().endsWith('.doc') || mimetype === 'application/msword'
}

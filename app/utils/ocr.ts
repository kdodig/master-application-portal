import { extractText, getDocumentProxy } from 'unpdf'

/**
 * Perform OCR on a PDF file and return the extracted text.
 * @param src The PDF file to perform OCR on.
 * @returns The extracted text from the PDF file.
 *
 * @hint This function uses the `unpdf` library to extract text from PDF files for now but should
 * be replaced with a more robust solution in the future.
 */
export async function ocrPdf(src: File): Promise<string> {
  const arrayBuffer = await src.arrayBuffer()
  const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer))

  const { text: pages } = await extractText(pdf)

  return pages
    .map((page, index) => `Page ${index + 1}:\n${page}`)
    .join('\n\n')
}

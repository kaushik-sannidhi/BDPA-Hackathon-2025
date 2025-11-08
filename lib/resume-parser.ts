export async function parseResume(file: File): Promise<string> {
  const fileType = file.type;
  const arrayBuffer = await file.arrayBuffer();

  if (fileType === "application/pdf") {
    try {
      // Dynamic import for server-side only
      const pdfParse = (await import("pdf-parse")).default;
      const buffer = Buffer.from(arrayBuffer);
      const data = await pdfParse(buffer);
      // data.text may be undefined in some cases; ensure we return a string
      return data.text ?? "";
    } catch (error) {
      throw new Error("Failed to parse PDF file");
    }
  } else if (
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileType === "application/msword"
  ) {
    try {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      throw new Error("Failed to parse Word document");
    }
  } else if (fileType === "text/plain") {
    return await file.text();
  } else {
    throw new Error("Unsupported file type. Please upload PDF, Word, or text file.");
  }
}

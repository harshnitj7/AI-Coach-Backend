import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";

// Extracts raw text from an uploaded resume file so it can be sent to the AI.
// Currently supports PDF natively; DOC/DOCX are stubbed for a future mammoth.js integration.
export const extractTextFromResume = async (filePath: string): Promise<string> => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  }

  if (ext === ".doc" || ext === ".docx") {
    // For production, integrate a library like `mammoth` to extract .docx text.
    throw new Error("DOC/DOCX parsing not yet supported. Please upload a PDF.");
  }

  throw new Error("Unsupported file format");
};

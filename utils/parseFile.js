import { readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { ApiError } from "../errors/ApiError.js";

const extractFileExtention = (fileName) => {
  if (!fileName) return;

  let arr = String(fileName).split(".");
  return arr[arr.length - 1];
};

export const parseFile = async (file) => {
  const fileType = extractFileExtention(file.originalname);
  let result = null;

  if (fileType === "pdf") {
    const buffer = await readFile(file.path);
    const parser = new PDFParse({ data: buffer });
    const pdfData = await parser.getText();
    result = pdfData.text;
  } else if (fileType === "docx") {
    const docxFile = await mammoth.convertToHtml({ path: file.path });
    if (!docxFile) {
      throw new ApiError(400, "File Upload error");
    }

    result = docxFile.value;
  } else {
    throw new ApiError(400, "File type not supported");
  }

  return {
    filename: file.originalname,
    result,
  };
};

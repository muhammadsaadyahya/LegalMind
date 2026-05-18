import { PdfReader } from "pdfreader";

export const extractText = (filePath) => {
  return new Promise((resolve, reject) => {
    const pdfReader = new PdfReader();
    let fullText = "";
    let lastY = -1;

    // console.log("Starting PDF extraction for:", filePath);

    pdfReader.parseFileItems(filePath, (err, item) => {
      if (err) {
        console.error("PDF Extraction Error:", err);
        resolve("");
      } else if (!item) {
        // console.log("PDF extraction complete!");
        // console.log("Total characters extracted:", fullText.length);
        // console.log("Extracted text:", fullText.substring(0, 200) + "... ");
        resolve(fullText.trim());
      } else if (item.text) {
        if (lastY !== -1 && item.y !== lastY) {
          fullText += "\n";
        }
        fullText += item.text + " ";
        lastY = item.y;
      }
    });
  });
};
export const extractTextBuffer = (pdfBuffer) => {
  return new Promise((resolve, reject) => {
    const pdfReader = new PdfReader();
    let fullText = "";
    let lastY = -1;

    pdfReader.parseBuffer(pdfBuffer, (err, item) => {
      if (err) {
        console.error("PDF Extraction Error:", err);
        reject(new Error("Failed to parse PDF"));
      } else if (!item) {
        resolve({ text: fullText.trim() });
      } else if (item.text) {
        if (lastY !== -1 && item.y !== lastY) {
          fullText += "\n";
        }
        fullText += item.text + " ";
        lastY = item.y;
      }
    });
  });
};

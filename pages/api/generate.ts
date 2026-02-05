import { PDFDocument, rgb } from "pdf-lib";
import { NextApiRequest, NextApiResponse } from "next";

interface InvoiceItem {
  type: "work" | "purchase";
  day?: string;
  hours?: string;
  rate?: string;
  description?: string;
  quantity?: string;
  unitPrice?: string;
}

interface GenerateRequest {
  fullName: string;
  to: string;
  abn: string;
  clientName: string;
  clientEmail: string;
  invoiceNumber: string;
  date: string;
  items: InvoiceItem[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Buffer | { error: string }>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    fullName,
    to,
    abn,
    clientName,
    clientEmail,
    invoiceNumber,
    date,
    items,
  }: GenerateRequest = req.body;

  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    // Border
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Header
    page.drawText("INVOICE", {
      x: 50,
      y: height - 60,
      size: 30,
      color: rgb(0, 0.5, 0),
    });

    page.drawText(`Invoice Number: ${invoiceNumber}`, {
      x: 400,
      y: height - 60,
      size: 12,
    });
    page.drawText(`Date: ${date}`, { x: 400, y: height - 80, size: 12 });

    // From
    page.drawText("From:", {
      x: 50,
      y: height - 120,
      size: 14,
      color: rgb(0, 0, 0.5),
    });
    page.drawText(`${fullName}`, { x: 50, y: height - 140, size: 12 });
    page.drawText(`ABN: ${abn}`, { x: 50, y: height - 160, size: 12 });

    // To
    page.drawText("To:", {
      x: 300,
      y: height - 120,
      size: 14,
      color: rgb(0, 0, 0.5),
    });
    page.drawText(`${to}`, { x: 300, y: height - 140, size: 12 });
    page.drawText(`${clientName}`, { x: 300, y: height - 160, size: 12 });
    page.drawText(`${clientEmail}`, { x: 300, y: height - 180, size: 12 });

    // Items Table
    let y = height - 220;
    page.drawText("Items", { x: 50, y, size: 16, color: rgb(0, 0, 0.5) });
    y -= 30;

    // Table Header
    page.drawRectangle({
      x: 50,
      y: y - 5,
      width: 500,
      height: 20,
      color: rgb(0.9, 0.9, 0.9),
    });
    page.drawText("Description", { x: 55, y: y, size: 12 });
    page.drawText("Hours", { x: 250, y: y, size: 12 });
    page.drawText("Rate", { x: 350, y: y, size: 12 });
    page.drawText("Total", { x: 450, y: y, size: 12 });
    page.drawLine({ start: { x: 50, y }, end: { x: 550, y }, thickness: 1 });
    y -= 25;

    items.forEach((item) => {
      page.drawText(`${item.day || item.description}`, { x: 55, y, size: 12 });
      page.drawText(`${item.hours}`, { x: 250, y, size: 12 });
      page.drawText(`$${item.rate}`, { x: 350, y, size: 12 });
      page.drawText(
        `$${(parseFloat(item.hours || "0") * parseFloat(item.rate || "0")).toFixed(2)}`,
        {
          x: 450,
          y,
          size: 12,
        },
      );
      y -= 20;
    });

    // Total
    y -= 10;
    page.drawLine({ start: { x: 400, y }, end: { x: 550, y }, thickness: 1 });
    y -= 20;
    const total = items.reduce((sum, item) => {
      if (item.type === "work") {
        return (
          sum + parseFloat(item.hours || "0") * parseFloat(item.rate || "0")
        );
      } else {
        return (
          sum +
          parseFloat(item.quantity || "0") * parseFloat(item.unitPrice || "0")
        );
      }
    }, 0);
    page.drawText(`Total: $${total.toFixed(2)}`, {
      x: 400,
      y,
      size: 14,
      color: rgb(0, 0.5, 0),
    });

    // Footer
    page.drawText("Thank you for your business!", {
      x: 50,
      y: 50,
      size: 12,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Watermark
    page.drawText("Created with Invoice-MVP", {
      x: width / 2 - 100,
      y: 30,
      size: 10,
      color: rgb(0.7, 0.7, 0.7),
    });

    // Notes
    if (note) {
      let noteY = 100; // Position for notes
      page.drawText("Notes:", {
        x: 50,
        y: noteY,
        size: 14,
        color: rgb(0, 0, 0.5),
      });
      noteY -= 20;
      const noteLines = note.split("\n");
      noteLines.forEach((line) => {
        page.drawText(line, { x: 50, y: noteY, size: 12 });
        noteY -= 15;
      });
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice_${invoiceNumber}.pdf`,
    );
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
}

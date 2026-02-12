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
  abn: string;
  yourEmail: string;
  yourNumber: string;
  yourAddress: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  invoiceNumber: string;
  date: string;
  items: InvoiceItem[];
  notes?: string;
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
    abn,
    yourEmail,
    yourNumber,
    yourAddress,
    clientName,
    clientEmail,
    clientAddress,
    invoiceNumber,
    date,
    items,
    notes,
  }: GenerateRequest = req.body;

  try {
    // Format date as "day Month(3 letters) year" (e.g., "12 Feb 2026")
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString("en-US", { month: "short" });
    const year = dateObj.getFullYear();
    const formattedDate = `${day} ${month} ${year}`;

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

    // Header Section - Professional Layout
    page.drawText(fullName.toUpperCase(), {
      x: 50,
      y: height - 50,
      size: 18,
      color: rgb(0, 0.5, 0),
    });
    page.drawText("INVOICE", {
      x: 50,
      y: height - 75,
      size: 24,
      color: rgb(0, 0, 0),
    });

    // Invoice details (top right)
    page.drawText(`Invoice #${invoiceNumber}`, {
      x: width - 150,
      y: height - 50,
      size: 12,
      color: rgb(0, 0, 0),
    });
    page.drawText(`Date: ${formattedDate}`, {
      x: width - 150,
      y: height - 70,
      size: 11,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Divider line
    page.drawLine({
      start: { x: 50, y: height - 95 },
      end: { x: width - 50, y: height - 95 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    // From and To sections
    let sectionY = height - 130;

    // From section
    page.drawText("FROM", {
      x: 50,
      y: sectionY,
      size: 11,
      color: rgb(0, 0.5, 0),
    });
    sectionY -= 18;
    page.drawText(fullName, { x: 50, y: sectionY, size: 11 });
    sectionY -= 14;
    if (yourEmail) {
      page.drawText(yourEmail, { x: 50, y: sectionY, size: 10 });
      sectionY -= 12;
    }
    if (yourNumber) {
      page.drawText(yourNumber, { x: 50, y: sectionY, size: 10 });
      sectionY -= 12;
    }
    page.drawText(`ABN: ${abn}`, { x: 50, y: sectionY, size: 10 });
    sectionY -= 12;
    if (yourAddress) {
      page.drawText(yourAddress, { x: 50, y: sectionY, size: 10 });
    }

    // To section
    sectionY = height - 130;
    page.drawText("BILL TO", {
      x: 300,
      y: sectionY,
      size: 11,
      color: rgb(0, 0.5, 0),
    });
    sectionY -= 18;
    page.drawText(clientName, { x: 300, y: sectionY, size: 11 });
    sectionY -= 14;
    if (clientEmail) {
      page.drawText(clientEmail, { x: 300, y: sectionY, size: 10 });
      sectionY -= 12;
    }
    if (clientAddress) {
      page.drawText(clientAddress, { x: 300, y: sectionY, size: 10 });
    }

    // Divider line
    page.drawLine({
      start: { x: 50, y: height - 225 },
      end: { x: width - 50, y: height - 225 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    // Calculate total
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

    // Items Table
    let y = height - 260;
    page.drawText("ITEMS", {
      x: 50,
      y,
      size: 13,
      color: rgb(0, 0, 0),
    });
    y -= 25;

    // Table Header
    page.drawRectangle({
      x: 50,
      y: y - 20,
      width: 500,
      height: 20,
      color: rgb(0, 0.5, 0),
    });
    // Header borders
    page.drawLine({
      start: { x: 50, y: y - 20 },
      end: { x: 550, y: y - 20 },
      thickness: 1,
      color: rgb(0, 0.5, 0),
    });
    page.drawLine({
      start: { x: 50, y: y },
      end: { x: 550, y: y },
      thickness: 1,
      color: rgb(0, 0.5, 0),
    });

    page.drawText("Description", {
      x: 60,
      y: y - 13,
      size: 11,
      color: rgb(1, 1, 1),
    });
    page.drawText("Qty/Hours", {
      x: 300,
      y: y - 13,
      size: 11,
      color: rgb(1, 1, 1),
    });
    page.drawText("Rate", {
      x: 400,
      y: y - 13,
      size: 11,
      color: rgb(1, 1, 1),
    });
    page.drawText("Amount", {
      x: 480,
      y: y - 13,
      size: 11,
      color: rgb(1, 1, 1),
    });
    y -= 20;

    items.forEach((item, index) => {
      // Alternate row colors for better readability
      if (index % 2 === 0) {
        page.drawRectangle({
          x: 50,
          y: y - 20,
          width: 500,
          height: 20,
          color: rgb(0.97, 0.97, 0.97),
        });
      }

      // Description (left aligned)
      page.drawText(`${item.day || item.description || ""}`, {
        x: 60,
        y: y - 13,
        size: 11,
      });

      // Quantity/Hours (centered)
      const qty = item.hours || item.quantity || "";
      page.drawText(`${qty}`, {
        x: 310,
        y: y - 13,
        size: 11,
      });

      // Rate (centered)
      page.drawText(`$${item.rate || item.unitPrice || ""}`, {
        x: 405,
        y: y - 13,
        size: 11,
      });

      // Total (right aligned)
      const itemTotal = (
        parseFloat(item.hours || item.quantity || "0") *
        parseFloat(item.rate || item.unitPrice || "0")
      ).toFixed(2);
      page.drawText(`$${itemTotal}`, {
        x: 505,
        y: y - 13,
        size: 11,
      });

      // Row border
      page.drawLine({
        start: { x: 50, y: y - 20 },
        end: { x: 550, y: y - 20 },
        thickness: 0.5,
        color: rgb(0.9, 0.9, 0.9),
      });

      y -= 20;
    });

    // Final border
    page.drawLine({
      start: { x: 50, y: y },
      end: { x: 550, y: y },
      thickness: 1.5,
      color: rgb(0, 0.5, 0),
    });
    y -= 15;

    // Total section
    page.drawRectangle({
      x: 360,
      y: y - 22,
      width: 190,
      height: 22,
      color: rgb(0, 0.5, 0),
    });
    page.drawText(`TOTAL: $${total.toFixed(2)}`, {
      x: 375,
      y: y - 13,
      size: 13,
      color: rgb(1, 1, 1),
    });

    // Notes section
    let notesY = y - 40;

    if (notes) {
      page.drawText("NOTES", {
        x: 50,
        y: notesY,
        size: 11,
        color: rgb(0, 0, 0),
      });
      notesY -= 15;
      page.drawText(notes, {
        x: 50,
        y: notesY,
        size: 10,
        color: rgb(0.3, 0.3, 0.3),
      });
    }

    // Footer
    page.drawLine({
      start: { x: 50, y: 70 },
      end: { x: width - 50, y: 70 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    page.drawText("Thank you for your business!", {
      x: width / 2 - 100,
      y: 45,
      size: 11,
      color: rgb(0.4, 0.4, 0.4),
    });

    page.drawText("Created with Invoice-MVP", {
      x: width / 2 - 80,
      y: 25,
      size: 9,
      color: rgb(0.7, 0.7, 0.7),
    });

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

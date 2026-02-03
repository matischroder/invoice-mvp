const { PDFDocument, rgb } = require("pdf-lib");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { yourName, abn, clientName, clientEmail, invoiceNumber, date, items } =
    req.body;

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
    page.drawText(`${yourName}`, { x: 50, y: height - 140, size: 12 });
    page.drawText(`ABN: ${abn}`, { x: 50, y: height - 160, size: 12 });

    // To
    page.drawText("Bill To:", {
      x: 300,
      y: height - 120,
      size: 14,
      color: rgb(0, 0, 0.5),
    });
    page.drawText(`${clientName}`, { x: 300, y: height - 140, size: 12 });
    page.drawText(`${clientEmail}`, { x: 300, y: height - 160, size: 12 });

    // Items Table
    let y = height - 200;
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
      page.drawText(`$${(item.hours * item.rate).toFixed(2)}`, {
        x: 450,
        y,
        size: 12,
      });
      y -= 20;
    });

    // Total
    y -= 10;
    page.drawLine({ start: { x: 400, y }, end: { x: 550, y }, thickness: 1 });
    y -= 20;
    const total = items.reduce((sum, item) => sum + item.hours * item.rate, 0);
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

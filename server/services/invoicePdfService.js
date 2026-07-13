import PDFDocument from "pdfkit";

export function generateInvoicePdf(invoice, res) {
  const doc = new PDFDocument({
    margin: 50,
    size: "A4",
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${invoice.invoiceNumber}.pdf`
  );

  doc.pipe(res);

  doc
    .fontSize(24)
    .text("EduFlow CRM", {
      align: "center",
    });

  doc.moveDown();

  doc
    .fontSize(18)
    .text("INVOICE", {
      align: "center",
    });

  doc.moveDown(2);

  doc.fontSize(12);

  doc.text(`Invoice No : ${invoice.invoiceNumber}`);
  doc.text(`Status     : ${invoice.status}`);
  doc.text(
    `Invoice Date : ${new Date(invoice.createdAt).toLocaleDateString()}`
  );
  doc.text(
    `Due Date     : ${new Date(invoice.dueDate).toLocaleDateString()}`
  );

  doc.moveDown();

  doc.text(`Student : ${invoice.student?.firstName || ""} ${invoice.student?.lastName || ""}`);

  doc.text(`Email   : ${invoice.student?.email || ""}`);

  doc.moveDown(2);

  doc.fontSize(14).text("Items");

  doc.moveDown();

  invoice.items.forEach((item, index) => {
    doc.fontSize(12);

    doc.text(
      `${index + 1}. ${item.title}`
    );

    doc.text(
      `Qty : ${item.quantity}    Amount : ₹${item.amount}    Total : ₹${item.total}`
    );

    doc.moveDown();
  });

  doc.moveDown();

  doc.fontSize(14);

  doc.text(`Subtotal : ₹${invoice.subtotal}`);

  doc.text(`Discount : ₹${invoice.discount}`);

  doc.text(`Tax      : ₹${invoice.tax}`);

  doc.text(`Total    : ₹${invoice.totalAmount}`);

  doc.text(`Paid     : ₹${invoice.paidAmount}`);

  doc.text(`Balance  : ₹${invoice.balanceAmount}`);

  doc.moveDown();

  if (invoice.notes) {
    doc.text("Notes");
    doc.moveDown(0.5);
    doc.text(invoice.notes);
  }

  doc.end();
}

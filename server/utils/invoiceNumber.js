import Invoice from "../models/Invoice.js";

export async function generateInvoiceNumber() {
  const year = new Date().getFullYear();

  const latestInvoice = await Invoice.findOne({
    invoiceNumber: new RegExp(`INV-${year}`)
  }).sort({ createdAt: -1 });

  let sequence = 1;

  if (latestInvoice) {
    const parts = latestInvoice.invoiceNumber.split("-");

    sequence = Number(parts[2]) + 1;
  }

  return `INV-${year}-${String(sequence).padStart(4, "0")}`;
}

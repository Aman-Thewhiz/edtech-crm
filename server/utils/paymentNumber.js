import Payment from "../models/Payment.js";

export async function generatePaymentNumber() {
  try {
    const currentYear = new Date().getFullYear();

    // Find the highest sequence number for this year
    const lastPayment = await Payment.findOne({
      paymentNumber: new RegExp(`^PAY-${currentYear}-`),
    })
      .sort({ createdAt: -1 })
      .lean();

    let sequence = 1;
    if (lastPayment && lastPayment.paymentNumber) {
      const parts = lastPayment.paymentNumber.split("-");
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }

    const paymentNumber = `PAY-${currentYear}-${String(sequence).padStart(5, "0")}`;
    return paymentNumber;
  } catch (error) {
    throw new Error(`Failed to generate payment number: ${error.message}`);
  }
}

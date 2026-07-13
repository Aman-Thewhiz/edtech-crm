import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import Student from "../models/Student.js";
import { generatePaymentNumber } from "../utils/paymentNumber.js";
import { validatePayment, validatePaymentReversal } from "../validations/paymentValidation.js";

function mapPayment(payment) {
  return {
    _id: payment._id,
    paymentNumber: payment.paymentNumber,
    invoice: payment.invoice,
    student: payment.student,
    amount: payment.amount,
    mode: payment.mode,
    referenceNumber: payment.referenceNumber,
    paymentDate: payment.paymentDate,
    status: payment.status,
    reversalReason: payment.reversalReason,
    notes: payment.notes,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}

export async function createPayment(data) {
  const validation = validatePayment(data);

  if (!validation.isValid) {
    throw new Error(validation.errors.join(", "));
  }

  const invoice = await Invoice.findById(data.invoice);
  if (!invoice) {
    throw new Error("Invoice not found.");
  }

  const student = await Student.findById(data.student || invoice.student);
  if (!student) {
    throw new Error("Student not found.");
  }

  if (data.amount > invoice.balanceAmount) {
    throw new Error("Payment amount cannot exceed invoice balance.");
  }

  const paymentNumber = await generatePaymentNumber();

  const payment = await Payment.create({
    paymentNumber,
    invoice: invoice._id,
    student: student._id,
    amount: data.amount,
    mode: data.mode,
    referenceNumber: data.referenceNumber || "",
    paymentDate: data.paymentDate || new Date(),
    notes: data.notes || "",
  });

  // Update invoice paid amount and status
  invoice.paidAmount += data.amount;
  invoice.balanceAmount = invoice.totalAmount - invoice.paidAmount;

  if (invoice.balanceAmount === 0) {
    invoice.status = "paid";
  } else if (invoice.paidAmount > 0) {
    invoice.status = "partially_paid";
  }

  await invoice.save();

  return payment.populate([
    { path: "invoice" },
    { path: "student" },
  ]);
}

export async function getPayments(filters = {}) {
  const query = { isDeleted: false };

  if (filters.invoice) {
    query.invoice = filters.invoice;
  }

  if (filters.student) {
    query.student = filters.student;
  }

  if (filters.mode) {
    query.mode = filters.mode;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.from || filters.to) {
    query.paymentDate = {};

    if (filters.from) {
      query.paymentDate.$gte = new Date(filters.from);
    }

    if (filters.to) {
      query.paymentDate.$lte = new Date(filters.to);
    }
  }

  if (filters.search) {
    query.$or = [
      { paymentNumber: { $regex: filters.search, $options: "i" } },
      { referenceNumber: { $regex: filters.search, $options: "i" } },
    ];
  }

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find(query)
      .populate("invoice")
      .populate("student")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Payment.countDocuments(query),
  ]);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: payments.map(mapPayment),
  };
}

export async function getPaymentById(id) {
  const payment = await Payment.findById(id)
    .populate("invoice")
    .populate("student");

  if (!payment || payment.isDeleted) {
    throw new Error("Payment not found.");
  }

  return mapPayment(payment);
}

export async function updatePayment(id, data) {
  const payment = await Payment.findById(id);

  if (!payment || payment.isDeleted) {
    throw new Error("Payment not found.");
  }

  if (payment.status === "reversed") {
    throw new Error("Cannot update a reversed payment.");
  }

  Object.assign(payment, {
    amount: data.amount ?? payment.amount,
    mode: data.mode ?? payment.mode,
    referenceNumber: data.referenceNumber ?? payment.referenceNumber,
    notes: data.notes ?? payment.notes,
  });

  await payment.save();

  return payment.populate([
    { path: "invoice" },
    { path: "student" },
  ]);
}

export async function reversePayment(id, reversalReason) {
  const validation = validatePaymentReversal({ reversalReason });

  if (!validation.isValid) {
    throw new Error(validation.errors.join(", "));
  }

  const payment = await Payment.findById(id);

  if (!payment || payment.isDeleted) {
    throw new Error("Payment not found.");
  }

  if (payment.status === "reversed") {
    throw new Error("Payment is already reversed.");
  }

  // Revert invoice paid amount
  const invoice = await Invoice.findById(payment.invoice);
  if (invoice) {
    invoice.paidAmount -= payment.amount;
    invoice.balanceAmount = invoice.totalAmount - invoice.paidAmount;

    if (invoice.balanceAmount === invoice.totalAmount) {
      invoice.status = "sent";
    } else if (invoice.paidAmount > 0) {
      invoice.status = "partially_paid";
    }

    await invoice.save();
  }

  payment.status = "reversed";
  payment.reversalReason = reversalReason;

  await payment.save();

  return mapPayment(payment);
}

export async function deletePayment(id) {
  const payment = await Payment.findById(id);

  if (!payment) {
    throw new Error("Payment not found.");
  }

  // Soft delete
  payment.isDeleted = true;
  payment.deletedAt = new Date();

  await payment.save();

  return { success: true };
}

export async function getPaymentStats() {
  const [
    totalPayments,
    recordedPayments,
    reversedPayments,
    totalAmount,
  ] = await Promise.all([
    Payment.countDocuments({ isDeleted: false }),

    Payment.countDocuments({
      status: "recorded",
      isDeleted: false,
    }),

    Payment.countDocuments({
      status: "reversed",
      isDeleted: false,
    }),

    Payment.aggregate([
      { $match: { isDeleted: false, status: { $ne: "reversed" } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  return {
    totalPayments,
    recordedPayments,
    reversedPayments,
    totalAmount: totalAmount[0]?.total || 0,
  };
}

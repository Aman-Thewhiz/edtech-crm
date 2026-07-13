import Invoice from "../models/Invoice.js";
import Student from "../models/Student.js";
import Admission from "../models/Admission.js";

import { generateInvoiceNumber } from "../utils/invoiceNumber.js";
import { validateInvoice } from "../validations/invoiceValidation.js";

function mapInvoice(invoice) {
  return {
    _id: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    student: invoice.student,
    admission: invoice.admission,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    status: invoice.status,
    items: invoice.items,
    subtotal: invoice.subtotal,
    discount: invoice.discount,
    tax: invoice.tax,
    totalAmount: invoice.totalAmount,
    paidAmount: invoice.paidAmount,
    balanceAmount: invoice.balanceAmount,
    notes: invoice.notes,
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt,
  };
}

export async function createInvoice(data) {
  const validation = validateInvoice(data);

  if (!validation.isValid) {
    throw new Error(validation.errors.join(", "));
  }

  const student = await Student.findById(data.student);

  if (!student) {
    throw new Error("Student not found.");
  }

  let admission = null;

  if (data.admission) {
    admission = await Admission.findById(data.admission);

    if (!admission) {
      throw new Error("Admission not found.");
    }
  }

  const invoiceNumber = await generateInvoiceNumber();

  const invoice = await Invoice.create({
    invoiceNumber,
    student: student._id,
    admission: admission?._id,
    dueDate: data.dueDate,
    items: data.items,
    discount: data.discount || 0,
    tax: data.tax || 0,
    notes: data.notes || "",
  });

  const populated = await invoice.populate([
    {
      path: "student",
    },
    {
      path: "admission",
    },
  ]);
  return mapInvoice(populated);
}

export async function getInvoices(filters = {}) {
  const query = {};

  // Student Filter
  if (filters.student) {
    query.student = filters.student;
  }

  // Status Filter
  if (filters.status) {
    query.status = filters.status;
  }

  // Date Range Filter
  if (filters.from || filters.to) {
    query.issueDate = {};

    if (filters.from) {
      query.issueDate.$gte = new Date(filters.from);
    }

    if (filters.to) {
      query.issueDate.$lte = new Date(filters.to);
    }
  }

  // Search by Invoice Number
  if (filters.search) {
    query.invoiceNumber = {
      $regex: filters.search,
      $options: "i",
    };
  }

  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const [invoices, total] = await Promise.all([
    Invoice.find(query)
      .populate("student")
      .populate("admission")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Invoice.countDocuments(query),
  ]);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: invoices.map(mapInvoice),
  };
}

export async function getInvoiceStats() {
  const [
    totalInvoices,
    paidInvoices,
    draftInvoices,
    overdueInvoices,
  ] = await Promise.all([
    Invoice.countDocuments(),

    Invoice.countDocuments({
      status: "paid",
    }),

    Invoice.countDocuments({
      status: "draft",
    }),

    Invoice.countDocuments({
      status: "overdue",
    }),
  ]);

  return {
    totalInvoices,
    paidInvoices,
    draftInvoices,
    overdueInvoices,
  };
}

export async function getInvoiceById(id) {
  const invoice = await Invoice.findById(id)
    .populate("student")
    .populate("admission");

  if (!invoice) {
    throw new Error("Invoice not found.");
  }

  return mapInvoice(invoice);
}

export async function updateInvoice(id, data) {
  const invoice = await Invoice.findById(id);

  if (!invoice) {
    throw new Error("Invoice not found.");
  }

  if (invoice.status !== "draft") {
    throw new Error("Only draft invoices can be edited.");
  }

  Object.assign(invoice, {
    dueDate: data.dueDate ?? invoice.dueDate,
    items: data.items ?? invoice.items,
    discount: data.discount ?? invoice.discount,
    tax: data.tax ?? invoice.tax,
    notes: data.notes ?? invoice.notes,
  });

  await invoice.save();

  const populated = await invoice.populate([
    { path: "student" },
    { path: "admission" },
  ]);
  return mapInvoice(populated);
}

export async function updateInvoiceStatus(id, status) {
  const invoice = await Invoice.findById(id);

  if (!invoice) {
    throw new Error("Invoice not found.");
  }

  invoice.status = status;

  await invoice.save();

  return mapInvoice(invoice);
}

export async function deleteInvoice(id) {
  const invoice = await Invoice.findById(id);

  if (!invoice) {
    throw new Error("Invoice not found.");
  }

  if (invoice.status !== "draft") {
    throw new Error("Only draft invoices can be deleted.");
  }

  await invoice.deleteOne();

  return {
    success: true,
  };
}
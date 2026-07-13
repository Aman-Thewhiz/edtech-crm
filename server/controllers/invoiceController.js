import { generateInvoicePdf } from "../services/invoicePdfService.js";
import * as invoiceService from "../services/invoiceService.js";

function envelope(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({ success: true, data, message });
}

export async function createInvoice(req, res, next) {
  try {
    const invoice = await invoiceService.createInvoice(req.body);
    return envelope(res, { invoice }, 'Invoice created', 201);
  } catch (error) {
    next(error);
  }
}

export async function getInvoices(req, res, next) {
  try {
    const data = await invoiceService.getInvoices(req.query);
    return res.json({ success: true, data: data.data, message: 'Invoices loaded', pagination: { page: data.page, limit: data.limit, total: data.total, totalPages: data.totalPages } });
  } catch (error) {
    next(error);
  }
}

export async function getInvoice(req, res, next) {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    return envelope(res, { invoice }, 'Invoice loaded');
  } catch (error) {
    next(error);
  }
}

export async function getInvoiceStats(req, res, next) {
  try {
    const stats = await invoiceService.getInvoiceStats();
    return envelope(res, stats, 'Invoice stats loaded');
  } catch (error) {
    next(error);
  }
}

export async function downloadInvoicePdf(req, res, next) {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    generateInvoicePdf(invoice, res);
  } catch (error) {
    next(error);
  }
}

export async function updateInvoice(req, res, next) {
  try {
    const invoice = await invoiceService.updateInvoice(
      req.params.id,
      req.body
    );
    return envelope(res, { invoice }, 'Invoice updated');
  } catch (error) {
    next(error);
  }
}

export async function updateInvoiceStatus(req, res, next) {
  try {
    const invoice = await invoiceService.updateInvoiceStatus(
      req.params.id,
      req.body.status
    );
    return envelope(res, { invoice }, 'Invoice status updated');
  } catch (error) {
    next(error);
  }
}

export async function deleteInvoice(req, res, next) {
  try {
    await invoiceService.deleteInvoice(req.params.id);
    return envelope(res, {}, 'Invoice deleted successfully');
  } catch (error) {
    next(error);
  }
}
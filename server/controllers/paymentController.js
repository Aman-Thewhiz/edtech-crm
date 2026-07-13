import * as paymentService from "../services/paymentService.js";

function envelope(res, data, message = "Success", statusCode = 200) {
  return res.status(statusCode).json({ success: true, data, message });
}

export async function createPayment(req, res, next) {
  try {
    const payment = await paymentService.createPayment(req.body);
    return envelope(res, { payment }, "Payment recorded", 201);
  } catch (error) {
    next(error);
  }
}

export async function getPayments(req, res, next) {
  try {
    const data = await paymentService.getPayments(req.query);
    return res.json({
      success: true,
      data: data.data,
      message: "Payments loaded",
      pagination: {
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getPayment(req, res, next) {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    return envelope(res, { payment }, "Payment loaded");
  } catch (error) {
    next(error);
  }
}

export async function updatePayment(req, res, next) {
  try {
    const payment = await paymentService.updatePayment(req.params.id, req.body);
    return envelope(res, { payment }, "Payment updated");
  } catch (error) {
    next(error);
  }
}

export async function reversePayment(req, res, next) {
  try {
    const payment = await paymentService.reversePayment(
      req.params.id,
      req.body.reversalReason
    );
    return envelope(res, { payment }, "Payment reversed");
  } catch (error) {
    next(error);
  }
}

export async function deletePayment(req, res, next) {
  try {
    await paymentService.deletePayment(req.params.id);
    return envelope(res, {}, "Payment deleted");
  } catch (error) {
    next(error);
  }
}

export async function getPaymentStats(req, res, next) {
  try {
    const stats = await paymentService.getPaymentStats();
    return envelope(res, stats, "Payment stats loaded");
  } catch (error) {
    next(error);
  }
}

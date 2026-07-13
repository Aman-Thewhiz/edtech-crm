import Joi from "joi";

export const paymentSchema = Joi.object({
  invoice: Joi.string().required().messages({
    "string.empty": "Invoice ID is required",
  }),
  amount: Joi.number().min(0).required().messages({
    "number.min": "Amount must be greater than 0",
  }),
  mode: Joi.string()
    .valid("cash", "upi", "neft", "cheque")
    .required()
    .messages({
      "any.only": "Payment mode must be cash, upi, neft, or cheque",
    }),
  referenceNumber: Joi.string().optional().allow(""),
  paymentDate: Joi.date().optional(),
  notes: Joi.string().optional().allow(""),
});

export const paymentUpdateSchema = Joi.object({
  amount: Joi.number().min(0).optional(),
  mode: Joi.string()
    .valid("cash", "upi", "neft", "cheque")
    .optional(),
  referenceNumber: Joi.string().optional().allow(""),
  notes: Joi.string().optional().allow(""),
});

export const paymentReversalSchema = Joi.object({
  reversalReason: Joi.string().required().messages({
    "string.empty": "Reversal reason is required",
  }),
});

export function validatePayment(data) {
  const { error, value } = paymentSchema.validate(data);
  if (error) {
    return { isValid: false, errors: [error.message] };
  }
  return { isValid: true, data: value };
}

export function validatePaymentUpdate(data) {
  const { error, value } = paymentUpdateSchema.validate(data);
  if (error) {
    return { isValid: false, errors: [error.message] };
  }
  return { isValid: true, data: value };
}

export function validatePaymentReversal(data) {
  const { error, value } = paymentReversalSchema.validate(data);
  if (error) {
    return { isValid: false, errors: [error.message] };
  }
  return { isValid: true, data: value };
}

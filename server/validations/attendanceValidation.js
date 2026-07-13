import Joi from "joi";

export const attendanceSchema = Joi.object({
  date: Joi.date().required().messages({
    "date.base": "Date must be valid",
    "any.required": "Date is required",
  }),
  entityType: Joi.string()
    .valid("student", "employee")
    .required()
    .messages({
      "any.only": "Entity type must be student or employee",
    }),
  entityId: Joi.string().required().messages({
    "string.empty": "Entity ID is required",
  }),
  batch: Joi.string().optional().allow(null),
  department: Joi.string().optional().allow(null),
  status: Joi.string()
    .valid("present", "absent", "half-day", "on-leave", "holiday")
    .required()
    .messages({
      "any.only": "Status must be present, absent, half-day, on-leave, or holiday",
    }),
  remarks: Joi.string().optional().allow(""),
});

export const bulkAttendanceSchema = Joi.object({
  date: Joi.date().required(),
  entityType: Joi.string()
    .valid("student", "employee")
    .required(),
  batchOrDepartment: Joi.string().optional().allow(null),
  attendanceData: Joi.array()
    .items(
      Joi.object({
        entityId: Joi.string().required(),
        status: Joi.string()
          .valid("present", "absent", "half-day", "on-leave", "holiday")
          .required(),
        remarks: Joi.string().optional().allow(""),
      })
    )
    .required(),
});

export const holidaySchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Holiday name is required",
  }),
  date: Joi.date().required().messages({
    "date.base": "Date must be valid",
  }),
  description: Joi.string().optional().allow(""),
  type: Joi.string()
    .valid("national", "regional", "company")
    .default("national"),
  applicableFor: Joi.array()
    .items(Joi.string().valid("students", "employees", "both"))
    .default(["both"]),
});

export function validateAttendance(data) {
  const { error, value } = attendanceSchema.validate(data);
  if (error) {
    return { isValid: false, errors: [error.message] };
  }
  return { isValid: true, data: value };
}

export function validateBulkAttendance(data) {
  const { error, value } = bulkAttendanceSchema.validate(data);
  if (error) {
    return { isValid: false, errors: [error.message] };
  }
  return { isValid: true, data: value };
}

export function validateHoliday(data) {
  const { error, value } = holidaySchema.validate(data);
  if (error) {
    return { isValid: false, errors: [error.message] };
  }
  return { isValid: true, data: value };
}

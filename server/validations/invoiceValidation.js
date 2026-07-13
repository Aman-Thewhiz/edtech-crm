export function validateInvoice(data) {
  const errors = [];

  if (!data.student) {
    errors.push("Student is required.");
  }

  if (!data.dueDate) {
    errors.push("Due date is required.");
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.push("At least one invoice item is required.");
  }

  if (Array.isArray(data.items)) {
    data.items.forEach((item, index) => {
      if (!item.title) {
        errors.push(`Item ${index + 1}: title is required.`);
      }

      if (item.quantity == null || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: quantity must be greater than 0.`);
      }

      if (item.amount == null || item.amount < 0) {
        errors.push(`Item ${index + 1}: amount must be 0 or greater.`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

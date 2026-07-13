export const permissionMap = {
  super_admin: ['*'],
  admin: ['*'],
  hr_manager: ['hr:*', 'employees:*', 'attendance:*', 'leave:*', 'payroll:*'],
  sales_manager: ['leads:*', 'sales:*', 'reports:read'],
  counsellor: ['leads:*', 'admissions:*', 'students:read'],
  finance: ['invoices:*', 'payments:*', 'reports:read'],
  teacher: ['students:read', 'attendance:read', 'profile:read'],
  student: ['profile:read', 'invoices:read'],
};
import { useAuth } from '../contexts/AuthContext';

const permissionMatrix = {
  super_admin: ['*'],
  admin: ['*'],
  hr_manager: ['hr:*', 'employees:*', 'attendance:*', 'leave:*', 'payroll:*'],
  sales_manager: ['leads:*', 'sales:*', 'reports:read'],
  counsellor: ['leads:*', 'admissions:*', 'students:read'],
  finance: ['invoices:*', 'payments:*', 'reports:read'],
  teacher: ['students:read', 'attendance:read', 'profile:read'],
  student: ['profile:read', 'invoices:read'],
};

export default function usePermissions() {
  const { user } = useAuth();
  const permissions = permissionMatrix[user?.role] || [];

  const can = (action, resource) => permissions.includes('*') || permissions.includes(`${resource}:${action}`) || permissions.includes(`${resource}:*`);

  return { permissions, can };
}
import AuditLog from '../models/AuditLog.js';
import { redis } from '../config/redis.js';

const roleStats = {
  admin: [
    { label: 'Total Leads', value: 1248, delta: '+12%' },
    { label: 'New Admissions This Month', value: 86, delta: '+8%' },
    { label: 'Revenue This Month', value: '₹8.4L', delta: '+14%' },
    { label: 'Active Students', value: 764, delta: '+3%' },
  ],
  sales_manager: [
    { label: 'My Leads', value: 214, delta: '+6%' },
    { label: 'Conversions This Month', value: 38, delta: '+11%' },
    { label: 'Pipeline Value', value: '₹18.2L', delta: '+9%' },
    { label: 'Follow-up Due', value: 27, delta: '-4%' },
  ],
  counsellor: [
    { label: 'Assigned Leads', value: 92, delta: '+5%' },
    { label: 'Pending Follow-ups', value: 18, delta: '-7%' },
    { label: 'Admissions Initiated', value: 19, delta: '+4%' },
    { label: 'Open Tasks', value: 11, delta: '+2%' },
  ],
  finance: [
    { label: 'Invoices Pending', value: 56, delta: '-8%' },
    { label: 'Overdue Amount', value: '₹2.1L', delta: '-3%' },
    { label: 'Collected This Month', value: '₹12.7L', delta: '+16%' },
    { label: 'Due Follow-ups', value: 14, delta: '+1%' },
  ],
  hr_manager: [
    { label: 'Total Employees', value: 48, delta: '+2%' },
    { label: 'Attendance Today %', value: '96%', delta: '+1%' },
    { label: 'Pending Leaves', value: 9, delta: '-2%' },
    { label: 'Open Requisitions', value: 4, delta: '+1%' },
  ],
  super_admin: [
    { label: 'Total Leads', value: 1248, delta: '+12%' },
    { label: 'New Admissions This Month', value: 86, delta: '+8%' },
    { label: 'Revenue This Month', value: '₹8.4L', delta: '+14%' },
    { label: 'Active Students', value: 764, delta: '+3%' },
  ],
};

const monthlySeries = [
  { month: 'Jan', admissions: 36, revenue: 42 },
  { month: 'Feb', admissions: 48, revenue: 45 },
  { month: 'Mar', admissions: 52, revenue: 51 },
  { month: 'Apr', admissions: 61, revenue: 56 },
  { month: 'May', admissions: 58, revenue: 63 },
  { month: 'Jun', admissions: 74, revenue: 69 },
];

const leadsBySource = [
  { source: 'Website', value: 42 },
  { source: 'Referral', value: 28 },
  { source: 'Walk-in', value: 18 },
  { source: 'Social', value: 22 },
  { source: 'Campaign', value: 16 },
];

function versionKey() {
  return 'dash:stats:version';
}

function cacheKey(userId, version) {
  return `dash:stats:${version}:${userId}`;
}

function moduleFilter(role) {
  if (role === 'admin' || role === 'super_admin') return ['lead', 'admission', 'invoice', 'payment', 'employee', 'attendance', 'leave', 'payroll'];
  if (role === 'sales_manager') return ['lead', 'sales'];
  if (role === 'counsellor') return ['lead', 'admission', 'student'];
  if (role === 'finance') return ['invoice', 'payment'];
  if (role === 'hr_manager') return ['employee', 'attendance', 'leave', 'payroll'];
  return [];
}

function statsForRole(role) {
  return roleStats[role] || roleStats.admin;
}

function activityMatchesRole(activity, role) {
  if (!activity?.resource) return false;
  const resource = activity.resource.toLowerCase();
  const allowedModules = moduleFilter(role);
  return allowedModules.some((moduleName) => resource.includes(moduleName));
}

export async function getDashboardStats(user) {
  const version = await redis.get(versionKey());
  const key = cacheKey(user.sub, version || '0');
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  const activities = await AuditLog.find({}).sort({ createdAt: -1 }).limit(50).lean();
  const recentActivity = activities
    .filter((activity) => activityMatchesRole(activity, user.role))
    .slice(0, 10)
    .map((activity) => ({
      id: activity._id,
      action: activity.action,
      resource: activity.resource,
      actorRole: activity.actorRole,
      timestamp: activity.createdAt,
    }));

  const payload = {
    role: user.role,
    stats: statsForRole(user.role),
    charts: {
      admissionsVsRevenue: monthlySeries,
      leadsBySource,
    },
    recentActivity,
    quickActions: quickActionsForRole(user.role),
  };

  await redis.set(key, JSON.stringify(payload), 'EX', 300);
  return payload;
}

export async function invalidateDashboardCache(userId) {
  await redis.incr(versionKey());
}

function quickActionsForRole(role) {
  const shared = [
    { label: 'View Coming Soon Modules', href: '/leads' },
  ];

  const byRole = {
    admin: [
      { label: 'Create Lead', href: '/leads' },
      { label: 'Open Admissions', href: '/admissions' },
      { label: 'Mark Attendance', href: '/attendance' },
    ],
    sales_manager: [
      { label: 'New Lead', href: '/leads' },
      { label: 'Pipeline View', href: '/leads' },
      { label: 'Reports', href: '/reports' },
    ],
    counsellor: [
      { label: 'Assigned Leads', href: '/leads' },
      { label: 'Admissions', href: '/admissions' },
      { label: 'Students', href: '/students' },
    ],
    finance: [
      { label: 'Open Invoices', href: '/invoices' },
      { label: 'Payments', href: '/reports' },
      { label: 'Reports', href: '/reports' },
    ],
    hr_manager: [
      { label: 'Employees', href: '/hr/employees' },
      { label: 'Mark Attendance', href: '/attendance' },
      { label: 'Attendance Summary', href: '/attendance/summary' },
    ],
    super_admin: [
      { label: 'Admin Overview', href: '/dashboard' },
      { label: 'All Reports', href: '/reports' },
      { label: 'User Settings', href: '/settings' },
    ],
  };

  return [...(byRole[role] || byRole.admin), ...shared];
}
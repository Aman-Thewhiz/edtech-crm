import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CourseListPage from './pages/courses/CourseListPage';
import CourseFormPage from './pages/courses/CourseFormPage';
import CourseDetailPage from './pages/courses/CourseDetailPage';
import BatchFormPage from './pages/courses/BatchFormPage';
import LeadListPage from './pages/leads/LeadListPage';
import LeadPipelinePage from './pages/leads/LeadPipelinePage';
import LeadFormPage from './pages/leads/LeadFormPage';
import LeadDetailPage from './pages/leads/LeadDetailPage';
import StudentListPage from './pages/students/StudentListPage';
import StudentFormPage from './pages/students/StudentFormPage';
import StudentProfilePage from './pages/students/StudentProfilePage';
import AdmissionListPage from './pages/admissions/AdmissionListPage';
import AdmissionFormPage from './pages/admissions/AdmissionFormPage';
import AdmissionDetailPage from './pages/admissions/AdmissionDetailPage';
import InvoiceListPage from './pages/invoices/InvoiceListPage';
import InvoiceFormPage from './pages/invoices/InvoiceFormPage';
import InvoiceDetailPage from './pages/invoices/InvoiceDetailPage';
import PaymentListPage from './pages/payments/PaymentListPage';
import PaymentFormPage from './pages/payments/PaymentFormPage';
import PaymentDetailPage from './pages/payments/PaymentDetailPage';
import DepartmentListPage from './pages/hr/departments/DepartmentListPage';
import DepartmentFormPage from './pages/hr/departments/DepartmentFormPage';
import DesignationListPage from './pages/hr/designations/DesignationListPage';
import DesignationFormPage from './pages/hr/designations/DesignationFormPage';
import EmployeeListPage from './pages/hr/employees/EmployeeListPage';
import EmployeeFormPage from './pages/hr/employees/EmployeeFormPage';
import EmployeeDetailPage from './pages/hr/employees/EmployeeDetailPage';
import AttendanceMarkingPage from './pages/attendance/AttendanceMarkingPage';
import AttendanceCalendarPage from './pages/attendance/AttendanceCalendarPage';
import AttendanceSummaryPage from './pages/attendance/AttendanceSummaryPage';
import HolidayListPage from './pages/attendance/HolidayListPage';
import HolidayFormPage from './pages/attendance/HolidayFormPage';
import LeavePolicyListPage from './pages/leaves/LeavePolicyListPage';
import LeavePolicyFormPage from './pages/leaves/LeavePolicyFormPage';
import LeaveRequestListPage from './pages/leaves/LeaveRequestListPage';
import LeaveRequestFormPage from './pages/leaves/LeaveRequestFormPage';
import LeaveRequestDetailPage from './pages/leaves/LeaveRequestDetailPage';
import LeaveBalancePage from './pages/leaves/LeaveBalancePage';
import NotificationListPage from './pages/settings/NotificationListPage';
import NotificationPreferencesPage from './pages/settings/NotificationPreferencesPage';
import SettingsPage from './pages/settings/SettingsPage';
import UserManagementPage from './pages/settings/UserManagementPage';
import AuditLogPage from './pages/settings/AuditLogPage';
import UserProfilePage from './pages/settings/UserProfilePage';
import SalaryStructureListPage from './pages/payroll/SalaryStructureListPage';
import PayrollListPage from './pages/payroll/PayrollListPage';
import PayrollDetailPage from './pages/payroll/PayrollDetailPage';
import ReportsDashboardPage from './pages/reports/ReportsDashboardPage';
import ComingSoonPage from './pages/ComingSoonPage';
import NotFoundPage from './pages/NotFoundPage';
import PayrollGeneratePage from "./pages/payroll/PayrollGeneratePage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/"
        element={(
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        )}
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="leads" element={<LeadListPage />} />
        <Route path="leads/pipeline" element={<LeadPipelinePage />} />
        <Route path="leads/new" element={<LeadFormPage />} />
        <Route path="leads/:leadId" element={<LeadDetailPage />} />
        <Route path="leads/:leadId/edit" element={<LeadFormPage />} />
        <Route path="courses" element={<CourseListPage />} />
        <Route path="courses/new" element={<CourseFormPage />} />
        <Route path="courses/:courseId" element={<CourseDetailPage />} />
        <Route path="courses/:courseId/edit" element={<CourseFormPage />} />
        <Route path="courses/:courseId/batches/new" element={<BatchFormPage />} />
        <Route path="courses/:courseId/batches/:batchId/edit" element={<BatchFormPage />} />
        <Route path="students" element={<StudentListPage />} />
        <Route path="students/new" element={<StudentFormPage />} />
        <Route path="students/:studentId" element={<StudentProfilePage />} />
        <Route path="students/:studentId/edit" element={<StudentFormPage />} />
        <Route path="admissions" element={<AdmissionListPage />} />
        <Route path="admissions/new" element={<AdmissionFormPage />} />
        <Route path="admissions/:admissionId" element={<AdmissionDetailPage />} />
        <Route path="admissions/:admissionId/edit" element={<AdmissionFormPage />} />
        <Route path="invoices" element={<InvoiceListPage />} />
        <Route path="invoices/new" element={<InvoiceFormPage />} />
        <Route path="invoices/:invoiceId" element={<InvoiceDetailPage />} />
        <Route path="invoices/:invoiceId/edit" element={<InvoiceFormPage />} />
        <Route path="payments" element={<PaymentListPage />} />
        <Route path="payments/new" element={<PaymentFormPage />} />
        <Route path="payments/:paymentId" element={<PaymentDetailPage />} />
        <Route path="hr/departments" element={<DepartmentListPage />} />
        <Route path="hr/departments/new" element={<DepartmentFormPage />} />
        <Route path="hr/departments/:departmentId" element={<DepartmentFormPage />} />
        <Route path="hr/designations" element={<DesignationListPage />} />
        <Route path="hr/designations/new" element={<DesignationFormPage />} />
        <Route path="hr/designations/:designationId" element={<DesignationFormPage />} />
        <Route path="hr/employees" element={<EmployeeListPage />} />
        <Route path="hr/employees/new" element={<EmployeeFormPage />} />
        <Route path="hr/employees/:employeeId" element={<EmployeeDetailPage />} />
        <Route path="hr/employees/:employeeId/edit" element={<EmployeeFormPage />} />
        <Route path="attendance" element={<AttendanceMarkingPage />} />
        <Route path="attendance/calendar" element={<AttendanceCalendarPage />} />
        <Route path="attendance/summary" element={<AttendanceSummaryPage />} />
        <Route path="attendance/holidays" element={<HolidayListPage />} />
        <Route path="attendance/holidays/new" element={<HolidayFormPage />} />
        <Route path="attendance/holidays/:holidayId" element={<HolidayFormPage />} />
        <Route path="leaves/policies" element={<LeavePolicyListPage />} />
        <Route path="leaves/policies/new" element={<LeavePolicyFormPage />} />
        <Route path="leaves/policies/:policyId" element={<LeavePolicyFormPage />} />
        <Route path="leaves/requests" element={<LeaveRequestListPage />} />
        <Route path="leaves/requests/new" element={<LeaveRequestFormPage />} />
        <Route path="leaves/requests/:requestId" element={<LeaveRequestDetailPage />} />
        <Route path="leaves/balance" element={<LeaveBalancePage />} />
        <Route path="payroll/salary-structures" element={<SalaryStructureListPage />} />
        <Route path="payroll/payroll" element={<PayrollListPage />} />
        <Route path="payroll/payroll/generate" element={<PayrollGeneratePage />} />
        <Route path="payroll/payroll/:payrollId" element={<PayrollDetailPage />} />
        <Route path="reports" element={<ReportsDashboardPage />} />
        <Route path="notifications" element={<NotificationListPage />} />
        <Route path="finance" element={<ComingSoonPage title="Finance" />} />
        <Route path="profile" element={<UserProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="settings/notifications" element={<NotificationPreferencesPage />} />
        <Route path="settings/users" element={<UserManagementPage />} />
        <Route path="settings/audit-logs" element={<AuditLogPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

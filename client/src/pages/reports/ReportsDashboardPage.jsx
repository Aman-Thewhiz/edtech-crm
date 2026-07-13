import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  HStack,
  Stack,
  Text,
  useToast,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from '@chakra-ui/react';
import { FiDownload } from 'react-icons/fi';
import PageWrapper from '../../components/ui/PageWrapper';
import {
  fetchLeadConversionReport,
  fetchRevenueReport,
  fetchStudentEnrollmentReport,
  fetchEmployeeAttendanceReport,
  fetchPayrollSummaryReport,
  exportLeadConversionReport,
  exportRevenueReport,
  exportStudentEnrollmentReport,
  exportEmployeeAttendanceReport,
  exportPayrollSummaryReport,
} from '../../services/reports';

export default function ReportsDashboardPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState({
    leadConversion: null,
    revenue: null,
    studentEnrollment: null,
    employeeAttendance: null,
    payrollSummary: null,
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [leadConversion, revenue, studentEnrollment, employeeAttendance, payrollSummary] =
        await Promise.all([
          fetchLeadConversionReport(),
          fetchRevenueReport(),
          fetchStudentEnrollmentReport(),
          fetchEmployeeAttendanceReport(),
          fetchPayrollSummaryReport(),
        ]);

      setReports({
        leadConversion,
        revenue,
        studentEnrollment,
        employeeAttendance,
        payrollSummary,
      });
    } catch (error) {
      toast({ title: 'Error loading reports', description: error.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (exportFn, reportName) => {
    try {
      exportFn();
      toast({ title: `${reportName} exported`, status: 'success' });
    } catch (error) {
      toast({ title: 'Error exporting report', description: error.message, status: 'error' });
    }
  };

  if (loading) return <PageWrapper><Text>Loading reports...</Text></PageWrapper>;

  return (
    <PageWrapper>
      <Stack spacing={8}>
        <Box>
          <Text fontSize="sm" color="gray.500">Analytics</Text>
          <Text fontSize="2xl" fontWeight="700">Reports Dashboard</Text>
        </Box>

        {/* Lead Conversion Report */}
        <Box p={6} bg="white" borderRadius="lg" borderWidth="1px">
          <HStack justify="space-between" mb={6}>
            <Text fontSize="lg" fontWeight="600">Lead Conversion Funnel</Text>
            <Button
              size="sm"
              leftIcon={<FiDownload />}
              onClick={() => handleExport(exportLeadConversionReport, 'Lead Conversion Report')}
            >
              Export
            </Button>
          </HStack>
          <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
            <Stat>
              <StatLabel>Total Leads</StatLabel>
              <StatNumber>{reports.leadConversion?.totalLeads}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Converted</StatLabel>
              <StatNumber color="green.600">{reports.leadConversion?.convertedLeads}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Rejected</StatLabel>
              <StatNumber color="red.600">{reports.leadConversion?.rejectedLeads}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Pending</StatLabel>
              <StatNumber color="yellow.600">{reports.leadConversion?.pendingLeads}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Conversion Rate</StatLabel>
              <StatNumber color="blue.600">{reports.leadConversion?.conversionRate}%</StatNumber>
            </Stat>
          </SimpleGrid>
        </Box>

        {/* Revenue Report */}
        <Box p={6} bg="white" borderRadius="lg" borderWidth="1px">
          <HStack justify="space-between" mb={6}>
            <Text fontSize="lg" fontWeight="600">Revenue Report</Text>
            <Button
              size="sm"
              leftIcon={<FiDownload />}
              onClick={() => handleExport(exportRevenueReport, 'Revenue Report')}
            >
              Export
            </Button>
          </HStack>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Stat>
              <StatLabel>Total Invoiced</StatLabel>
              <StatNumber>₹{reports.revenue?.totalInvoiced?.toLocaleString()}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Total Collected</StatLabel>
              <StatNumber color="green.600">₹{reports.revenue?.totalCollected?.toLocaleString()}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Outstanding</StatLabel>
              <StatNumber color="red.600">₹{reports.revenue?.totalOutstanding?.toLocaleString()}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Collection Rate</StatLabel>
              <StatNumber color="blue.600">{reports.revenue?.collectionRate}%</StatNumber>
            </Stat>
          </SimpleGrid>
        </Box>

        {/* Student Enrollment Report */}
        <Box p={6} bg="white" borderRadius="lg" borderWidth="1px">
          <HStack justify="space-between" mb={6}>
            <Text fontSize="lg" fontWeight="600">Student Enrollment</Text>
            <Button
              size="sm"
              leftIcon={<FiDownload />}
              onClick={() => handleExport(exportStudentEnrollmentReport, 'Student Enrollment Report')}
            >
              Export
            </Button>
          </HStack>
          <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
            <Stat>
              <StatLabel>Total Students</StatLabel>
              <StatNumber>{reports.studentEnrollment?.totalStudents}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Active</StatLabel>
              <StatNumber color="green.600">{reports.studentEnrollment?.activeStudents}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Inactive</StatLabel>
              <StatNumber color="red.600">{reports.studentEnrollment?.inactiveStudents}</StatNumber>
            </Stat>
          </SimpleGrid>
          {reports.studentEnrollment?.byCourse && reports.studentEnrollment.byCourse.length > 0 && (
            <VStack align="stretch" mt={6} spacing={2}>
              <Text fontSize="sm" fontWeight="600" color="gray.600">By Course:</Text>
              {reports.studentEnrollment.byCourse.map((item, idx) => (
                <HStack key={idx} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                  <Text>{item.course}</Text>
                  <Text fontWeight="600">{item.count} students</Text>
                </HStack>
              ))}
            </VStack>
          )}
        </Box>

        {/* Payroll Summary Report */}
        <Box p={6} bg="white" borderRadius="lg" borderWidth="1px">
          <HStack justify="space-between" mb={6}>
            <Text fontSize="lg" fontWeight="600">Payroll Summary</Text>
            <Button
              size="sm"
              leftIcon={<FiDownload />}
              onClick={() => handleExport(exportPayrollSummaryReport, 'Payroll Summary Report')}
            >
              Export
            </Button>
          </HStack>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Stat>
              <StatLabel>Total Earnings</StatLabel>
              <StatNumber>₹{reports.payrollSummary?.summary?.totalEarnings?.toLocaleString()}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Total Deductions</StatLabel>
              <StatNumber>₹{reports.payrollSummary?.summary?.totalDeductions?.toLocaleString()}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Total Net Pay</StatLabel>
              <StatNumber color="green.600">₹{reports.payrollSummary?.summary?.totalNetPay?.toLocaleString()}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Processed</StatLabel>
              <StatNumber color="blue.600">{reports.payrollSummary?.summary?.processedCount}</StatNumber>
              <StatHelpText>of {reports.payrollSummary?.summary?.totalRecords}</StatHelpText>
            </Stat>
          </SimpleGrid>
        </Box>
      </Stack>
    </PageWrapper>
  );
}

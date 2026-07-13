import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Stack,
  Text,
  Textarea,
  useToast,
  VStack,
  Badge,
  Divider,
  Select,
  Input,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import PageWrapper from '../../components/ui/PageWrapper';
import { fetchPayroll, approvePayroll, processPayroll } from '../../services/payroll';

const statusColors = {
  draft: 'gray',
  pending: 'yellow',
  approved: 'blue',
  rejected: 'red',
  processed: 'green',
  paid: 'green',
};

export default function PayrollDetailPage() {
  const navigate = useNavigate();
  const { payrollId } = useParams();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [payroll, setPayroll] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [paymentMode, setPaymentMode] = useState('bank');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    loadPayroll();
  }, [payrollId]);

  const loadPayroll = async () => {
    try {
      const data = await fetchPayroll(payrollId);
      setPayroll(data);
    } catch (error) {
      toast({ title: 'Error loading payroll', description: error.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await approvePayroll(payrollId, {
        status: 'approved',
        remarks,
      });
      toast({ title: 'Payroll approved', status: 'success' });
      setRemarks('');
      loadPayroll();
    } catch (error) {
      toast({ title: 'Error approving payroll', description: error.message, status: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleProcess = async () => {
    setActionLoading(true);
    try {
      await processPayroll(payrollId, {
        paymentMode,
        transactionId,
      });
      toast({ title: 'Payroll processed', status: 'success' });
      setPaymentMode('bank');
      setTransactionId('');
      loadPayroll();
    } catch (error) {
      toast({ title: 'Error processing payroll', description: error.message, status: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <PageWrapper><Text>Loading...</Text></PageWrapper>;
  if (!payroll) return <PageWrapper><Text>Payroll not found</Text></PageWrapper>;

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <Box>
          <Text fontSize="sm" color="gray.500">Payroll</Text>
          <HStack justify="space-between">
            <Text fontSize="2xl" fontWeight="700">Payroll Details</Text>
            <Badge colorScheme={statusColors[payroll.status] || 'gray'}>
              {payroll.status.toUpperCase()}
            </Badge>
          </HStack>
        </Box>

        {/* Employee & Period Info */}
        <Box p={6} bg="white" borderRadius="lg" borderWidth="1px">
          <Text fontSize="lg" fontWeight="600" mb={4}>Employee Information</Text>
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
              <Text color="gray.600">Employee:</Text>
              <Text fontWeight="600">{payroll.employee?.name}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.600">Employee ID:</Text>
              <Text>{payroll.employee?.employeeId}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.600">Period:</Text>
              <Text fontWeight="600">{payroll.month}/{payroll.year}</Text>
            </HStack>
          </VStack>
        </Box>

        {/* Attendance Data */}
        <Box p={6} bg="white" borderRadius="lg" borderWidth="1px">
          <Text fontSize="lg" fontWeight="600" mb={4}>Attendance Summary</Text>
          <VStack align="stretch" spacing={2}>
            <HStack justify="space-between">
              <Text color="gray.600">Total Working Days:</Text>
              <Text>{payroll.attendanceData?.totalWorkingDays}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.600">Present Days:</Text>
              <Text color="green.600">{payroll.attendanceData?.presentDays}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.600">Absent Days:</Text>
              <Text color="red.600">{payroll.attendanceData?.absentDays}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.600">On Leave:</Text>
              <Text>{payroll.attendanceData?.onLeaveDays}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.600">Holidays:</Text>
              <Text>{payroll.attendanceData?.holidayDays}</Text>
            </HStack>
          </VStack>
        </Box>

        {/* Earnings */}
        <Box p={6} bg="white" borderRadius="lg" borderWidth="1px">
          <Text fontSize="lg" fontWeight="600" mb={4}>Earnings</Text>
          <VStack align="stretch" spacing={2}>
            <HStack justify="space-between">
              <Text color="gray.600">Basic:</Text>
              <Text>₹{payroll.earnings?.basic?.toLocaleString()}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.600">HRA:</Text>
              <Text>₹{payroll.earnings?.hra?.toLocaleString()}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.600">DA:</Text>
              <Text>₹{payroll.earnings?.da?.toLocaleString()}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.600">Allowances:</Text>
              <Text>₹{payroll.earnings?.allowances?.toLocaleString()}</Text>
            </HStack>
            <Divider />
            <HStack justify="space-between">
              <Text fontWeight="600">Total Earnings:</Text>
              <Text fontWeight="600" color="green.600">₹{payroll.earnings?.total?.toLocaleString()}</Text>
            </HStack>
          </VStack>
        </Box>

        {/* Deductions */}
        <Box p={6} bg="white" borderRadius="lg" borderWidth="1px">
          <Text fontSize="lg" fontWeight="600" mb={4}>Deductions</Text>
          <VStack align="stretch" spacing={2}>
            <HStack justify="space-between">
              <Text color="gray.600">PF:</Text>
              <Text>₹{payroll.deductions?.pf?.toLocaleString()}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.600">PT:</Text>
              <Text>₹{payroll.deductions?.pt?.toLocaleString()}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.600">ESIC:</Text>
              <Text>₹{payroll.deductions?.esic?.toLocaleString()}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.600">Loss of Pay:</Text>
              <Text color="red.600">₹{payroll.lossOfPay?.toLocaleString()}</Text>
            </HStack>
            <Divider />
            <HStack justify="space-between">
              <Text fontWeight="600">Total Deductions:</Text>
              <Text fontWeight="600" color="red.600">₹{payroll.deductions?.total?.toLocaleString()}</Text>
            </HStack>
          </VStack>
        </Box>

        {/* Net Pay */}
        <Box p={6} bg="green.50" borderRadius="lg" borderWidth="2px" borderColor="green.200">
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="600">Net Pay:</Text>
            <Text fontSize="2xl" fontWeight="700" color="green.600">
              ₹{payroll.netPay?.toLocaleString()}
            </Text>
          </HStack>
        </Box>

        {/* Actions */}
        {payroll.status === 'pending' && (
          <Box p={6} bg="white" borderRadius="lg" borderWidth="1px">
            <Text fontSize="lg" fontWeight="600" mb={4}>Approval</Text>
            <VStack align="stretch" spacing={4}>
              <FormControl>
                <FormLabel>Remarks</FormLabel>
                <Textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter approval remarks..."
                />
              </FormControl>
              <HStack justify="flex-end" spacing={2}>
                <Button
                  colorScheme="green"
                  isLoading={actionLoading}
                  onClick={handleApprove}
                >
                  Approve
                </Button>
              </HStack>
            </VStack>
          </Box>
        )}

        {payroll.status === 'approved' && (
          <Box p={6} bg="white" borderRadius="lg" borderWidth="1px">
            <Text fontSize="lg" fontWeight="600" mb={4}>Process Payment</Text>
            <VStack align="stretch" spacing={4}>
              <FormControl isRequired>
                <FormLabel>Payment Mode</FormLabel>
                <Select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <option value="bank">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Transaction ID</FormLabel>
                <Input
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction ID..."
                />
              </FormControl>
              <HStack justify="flex-end" spacing={2}>
                <Button
                  colorScheme="blue"
                  isLoading={actionLoading}
                  onClick={handleProcess}
                >
                  Process Payment
                </Button>
              </HStack>
            </VStack>
          </Box>
        )}

        <HStack justify="flex-end" pt={4}>
          <Button variant="outline" onClick={() => navigate('/payroll/payroll')}>
            Back to Payroll
          </Button>
        </HStack>
      </Stack>
    </PageWrapper>
  );
}

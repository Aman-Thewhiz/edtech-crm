import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  Stack,
  Text,
  Textarea,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import PageWrapper from '../../components/ui/PageWrapper';
import {
  createLeaveRequest,
  fetchLeaveRequest,
  fetchLeavePolicies,
  fetchEmployeeLeaveBalances,
} from '../../services/leaves';
import { fetchEmployees } from '../../services/employees';

export default function LeaveRequestFormPage() {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const toast = useToast();
  const [loading, setLoading] = useState(!!requestId);
  const [saving, setSaving] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [balances, setBalances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employee: '',
    leavePolicy: '',
    startDate: '',
    endDate: '',
    numberOfDays: 1,
    reason: '',
    notes: '',
  });

  useEffect(() => {
    loadPolicies();
  }, []);

  useEffect(() => {
    if (requestId) {
      fetchLeaveRequest(requestId)
        .then((request) => {
          setFormData({
            employee: request.employee._id,
            leavePolicy: request.leavePolicy._id,
            startDate: request.startDate.split('T')[0],
            endDate: request.endDate.split('T')[0],
            numberOfDays: request.numberOfDays,
            reason: request.reason,
            notes: request.notes || '',
          });
        })
        .catch((err) => toast({ title: 'Error loading request', description: err.message, status: 'error' }))
        .finally(() => setLoading(false));
    }
  }, [requestId]);

const loadPolicies = async () => {
  try {
    const [policyResult, employeeResult] = await Promise.all([
      fetchLeavePolicies({ isActive: true, limit: 100 }),
      fetchEmployees({ limit: 100 }),
    ]);

    setPolicies(policyResult.data || []);
    setEmployees(employeeResult.data || []);
    console.log(employeeResult.data);
  } catch (error) {
    toast({
      title: 'Error loading data',
      description: error.message,
      status: 'error',
    });
  }
};

  const loadBalances = async (employeeId) => {
    try {
      const currentYear = new Date().getFullYear();
      const financialYear = `${currentYear}-${currentYear + 1}`;
      const result = await fetchEmployeeLeaveBalances(employeeId, financialYear);
      setBalances(result);
    } catch (error) {
      console.error('Error loading balances:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));

    if (field === 'employee') {
      loadBalances(value);
    }

    // Calculate number of days
    if (field === 'startDate' || field === 'endDate') {
      const start = new Date(field === 'startDate' ? value : formData.startDate);
      const end = new Date(field === 'endDate' ? value : formData.endDate);
      if (start && end && start <= end) {
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        setFormData((current) => ({ ...current, numberOfDays: days }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee || !formData.leavePolicy || !formData.startDate || !formData.endDate || !formData.reason) {
      toast({ title: 'Please fill all required fields', status: 'error' });
      return;
    }

    setSaving(true);
    try {
  const payload = {
  employee: formData.employee,
  leavePolicy: formData.leavePolicy,
  startDate: new Date(formData.startDate),
  endDate: new Date(formData.endDate),
  numberOfDays: parseFloat(formData.numberOfDays),
  reason: formData.reason,
  notes: formData.notes.trim() || undefined,
};

      if (requestId) {
        
        toast({ title: 'Update not available for leave requests', status: 'info' });
      } else {
        const request = await createLeaveRequest(payload);
        toast({ title: 'Leave request submitted', status: 'success' });
        navigate(`/leaves/requests/${request._id}`);
      }
    } catch (error) {
      toast({ title: 'Error saving request', description: error.message, status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageWrapper><Text>Loading...</Text></PageWrapper>;

  const selectedPolicy = policies.find((p) => p._id === formData.leavePolicy);
  const selectedBalance = balances.find((b) => b.leavePolicy._id === formData.leavePolicy);

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <Box>
          <Text fontSize="sm" color="gray.500">Leave Management / Requests</Text>
          <Text fontSize="2xl" fontWeight="700">
            {requestId ? 'View Leave Request' : 'New Leave Request'}
          </Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack align="stretch" spacing={4}>
            <FormControl isRequired>
  <FormLabel>Employee</FormLabel>

  <Select
    placeholder="Select Employee"
    value={formData.employee}
    onChange={(e) => handleChange('employee', e.target.value)}
    disabled={requestId}
  >
    {employees.map((employee) => (
      <option key={employee.id} value={employee.id}>
  {employee.name} ({employee.employeeId})
</option>
    ))}
  </Select>
</FormControl>

            <FormControl isRequired>
              <FormLabel>Leave Type</FormLabel>
              <Select
                value={formData.leavePolicy}
                onChange={(e) => handleChange('leavePolicy', e.target.value)}
                disabled={requestId}
              >
                <option value="">Select leave type</option>
                {policies.map((policy) => (
                  <option key={policy._id} value={policy._id}>
                    {policy.leaveType} (Annual: {policy.annualQuota} days)
                  </option>
                ))}
              </Select>
            </FormControl>

            {selectedBalance && (
              <Box p={4} bg="blue.50" borderRadius="md">
                <Text fontSize="sm" color="blue.900">
                  <strong>Available Balance:</strong> {selectedBalance.balanceDays} days
                  ({selectedBalance.usedDays} used, {selectedBalance.pendingDays} pending)
                </Text>
              </Box>
            )}

            <FormControl isRequired>
              <FormLabel>Start Date</FormLabel>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                disabled={requestId}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>End Date</FormLabel>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                disabled={requestId}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Number of Days</FormLabel>
              <Input
                type="number"
                value={formData.numberOfDays}
                onChange={(e) => handleChange('numberOfDays', e.target.value)}
                min="0.5"
                step="0.5"
                disabled={requestId}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Reason</FormLabel>
              <Textarea
                value={formData.reason}
                onChange={(e) => handleChange('reason', e.target.value)}
                placeholder="Reason for leave..."
                disabled={requestId}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Additional Notes</FormLabel>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Any additional notes..."
                disabled={requestId}
              />
            </FormControl>

            {!requestId && (
              <HStack justify="flex-end" pt={4}>
                <Button variant="outline" onClick={() => navigate('/leaves/requests')}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={saving}>
                  Submit Request
                </Button>
              </HStack>
            )}

            {requestId && (
              <HStack justify="flex-end" pt={4}>
                <Button onClick={() => navigate('/leaves/requests')}>
                  Back to Requests
                </Button>
              </HStack>
            )}
          </VStack>
        </form>
      </Stack>
    </PageWrapper>
  );
}

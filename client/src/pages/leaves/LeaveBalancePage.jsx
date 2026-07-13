import { useState, useEffect } from 'react';
import {
  Box,
  Select,
  Stack,
  Text,
  useToast,
  VStack,
  SimpleGrid,
} from '@chakra-ui/react';
import PageWrapper from '../../components/ui/PageWrapper';
import LeaveBalanceCard from '../../components/leaves/LeaveBalanceCard';
import { fetchEmployeeLeaveBalances } from '../../services/leaves';

export default function LeaveBalancePage() {
  const toast = useToast();
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setSelectedYear(`${currentYear}-${currentYear + 1}`);
  }, []);

  useEffect(() => {
    if (selectedYear) {
      loadBalances();
    }
  }, [selectedYear]);

  const loadBalances = async () => {
    setLoading(true);
    try {
      // Note: In a real scenario, we would get the current employee ID from auth context
      // For now, this is a placeholder that would need to be connected to the actual employee
      const employeeId = localStorage.getItem('employeeId');
      if (!employeeId) {
        toast({ title: 'Employee ID not found', status: 'error' });
        return;
      }

      const result = await fetchEmployeeLeaveBalances(employeeId, selectedYear);
      setBalances(result);
    } catch (error) {
      toast({ title: 'Error loading balances', description: error.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const years = [];
  for (let i = 0; i < 3; i++) {
    const year = new Date().getFullYear() - i;
    years.push(`${year}-${year + 1}`);
  }

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <Box>
          <Text fontSize="sm" color="gray.500">Leave Management</Text>
          <Text fontSize="2xl" fontWeight="700">Leave Balance</Text>
        </Box>

        <Select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          maxW="200px"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </Select>

        {loading ? (
          <Text>Loading leave balances...</Text>
        ) : balances.length === 0 ? (
          <Box p={6} bg="gray.50" borderRadius="md" textAlign="center">
            <Text color="gray.600">No leave balances found for this period</Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {balances.map((balance) => (
              <LeaveBalanceCard key={balance._id} balance={balance} />
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </PageWrapper>
  );
}

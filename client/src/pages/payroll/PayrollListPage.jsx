import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  HStack,
  Select,
  Stack,
  Text,
  useToast,
  Badge,
  VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/ui/PageWrapper';
import DataTable from '../../components/ui/DataTable';
import { fetchPayrolls } from '../../services/payroll';

const statusColors = {
  draft: 'gray',
  pending: 'yellow',
  approved: 'blue',
  rejected: 'red',
  processed: 'green',
  paid: 'green',
};

export default function PayrollListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    page: 1,
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadPayrolls();
  }, [filters]);

  const loadPayrolls = async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit: 10 };
      Object.keys(params).forEach((key) => !params[key] && delete params[key]);
      const result = await fetchPayrolls(params);
      setPayrolls(result.data);
      setPagination(result.pagination);
    } catch (error) {
      toast({ title: 'Error loading payrolls', description: error.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Employee',
      accessor: 'employee',
      render: (value) => <Text fontWeight="600">{value?.name || 'N/A'}</Text>,
    },
    {
      header: 'Month/Year',
      accessor: 'month',
      render: (value, row) => <Text>{value}/{row.year}</Text>,
    },
    {
      header: 'Earnings',
      accessor: 'earnings',
      render: (value) => <Text>₹{value?.total?.toLocaleString()}</Text>,
    },
    {
      header: 'Deductions',
      accessor: 'deductions',
      render: (value) => <Text>₹{value?.total?.toLocaleString()}</Text>,
    },
    {
      header: 'Net Pay',
      accessor: 'netPay',
      render: (value) => <Text fontWeight="600" color="green.600">₹{value?.toLocaleString()}</Text>,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <Badge colorScheme={statusColors[value] || 'gray'}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <HStack spacing={2}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/payroll/payroll/${row._id}`)}
          >
            View
          </Button>
        </HStack>
      ),
    },
  ];

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <Box>
          <Text fontSize="sm" color="gray.500">Payroll</Text>
          <Text fontSize="2xl" fontWeight="700">Payroll Records</Text>
        </Box>

        <HStack spacing={4} align="flex-end">
          <Select
            value={filters.month}
            onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value), page: 1 })}
            maxW="150px"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </Select>

          <Select
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value), page: 1 })}
            maxW="150px"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>

          <Select
            placeholder="Filter by status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            maxW="200px"
          >
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="processed">Processed</option>
            <option value="paid">Paid</option>
          </Select>
        </HStack>

        <Box overflowX="auto">
          <DataTable
            columns={columns}
            data={payrolls}
            loading={loading}
            onPageChange={(page) => setFilters({ ...filters, page })}
            pagination={pagination}
          />
        </Box>
      </Stack>
    </PageWrapper>
  );
}

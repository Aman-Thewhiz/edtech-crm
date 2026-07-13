import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  HStack,
  Input,
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
import { fetchLeaveRequests, cancelLeaveRequest } from '../../services/leaves';

const statusColors = {
  applied: 'blue',
  pending: 'yellow',
  approved: 'green',
  rejected: 'red',
  cancelled: 'gray',
};

export default function LeaveRequestListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    employee: '',
    page: 1,
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadRequests();
  }, [filters]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit: 10 };
      Object.keys(params).forEach((key) => !params[key] && delete params[key]);
      const result = await fetchLeaveRequests(params);
      setRequests(result.data);
      setPagination(result.pagination);
    } catch (error) {
      toast({ title: 'Error loading requests', description: error.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
    try {
      await cancelLeaveRequest(id, { reason: 'Cancelled by employee' });
      toast({ title: 'Request cancelled', status: 'success' });
      loadRequests();
    } catch (error) {
      toast({ title: 'Error cancelling request', description: error.message, status: 'error' });
    }
  };

  const columns = [
    {
      header: 'Employee',
      accessor: 'employee',
      render: (value) => <Text fontWeight="600">{value?.name || 'N/A'}</Text>,
    },
    {
      header: 'Leave Type',
      accessor: 'leavePolicy',
      render: (value) => <Text>{value?.leaveType || 'N/A'}</Text>,
    },
    {
      header: 'Start Date',
      accessor: 'startDate',
      render: (value) => <Text>{new Date(value).toLocaleDateString()}</Text>,
    },
    {
      header: 'End Date',
      accessor: 'endDate',
      render: (value) => <Text>{new Date(value).toLocaleDateString()}</Text>,
    },
    {
      header: 'Days',
      accessor: 'numberOfDays',
      render: (value) => <Text>{value}</Text>,
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
            onClick={() => navigate(`/leaves/requests/${row._id}`)}
          >
            View
          </Button>
          {row.status === 'applied' && (
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              onClick={() => handleCancel(row._id)}
            >
              Cancel
            </Button>
          )}
        </HStack>
      ),
    },
  ];

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <Box>
          <Text fontSize="sm" color="gray.500">Leave Management</Text>
          <Text fontSize="2xl" fontWeight="700">Leave Requests</Text>
        </Box>

        <HStack justify="space-between" align="flex-end" spacing={4}>
          <HStack spacing={4} flex={1}>
            <Select
              placeholder="Filter by status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              maxW="200px"
            >
              <option value="applied">Applied</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </HStack>
          <Button
            colorScheme="purple"
            onClick={() => navigate('/leaves/requests/new')}
          >
            New Request
          </Button>
        </HStack>

        <Box overflowX="auto">
          <DataTable
            columns={columns}
            data={requests}
            loading={loading}
            onPageChange={(page) => setFilters({ ...filters, page })}
            pagination={pagination}
          />
        </Box>
      </Stack>
    </PageWrapper>
  );
}

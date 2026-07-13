import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  HStack,
  Input,
  Stack,
  Text,
  useToast,
  Badge,
  VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/ui/PageWrapper';
import DataTable from '../../components/ui/DataTable';
import { fetchLeavePolicies, deleteLeavePolicy } from '../../services/leaves';

export default function LeavePolicyListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadPolicies();
  }, [page, search]);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const result = await fetchLeavePolicies({ search, page, limit: 10 });
      setPolicies(result.data);
      setPagination(result.pagination);
    } catch (error) {
      toast({ title: 'Error loading policies', description: error.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) return;
    try {
      await deleteLeavePolicy(id);
      toast({ title: 'Policy deleted', status: 'success' });
      loadPolicies();
    } catch (error) {
      toast({ title: 'Error deleting policy', description: error.message, status: 'error' });
    }
  };

  const columns = [
    {
      header: 'Leave Type',
      accessor: 'leaveType',
      render: (value) => <Text fontWeight="600">{value}</Text>,
    },
    {
      header: 'Code',
      accessor: 'code',
    },
    {
      header: 'Annual Quota',
      accessor: 'annualQuota',
      render: (value) => <Text>{value} days</Text>,
    },
    {
      header: 'Carry Forward',
      accessor: 'carryForwardAllowed',
      render: (value) => (
        <Badge colorScheme={value ? 'green' : 'gray'}>
          {value ? 'Allowed' : 'Not Allowed'}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (value) => (
        <Badge colorScheme={value ? 'green' : 'red'}>
          {value ? 'Active' : 'Inactive'}
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
            onClick={() => navigate(`/leaves/policies/${row._id}`)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            colorScheme="red"
            variant="outline"
            onClick={() => handleDelete(row._id)}
          >
            Delete
          </Button>
        </HStack>
      ),
    },
  ];

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <Box>
          <Text fontSize="sm" color="gray.500">Leave Management</Text>
          <Text fontSize="2xl" fontWeight="700">Leave Policies</Text>
        </Box>

        <HStack justify="space-between">
          <Input
            placeholder="Search policies..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            maxW="300px"
          />
          <Button
            colorScheme="purple"
            onClick={() => navigate('/leaves/policies/new')}
          >
            New Policy
          </Button>
        </HStack>

        <Box overflowX="auto">
          <DataTable
            columns={columns}
            data={policies}
            loading={loading}
            onPageChange={setPage}
            pagination={pagination}
          />
        </Box>
      </Stack>
    </PageWrapper>
  );
}

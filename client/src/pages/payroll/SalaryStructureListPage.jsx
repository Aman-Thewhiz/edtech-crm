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
import { fetchSalaryStructures, deleteSalaryStructure } from '../../services/payroll';

export default function SalaryStructureListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadStructures();
  }, [page, search]);

  const loadStructures = async () => {
    setLoading(true);
    try {
      const result = await fetchSalaryStructures({ search, page, limit: 10 });
      setStructures(result.data);
      setPagination(result.pagination);
    } catch (error) {
      toast({ title: 'Error loading structures', description: error.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this salary structure?')) return;
    try {
      await deleteSalaryStructure(id);
      toast({ title: 'Structure deleted', status: 'success' });
      loadStructures();
    } catch (error) {
      toast({ title: 'Error deleting structure', description: error.message, status: 'error' });
    }
  };

  const columns = [
    {
      header: 'Employee',
      accessor: 'employee',
      render: (value) => <Text fontWeight="600">{value?.name || 'N/A'}</Text>,
    },
    {
      header: 'Basic Salary',
      accessor: 'basic',
      render: (value) => <Text>₹{value?.toLocaleString()}</Text>,
    },
    {
      header: 'Gross Salary',
      accessor: 'grossSalary',
      render: (value) => <Text fontWeight="600">₹{value?.toLocaleString()}</Text>,
    },
    {
      header: 'Net Salary',
      accessor: 'netSalary',
      render: (value) => <Text fontWeight="600" color="green.600">₹{value?.toLocaleString()}</Text>,
    },
    {
      header: 'Effective From',
      accessor: 'effectiveFrom',
      render: (value) => <Text>{new Date(value).toLocaleDateString()}</Text>,
    },
    {
      header: 'Actions',
      render: (row) => (
        <HStack spacing={2}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/payroll/salary-structures/${row._id}`)}
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
          <Text fontSize="sm" color="gray.500">Payroll</Text>
          <Text fontSize="2xl" fontWeight="700">Salary Structures</Text>
        </Box>

        <HStack justify="space-between">
          <Input
            placeholder="Search by employee..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            maxW="300px"
          />
          <Button
            colorScheme="purple"
            onClick={() => navigate('/payroll/salary-structures/new')}
          >
            New Structure
          </Button>
        </HStack>

        <Box overflowX="auto">
          <DataTable
            columns={columns}
            data={structures}
            loading={loading}
            onPageChange={setPage}
            pagination={pagination}
          />
        </Box>
      </Stack>
    </PageWrapper>
  );
}

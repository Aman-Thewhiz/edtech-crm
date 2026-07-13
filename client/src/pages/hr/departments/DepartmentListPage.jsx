import { useState, useEffect, useMemo } from 'react';
import { Badge, Box, Button, HStack, Input, Select, SimpleGrid, Stack, Text, useToast } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../../components/ui/DataTable';
import EmptyState from '../../../components/ui/EmptyState';
import PageWrapper from '../../../components/ui/PageWrapper';
import { deleteDepartment, fetchDepartments } from '../../../services/departments';

const statusOptions = ['active', 'inactive'];

const statusColors = {
  active: 'green',
  inactive: 'gray',
};

export default function DepartmentListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });

  const loadDepartments = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const response = await fetchDepartments({ ...nextFilters, limit: 20 });
      setDepartments(response.data || []);
      setPagination(response.pagination || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value }));

  const clearFilters = async () => {
    const empty = { search: '', status: '' };
    setFilters(empty);
    await loadDepartments(empty);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await deleteDepartment(id);
      toast({ title: 'Department deleted', status: 'success' });
      await loadDepartments();
    } catch (error) {
      toast({ title: 'Error deleting department', description: error.message, status: 'error' });
    }
  };

  const columns = useMemo(() => ([
    {
      key: 'name',
      header: 'Department',
      render: (row) => <Link to={`/hr/departments/${row._id}`} style={{ color: '#1264a3' }}>{row.name}</Link>,
    },
    {
      key: 'code',
      header: 'Code',
      render: (row) => <Badge borderRadius="full">{row.code}</Badge>,
    },
    {
      key: 'headEmployee',
      header: 'Head',
      render: (row) => row.headEmployee?.name || '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge borderRadius="full" colorScheme={statusColors[row.status]}>{row.status}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <HStack spacing={2}>
          <Button size="sm" variant="outline" onClick={() => navigate(`/hr/departments/${row._id}`)}>View</Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(row._id)}>Delete</Button>
        </HStack>
      ),
    },
  ]), [navigate]);

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Box>
            <Text fontSize="sm" color="gray.500">HR / Departments</Text>
            <Text fontSize="2xl" fontWeight="700">Departments</Text>
          </Box>
          <Button onClick={() => navigate('/hr/departments/new')}>Add Department</Button>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
          <Input
            placeholder="Search department"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
          />
          <Select
            placeholder="Status"
            value={filters.status}
            onChange={(event) => updateFilter('status', event.target.value)}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </SimpleGrid>

        <HStack>
          <Button variant="outline" onClick={() => loadDepartments()}>
            Apply filters
          </Button>
          <Button variant="secondary" onClick={clearFilters}>
            Clear
          </Button>
        </HStack>

        {!loading && departments.length === 0 ? (
          <EmptyState
            title="No departments found"
            description="Create a department to organize your organization."
          />
        ) : null}
        <DataTable columns={columns} data={departments} />
        <HStack justify="space-between" color="gray.500" fontSize="sm">
          <Text>
            Page {pagination.page || 1} of {pagination.totalPages || 1}
          </Text>
          <Text>{pagination.total || 0} total departments</Text>
        </HStack>
      </Stack>
    </PageWrapper>
  );
}

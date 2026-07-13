import { useState, useEffect, useMemo } from 'react';
import { Badge, Box, Button, HStack, Input, Select, SimpleGrid, Stack, Text, useToast } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../../components/ui/DataTable';
import EmptyState from '../../../components/ui/EmptyState';
import PageWrapper from '../../../components/ui/PageWrapper';
import { deleteDesignation, fetchDesignations } from '../../../services/designations';
import { fetchDepartments } from '../../../services/departments';

const levelOptions = ['entry', 'mid', 'senior', 'lead', 'manager', 'director'];
const statusOptions = ['active', 'inactive'];

const statusColors = {
  active: 'green',
  inactive: 'gray',
};

export default function DesignationListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [designations, setDesignations] = useState([]);
  const [pagination, setPagination] = useState({});
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    level: '',
    status: '',
  });

  const loadDesignations = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const response = await fetchDesignations({ ...nextFilters, limit: 20 });
      setDesignations(response.data || []);
      setPagination(response.pagination || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDesignations();
    fetchDepartments({ limit: 100 }).then((res) => setDepartments(res.data || []));
  }, []);

  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value }));

  const clearFilters = async () => {
    const empty = { search: '', department: '', level: '', status: '' };
    setFilters(empty);
    await loadDesignations(empty);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this designation?')) return;
    try {
      await deleteDesignation(id);
      toast({ title: 'Designation deleted', status: 'success' });
      await loadDesignations();
    } catch (error) {
      toast({ title: 'Error deleting designation', description: error.message, status: 'error' });
    }
  };

  const columns = useMemo(() => ([
    {
      key: 'name',
      header: 'Designation',
      render: (row) => <Link to={`/hr/designations/${row._id}`} style={{ color: '#1264a3' }}>{row.name}</Link>,
    },
    {
      key: 'code',
      header: 'Code',
      render: (row) => <Badge borderRadius="full">{row.code}</Badge>,
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => row.department?.name || '-',
    },
    {
      key: 'level',
      header: 'Level',
      render: (row) => <Badge borderRadius="full">{row.level}</Badge>,
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
          <Button size="sm" variant="outline" onClick={() => navigate(`/hr/designations/${row._id}`)}>View</Button>
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
            <Text fontSize="sm" color="gray.500">HR / Designations</Text>
            <Text fontSize="2xl" fontWeight="700">Designations</Text>
          </Box>
          <Button onClick={() => navigate('/hr/designations/new')}>Add Designation</Button>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={3}>
          <Input
            placeholder="Search designation"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
          />
          <Select
            placeholder="Department"
            value={filters.department}
            onChange={(event) => updateFilter('department', event.target.value)}
          >
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </Select>
          <Select
            placeholder="Level"
            value={filters.level}
            onChange={(event) => updateFilter('level', event.target.value)}
          >
            {levelOptions.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </Select>
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
          <Button variant="outline" onClick={() => loadDesignations()}>
            Apply filters
          </Button>
          <Button variant="secondary" onClick={clearFilters}>
            Clear
          </Button>
        </HStack>

        {!loading && designations.length === 0 ? (
          <EmptyState
            title="No designations found"
            description="Create a designation to define job roles."
          />
        ) : null}
        <DataTable columns={columns} data={designations} />
        <HStack justify="space-between" color="gray.500" fontSize="sm">
          <Text>
            Page {pagination.page || 1} of {pagination.totalPages || 1}
          </Text>
          <Text>{pagination.total || 0} total designations</Text>
        </HStack>
      </Stack>
    </PageWrapper>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { Badge, Box, Button, HStack, Input, Select, SimpleGrid, Stack, Text, useToast } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import PageWrapper from '../../components/ui/PageWrapper';
import { deleteHoliday, fetchHolidays } from '../../services/attendance';

const typeOptions = ['national', 'regional', 'company'];

const typeColors = {
  national: 'blue',
  regional: 'purple',
  company: 'orange',
};

export default function HolidayListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [holidays, setHolidays] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    type: '',
  });

  const loadHolidays = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const response = await fetchHolidays({ ...nextFilters, limit: 20 });
      setHolidays(response.data || []);
      setPagination(response.pagination || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHolidays();
  }, []);

  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value }));

  const clearFilters = async () => {
    const empty = { search: '', type: '' };
    setFilters(empty);
    await loadHolidays(empty);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this holiday?')) return;
    try {
      await deleteHoliday(id);
      toast({ title: 'Holiday deleted', status: 'success' });
      await loadHolidays();
    } catch (error) {
      toast({ title: 'Error deleting holiday', description: error.message, status: 'error' });
    }
  };

  const columns = useMemo(() => ([
    {
      key: 'name',
      header: 'Holiday',
      render: (row) => (
        <Link to={`/attendance/holidays/${row._id}`} style={{ color: '#1264a3' }}>
          {row.name}
        </Link>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => new Date(row.date).toLocaleDateString(),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => <Badge borderRadius="full" colorScheme={typeColors[row.type]}>{row.type}</Badge>,
    },
    {
      key: 'applicableFor',
      header: 'Applicable For',
      render: (row) => row.applicableFor.join(', '),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <HStack spacing={2}>
          <Button size="sm" variant="outline" onClick={() => navigate(`/attendance/holidays/${row._id}`)}>
            View
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(row._id)}>
            Delete
          </Button>
        </HStack>
      ),
    },
  ]), [navigate]);

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Box>
            <Text fontSize="sm" color="gray.500">Attendance / Holidays</Text>
            <Text fontSize="2xl" fontWeight="700">Holidays</Text>
          </Box>
          <Button onClick={() => navigate('/attendance/holidays/new')}>Add Holiday</Button>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
          <Input
            placeholder="Search holiday"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
          />
          <Select
            placeholder="Type"
            value={filters.type}
            onChange={(event) => updateFilter('type', event.target.value)}
          >
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </SimpleGrid>

        <HStack>
          <Button variant="outline" onClick={() => loadHolidays()}>
            Apply filters
          </Button>
          <Button variant="secondary" onClick={clearFilters}>
            Clear
          </Button>
        </HStack>

        {!loading && holidays.length === 0 ? (
          <EmptyState
            title="No holidays found"
            description="Add holidays to manage attendance."
          />
        ) : null}
        <DataTable columns={columns} data={holidays} />
        <HStack justify="space-between" color="gray.500" fontSize="sm">
          <Text>
            Page {pagination.page || 1} of {pagination.totalPages || 1}
          </Text>
          <Text>{pagination.total || 0} total holidays</Text>
        </HStack>
      </Stack>
    </PageWrapper>
  );
}

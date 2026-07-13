import { useEffect, useMemo, useState } from 'react';
import { Badge, Box, Button, HStack, Input, Select, SimpleGrid, Stack, Text, useToast } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import PageWrapper from '../../components/ui/PageWrapper';
import { fetchBatches, fetchCourses } from '../../services/courses';
import { deleteAdmission, fetchAdmissions } from '../../services/admissions';

const statusOptions = ['initiated', 'documents-pending', 'documents-verified', 'fee-pending', 'enrolled'];

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

export default function AdmissionListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [admissions, setAdmissions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [filters, setFilters] = useState({ q: '', status: '', course: '', batch: '' });

  const loadAdmissions = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const response = await fetchAdmissions({ ...nextFilters, limit: 20 });
      setAdmissions(response.data || []);
      setPagination(response.pagination || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmissions();
    fetchCourses({ limit: 100 }).then((response) => setCourses(response.data || []));
    fetchBatches({ limit: 100 }).then((response) => setBatches(response.data || []));
  }, []);

  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value }));

  const clearFilters = async () => {
    const empty = { q: '', status: '', course: '', batch: '' };
    setFilters(empty);
    await loadAdmissions(empty);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this admission?')) return;
    await deleteAdmission(id);
    toast({ title: 'Admission deleted', status: 'success' });
    await loadAdmissions();
  };

  const columns = useMemo(() => ([
    { key: 'name', header: 'Applicant', render: (row) => <Link to={`/admissions/${row.id}`}>{row.name}</Link> },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'course', header: 'Course', render: (row) => row.course?.name || '-' },
    { key: 'batch', header: 'Batch', render: (row) => row.batch?.name || '-' },
    { key: 'status', header: 'Status', render: (row) => <Badge borderRadius="full">{row.status}</Badge> },
    { key: 'invoice', header: 'Invoice', render: (row) => row.invoiceStub?.invoiceNumber || row.invoiceStub?.status || '-' },
    { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <HStack spacing={2}>
          <Button size="sm" variant="outline" onClick={() => navigate(`/admissions/${row.id}`)}>View</Button>
          <Button size="sm" onClick={() => navigate(`/admissions/${row.id}/edit`)} isDisabled={row.status === 'enrolled'}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(row.id)} isDisabled={row.status === 'enrolled'}>Delete</Button>
        </HStack>
      ),
    },
  ]), [navigate]);

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Box>
            <Text fontSize="sm" color="gray.500">Admissions / Pipeline</Text>
            <Text fontSize="2xl" fontWeight="700">Admissions</Text>
          </Box>
          <Button onClick={() => navigate('/admissions/new')}>New Admission</Button>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={3}>
          <Input placeholder="Search applicant, email, phone" value={filters.q} onChange={(event) => updateFilter('q', event.target.value)} />
          <Select placeholder="Status" value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
            {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
          </Select>
          <Select placeholder="Course" value={filters.course} onChange={(event) => updateFilter('course', event.target.value)}>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
          </Select>
          <Select placeholder="Batch" value={filters.batch} onChange={(event) => updateFilter('batch', event.target.value)}>
            {batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}
          </Select>
        </SimpleGrid>

        <HStack>
          <Button variant="outline" onClick={() => loadAdmissions()}>Apply filters</Button>
          <Button variant="secondary" onClick={clearFilters}>Clear</Button>
        </HStack>

        {!loading && admissions.length === 0 ? <EmptyState title="No admissions found" description="Convert a qualified lead into an admission to start the workflow." /> : null}
        <DataTable columns={columns} data={admissions} />
        <HStack justify="space-between" color="gray.500" fontSize="sm">
          <Text>Page {pagination.page || 1} of {pagination.totalPages || 1}</Text>
          <Text>{pagination.total || 0} total admissions</Text>
        </HStack>
      </Stack>
    </PageWrapper>
  );
}

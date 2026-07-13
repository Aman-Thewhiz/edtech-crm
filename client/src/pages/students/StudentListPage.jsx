import { useEffect, useMemo, useState } from 'react';
import { Badge, Box, Button, HStack, Input, Select, SimpleGrid, Stack, Text, useToast } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import PageWrapper from '../../components/ui/PageWrapper';
import { fetchBatches, fetchCourses } from '../../services/courses';
import { deleteStudent, fetchStudents } from '../../services/students';

const statusOptions = ['active', 'inactive', 'graduated', 'dropped'];

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

export default function StudentListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({});
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [filters, setFilters] = useState({ q: '', course: '', batch: '', status: '', enrollmentYear: '' });

  const loadStudents = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const response = await fetchStudents({ ...nextFilters, limit: 20 });
      setStudents(response.data || []);
      setPagination(response.pagination || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
    fetchCourses({ limit: 100 }).then((response) => setCourses(response.data || []));
    fetchBatches({ limit: 100 }).then((response) => setBatches(response.data || []));
  }, []);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const clearFilters = async () => {
    const empty = { q: '', course: '', batch: '', status: '', enrollmentYear: '' };
    setFilters(empty);
    await loadStudents(empty);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    await deleteStudent(id);
    toast({ title: 'Student deleted', status: 'success' });
    await loadStudents();
  };

  const columns = useMemo(() => ([
    { key: 'enrollmentNumber', header: 'Enrollment No.', render: (row) => <Link to={`/students/${row.id}`}>{row.enrollmentNumber}</Link> },
    { key: 'name', header: 'Student', render: (row) => <Link to={`/students/${row.id}`}>{row.name}</Link> },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'course', header: 'Course', render: (row) => row.course?.name || '-' },
    { key: 'batch', header: 'Batch', render: (row) => row.batch?.name || '-' },
    { key: 'status', header: 'Status', render: (row) => <Badge borderRadius="full">{row.status}</Badge> },
    { key: 'enrollmentDate', header: 'Enrolled', render: (row) => formatDate(row.enrollmentDate) },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <HStack spacing={2}>
          <Button size="sm" variant="outline" onClick={() => navigate(`/students/${row.id}`)}>View</Button>
          <Button size="sm" onClick={() => navigate(`/students/${row.id}/edit`)}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(row.id)}>Delete</Button>
        </HStack>
      ),
    },
  ]), [navigate, filters]);

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Box>
            <Text fontSize="sm" color="gray.500">Academics / Student Management</Text>
            <Text fontSize="2xl" fontWeight="700">Students</Text>
          </Box>
          <Button onClick={() => navigate('/students/new')}>New Student</Button>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 5 }} spacing={3}>
          <Input placeholder="Search name, enrollment no., email, phone" value={filters.q} onChange={(event) => updateFilter('q', event.target.value)} />
          <Select placeholder="Course" value={filters.course} onChange={(event) => updateFilter('course', event.target.value)}>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
          </Select>
          <Select placeholder="Batch" value={filters.batch} onChange={(event) => updateFilter('batch', event.target.value)}>
            {batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}
          </Select>
          <Select placeholder="Status" value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
            {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
          </Select>
          <Input placeholder="Enrollment year" type="number" value={filters.enrollmentYear} onChange={(event) => updateFilter('enrollmentYear', event.target.value)} />
        </SimpleGrid>

        <HStack>
          <Button variant="outline" onClick={() => loadStudents()}>Apply filters</Button>
          <Button variant="secondary" onClick={clearFilters}>Clear</Button>
        </HStack>

        {!loading && students.length === 0 ? <EmptyState title="No students found" description="Create a student profile or adjust the filters." /> : null}
        <DataTable columns={columns} data={students} />
        <HStack justify="space-between" color="gray.500" fontSize="sm">
          <Text>Page {pagination.page || 1} of {pagination.totalPages || 1}</Text>
          <Text>{pagination.total || 0} total students</Text>
        </HStack>
      </Stack>
    </PageWrapper>
  );
}

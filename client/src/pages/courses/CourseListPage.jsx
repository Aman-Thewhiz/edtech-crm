import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import PageWrapper from '../../components/ui/PageWrapper';
import { deleteCourse, fetchCourses, fetchCourseCategories } from '../../services/courses';

const statusOptions = ['active', 'inactive', 'completed', 'cancelled'];

export default function CourseListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ q: '', status: '', category: '' });

  const loadCourses = async () => {
    setLoading(true);
    try {
      const response = await fetchCourses({ ...filters, limit: 20 });
      setCourses(response.data || []);
      setPagination(response.pagination || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([loadCourses(), fetchCourseCategories().then(setCategories)]);
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const applyFilters = async () => {
    await loadCourses();
  };

  const clearFilters = async () => {
    setFilters({ q: '', status: '', category: '' });
    const response = await fetchCourses({ limit: 20 });
    setCourses(response.data || []);
    setPagination(response.pagination || {});
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course and its batches?')) return;
    await deleteCourse(id);
    toast({ title: 'Course deleted', status: 'success' });
    await loadCourses();
  };

  const columns = useMemo(() => ([
    { key: 'name', header: 'Course', render: (row) => <Link to={`/courses/${row.id}`}>{row.name}</Link> },
    { key: 'description', header: 'Description', render: (row) => <Text noOfLines={2}>{row.description || '-'}</Text> },
    { key: 'duration', header: 'Duration' },
    { key: 'fee', header: 'Fee', render: (row) => `₹${Number(row.fee).toLocaleString()}` },
    { key: 'category', header: 'Category', render: (row) => row.category?.name || '-' },
    { key: 'status', header: 'Status', render: (row) => <Badge borderRadius="full">{row.status}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <HStack spacing={2}>
          <Button size="sm" variant="outline" onClick={() => navigate(`/courses/${row.id}`)}>View</Button>
          <Button size="sm" onClick={() => navigate(`/courses/${row.id}/edit`)}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(row.id)}>Delete</Button>
        </HStack>
      ),
    },
  ]), [navigate]);

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Box>
            <Text fontSize="sm" color="gray.500">Academics / Course Management</Text>
            <Text fontSize="2xl" fontWeight="700">Courses</Text>
          </Box>
          <Button onClick={() => navigate('/courses/new')}>New Course</Button>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
          <Input placeholder="Search course name" value={filters.q} onChange={(event) => handleFilterChange('q', event.target.value)} />
          <Select placeholder="Status" value={filters.status} onChange={(event) => handleFilterChange('status', event.target.value)}>
            {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
          </Select>
          <Select placeholder="Category" value={filters.category} onChange={(event) => handleFilterChange('category', event.target.value)}>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </Select>
        </SimpleGrid>

        <HStack>
          <Button variant="outline" onClick={applyFilters}>Apply filters</Button>
          <Button variant="secondary" onClick={clearFilters}>Clear</Button>
        </HStack>

        {!loading && courses.length === 0 ? <EmptyState title="No courses found" description="Create a course to start organizing batches." /> : null}

        <DataTable columns={columns} data={courses} />

        <HStack justify="space-between" color="gray.500" fontSize="sm">
          <Text>Page {pagination.page || 1} of {pagination.totalPages || 1}</Text>
          <Text>{pagination.total || 0} total courses</Text>
        </HStack>
      </Stack>
    </PageWrapper>
  );
}
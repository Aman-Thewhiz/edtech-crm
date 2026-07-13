import { useEffect, useState } from 'react';
import { Badge, Box, Button, Heading, HStack, SimpleGrid, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useToast, VStack } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import PageWrapper from '../../components/ui/PageWrapper';
import EmptyState from '../../components/ui/EmptyState';
import DataTable from '../../components/ui/DataTable';
import { deleteBatch, deleteCourse, fetchBatches, fetchCourse } from '../../services/courses';

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [batches, setBatches] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [courseResponse, batchResponse] = await Promise.all([
        fetchCourse(courseId),
        fetchBatches({ course: courseId, limit: 50 }),
      ]);
      setCourse(courseResponse);
      setBatches(batchResponse.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId]);

  const handleDeleteCourse = async () => {
    if (!window.confirm('Delete this course and all linked batches?')) return;
    await deleteCourse(courseId);
    toast({ title: 'Course deleted', status: 'success' });
    navigate('/courses');
  };

  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm('Delete this batch?')) return;
    await deleteBatch(batchId);
    toast({ title: 'Batch deleted', status: 'success' });
    await loadData();
  };

  if (loading) {
    return <PageWrapper><Text>Loading course...</Text></PageWrapper>;
  }

  if (!course) {
    return <PageWrapper><EmptyState title="Course not found" description="The course may have been deleted or you may not have access." /></PageWrapper>;
  }

  const batchColumns = [
    { key: 'name', header: 'Batch' },
    { key: 'startDate', header: 'Start', render: (row) => formatDate(row.startDate) },
    { key: 'endDate', header: 'End', render: (row) => formatDate(row.endDate) },
    { key: 'capacity', header: 'Capacity' },
    { key: 'schedule', header: 'Schedule' },
    { key: 'enrollmentCount', header: 'Enrolled', render: (row) => `${row.enrollmentCount}/${row.capacity}` },
    { key: 'status', header: 'Status', render: (row) => <Badge borderRadius="full">{row.status}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <HStack spacing={2}>
          <Button size="sm" onClick={() => navigate(`/courses/${courseId}/batches/${row.id}/edit`)}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={() => handleDeleteBatch(row.id)}>Delete</Button>
        </HStack>
      ),
    },
  ];

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Box>
            <Text fontSize="sm" color="gray.500">Academics / Course Management</Text>
            <Heading size="lg">{course.name}</Heading>
          </Box>
          <HStack>
            <Button variant="outline" as={RouterLink} to="/courses">Back</Button>
            <Button variant="outline" onClick={() => navigate(`/courses/${courseId}/edit`)}>Edit</Button>
            <Button onClick={handleDeleteCourse}>Delete</Button>
          </HStack>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline"><Text fontSize="sm">Category</Text><Text mt={2} fontWeight="700">{course.category?.name || '-'}</Text></Box>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline"><Text fontSize="sm">Duration</Text><Text mt={2} fontWeight="700">{course.duration}</Text></Box>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline"><Text fontSize="sm">Fee</Text><Text mt={2} fontWeight="700">₹{Number(course.fee).toLocaleString()}</Text></Box>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline"><Text fontSize="sm">Status</Text><Badge mt={2} borderRadius="full">{course.status}</Badge></Box>
        </SimpleGrid>

        <Tabs variant="enclosed">
          <TabList>
            <Tab>Batches</Tab>
            <Tab>Overview</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <HStack justify="space-between" mb={4}>
                <Heading size="sm">Linked batches</Heading>
                <Button onClick={() => navigate(`/courses/${courseId}/batches/new`)}>New batch</Button>
              </HStack>
              {batches.length === 0 ? <EmptyState title="No batches yet" description="Create the first batch for this course." /> : <DataTable columns={batchColumns} data={batches} />}
            </TabPanel>
            <TabPanel>
              <VStack align="stretch" spacing={3}>
                <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                  <Heading size="sm" mb={2}>Description</Heading>
                  <Text>{course.description || 'No description added.'}</Text>
                </Box>
                <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                  <Heading size="sm" mb={2}>Created by</Heading>
                  <Text>{course.createdBy?.name || '-'}</Text>
                </Box>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    </PageWrapper>
  );
}
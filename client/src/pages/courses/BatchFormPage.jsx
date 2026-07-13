import { useEffect, useState } from 'react';
import { Box, Button, FormControl, FormLabel, Heading, Input, Select, SimpleGrid, Stack, Text, useToast } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import PageWrapper from '../../components/ui/PageWrapper';
import { createBatch, fetchBatch, fetchCourse, updateBatch } from '../../services/courses';

const statusOptions = ['active', 'inactive', 'completed', 'cancelled'];

export default function BatchFormPage() {
  const { courseId, batchId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(batchId);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    capacity: '',
    schedule: '',
    status: 'active',
    enrollmentCount: 0,
  });

  useEffect(() => {
    fetchCourse(courseId).then((course) => setCourseName(course.name || ''));
    if (!isEdit) return;
    fetchBatch(batchId)
      .then((batch) => {
        setForm({
          name: batch.name || '',
          startDate: batch.startDate ? new Date(batch.startDate).toISOString().slice(0, 10) : '',
          endDate: batch.endDate ? new Date(batch.endDate).toISOString().slice(0, 10) : '',
          capacity: batch.capacity ?? '',
          schedule: batch.schedule || '',
          status: batch.status || 'active',
          enrollmentCount: batch.enrollmentCount ?? 0,
        });
      })
      .finally(() => setLoading(false));
  }, [batchId, courseId, isEdit]);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      course: courseId,
      name: form.name,
      startDate: form.startDate,
      endDate: form.endDate,
      capacity: Number(form.capacity),
      schedule: form.schedule,
      status: form.status,
      enrollmentCount: Number(form.enrollmentCount || 0),
    };

    try {
      if (isEdit) {
        await updateBatch(batchId, payload);
        toast({ title: 'Batch updated', status: 'success' });
      } else {
        await createBatch(payload);
        toast({ title: 'Batch created', status: 'success' });
      }
      navigate(`/courses/${courseId}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageWrapper><Text>Loading batch...</Text></PageWrapper>;
  }

  return (
    <PageWrapper>
      <Stack as="form" spacing={6} onSubmit={handleSubmit}>
        <Box>
          <Text fontSize="sm" color="gray.500">Academics / Course Management</Text>
          <Heading size="lg">{isEdit ? 'Edit batch' : 'Create batch'}</Heading>
          <Text color="gray.600">Course: {courseName || courseId}</Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl><FormLabel>Name</FormLabel><Input value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Morning A" /></FormControl>
          <FormControl><FormLabel>Status</FormLabel><Select value={form.status} onChange={(event) => updateField('status', event.target.value)}>{statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</Select></FormControl>
          <FormControl><FormLabel>Start date</FormLabel><Input type="date" value={form.startDate} onChange={(event) => updateField('startDate', event.target.value)} /></FormControl>
          <FormControl><FormLabel>End date</FormLabel><Input type="date" value={form.endDate} onChange={(event) => updateField('endDate', event.target.value)} /></FormControl>
          <FormControl><FormLabel>Capacity</FormLabel><Input type="number" min={1} value={form.capacity} onChange={(event) => updateField('capacity', event.target.value)} /></FormControl>
          <FormControl><FormLabel>Enrollment count</FormLabel><Input type="number" min={0} value={form.enrollmentCount} onChange={(event) => updateField('enrollmentCount', event.target.value)} /></FormControl>
        </SimpleGrid>

        <FormControl>
          <FormLabel>Schedule</FormLabel>
          <Input value={form.schedule} onChange={(event) => updateField('schedule', event.target.value)} placeholder="Mon/Wed/Fri, 9:00 AM - 11:00 AM" />
        </FormControl>

        <Button type="submit" isLoading={saving}>{isEdit ? 'Save changes' : 'Create batch'}</Button>
      </Stack>
    </PageWrapper>
  );
}
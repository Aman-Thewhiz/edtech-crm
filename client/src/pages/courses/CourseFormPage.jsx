import { useEffect, useState } from 'react';
import { Box, Button, FormControl, FormLabel, Heading, Input, Select, SimpleGrid, Stack, Text, Textarea, useToast } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import PageWrapper from '../../components/ui/PageWrapper';
import { createCourse, fetchCourse, fetchCourseCategories, updateCourse } from '../../services/courses';

const statusOptions = ['active', 'inactive', 'completed', 'cancelled'];

export default function CourseFormPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(courseId);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    duration: '',
    fee: '',
    category: '',
    status: 'active',
  });

  useEffect(() => {
    fetchCourseCategories().then(setCategories);
    if (!isEdit) return;
    fetchCourse(courseId)
      .then((course) => {
        setForm({
          name: course.name || '',
          description: course.description || '',
          duration: course.duration || '',
          fee: course.fee ?? '',
          category: course.category?._id || course.category || '',
          status: course.status || 'active',
        });
      })
      .finally(() => setLoading(false));
  }, [courseId, isEdit]);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      duration: form.duration,
      fee: Number(form.fee),
      category: form.category,
      status: form.status,
    };

    try {
      if (isEdit) {
        await updateCourse(courseId, payload);
        toast({ title: 'Course updated', status: 'success' });
      } else {
        await createCourse(payload);
        toast({ title: 'Course created', status: 'success' });
      }
      navigate('/courses');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageWrapper><Text>Loading course...</Text></PageWrapper>;
  }

  return (
    <PageWrapper>
      <Stack as="form" spacing={6} onSubmit={handleSubmit}>
        <Box>
          <Text fontSize="sm" color="gray.500">Academics / Course Management</Text>
          <Heading size="lg">{isEdit ? 'Edit course' : 'Create course'}</Heading>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl><FormLabel>Name</FormLabel><Input value={form.name} onChange={(event) => updateField('name', event.target.value)} /></FormControl>
          <FormControl><FormLabel>Category</FormLabel><Select value={form.category} onChange={(event) => updateField('category', event.target.value)} placeholder="Select category">{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select></FormControl>
          <FormControl><FormLabel>Duration</FormLabel><Input value={form.duration} onChange={(event) => updateField('duration', event.target.value)} placeholder="e.g. 6 months" /></FormControl>
          <FormControl><FormLabel>Fee</FormLabel><Input type="number" min={0} value={form.fee} onChange={(event) => updateField('fee', event.target.value)} /></FormControl>
          <FormControl><FormLabel>Status</FormLabel><Select value={form.status} onChange={(event) => updateField('status', event.target.value)}>{statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</Select></FormControl>
        </SimpleGrid>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} />
        </FormControl>

        <Button type="submit" isLoading={saving}>{isEdit ? 'Save changes' : 'Create course'}</Button>
      </Stack>
    </PageWrapper>
  );
}
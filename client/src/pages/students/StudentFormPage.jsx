import { useEffect, useMemo, useState } from 'react';
import { Box, Button, FormControl, FormLabel, Heading, Input, Select, SimpleGrid, Stack, Text, Textarea, useToast } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import PageWrapper from '../../components/ui/PageWrapper';
import { fetchBatches, fetchCourses } from '../../services/courses';
import { createStudent, fetchStudent, updateStudent } from '../../services/students';

const statusOptions = ['active', 'inactive', 'graduated', 'dropped'];
const genderOptions = ['female', 'male', 'other', 'prefer-not-to-say'];

export default function StudentFormPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(studentId);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'prefer-not-to-say',
    address: '',
    guardianName: '',
    guardianPhone: '',
    course: '',
    batch: '',
    status: 'active',
    enrollmentDate: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    fetchCourses({ limit: 100 }).then((response) => setCourses(response.data || []));
    fetchBatches({ limit: 100 }).then((response) => setBatches(response.data || []));
    if (!isEdit) return;
    fetchStudent(studentId)
      .then((student) => {
        setForm({
          firstName: student.firstName || '',
          lastName: student.lastName || '',
          email: student.email || '',
          phone: student.phone || '',
          dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().slice(0, 10) : '',
          gender: student.gender || 'prefer-not-to-say',
          address: student.address || '',
          guardianName: student.guardianName || '',
          guardianPhone: student.guardianPhone || '',
          course: student.course?._id || student.course?.id || student.course || '',
          batch: student.batch?._id || student.batch?.id || student.batch || '',
          status: student.status || 'active',
          enrollmentDate: student.enrollmentDate ? new Date(student.enrollmentDate).toISOString().slice(0, 10) : '',
        });
      })
      .finally(() => setLoading(false));
  }, [isEdit, studentId]);

  const visibleBatches = useMemo(() => batches.filter((batch) => !form.course || (batch.course?._id || batch.course?.id || batch.course) === form.course), [batches, form.course]);
  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      dateOfBirth: form.dateOfBirth || null,
      gender: form.gender,
      address: form.address,
      guardianName: form.guardianName,
      guardianPhone: form.guardianPhone,
      course: form.course,
      batch: form.batch,
      status: form.status,
      enrollmentDate: form.enrollmentDate,
    };
    try {
      if (isEdit) {
        await updateStudent(studentId, payload);
        toast({ title: 'Student updated', status: 'success' });
      } else {
        await createStudent(payload);
        toast({ title: 'Student created', status: 'success' });
      }
      navigate('/students');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageWrapper><Text>Loading student...</Text></PageWrapper>;
  }

  return (
    <PageWrapper>
      <Stack as="form" spacing={6} onSubmit={handleSubmit}>
        <Box>
          <Text fontSize="sm" color="gray.500">Academics / Student Management</Text>
          <Heading size="lg">{isEdit ? 'Edit student' : 'Create student'}</Heading>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl><FormLabel>First name</FormLabel><Input value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} /></FormControl>
          <FormControl><FormLabel>Last name</FormLabel><Input value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} /></FormControl>
          <FormControl><FormLabel>Email</FormLabel><Input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} /></FormControl>
          <FormControl><FormLabel>Phone</FormLabel><Input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} /></FormControl>
          <FormControl><FormLabel>Date of birth</FormLabel><Input type="date" value={form.dateOfBirth} onChange={(event) => updateField('dateOfBirth', event.target.value)} /></FormControl>
          <FormControl><FormLabel>Gender</FormLabel><Select value={form.gender} onChange={(event) => updateField('gender', event.target.value)}>{genderOptions.map((gender) => <option key={gender} value={gender}>{gender}</option>)}</Select></FormControl>
          <FormControl><FormLabel>Course</FormLabel><Select value={form.course} onChange={(event) => updateField('course', event.target.value)} placeholder="Select course">{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</Select></FormControl>
          <FormControl><FormLabel>Batch</FormLabel><Select value={form.batch} onChange={(event) => updateField('batch', event.target.value)} placeholder="Select batch">{visibleBatches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}</Select></FormControl>
          <FormControl><FormLabel>Status</FormLabel><Select value={form.status} onChange={(event) => updateField('status', event.target.value)}>{statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</Select></FormControl>
          <FormControl><FormLabel>Enrollment date</FormLabel><Input type="date" value={form.enrollmentDate} onChange={(event) => updateField('enrollmentDate', event.target.value)} /></FormControl>
          <FormControl><FormLabel>Guardian name</FormLabel><Input value={form.guardianName} onChange={(event) => updateField('guardianName', event.target.value)} /></FormControl>
          <FormControl><FormLabel>Guardian phone</FormLabel><Input value={form.guardianPhone} onChange={(event) => updateField('guardianPhone', event.target.value)} /></FormControl>
        </SimpleGrid>

        <FormControl>
          <FormLabel>Address</FormLabel>
          <Textarea value={form.address} onChange={(event) => updateField('address', event.target.value)} />
        </FormControl>

        <Button type="submit" isLoading={saving}>{isEdit ? 'Save changes' : 'Create student'}</Button>
      </Stack>
    </PageWrapper>
  );
}

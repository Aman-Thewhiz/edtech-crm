import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Checkbox, FormControl, FormLabel, Heading, Input, Select, SimpleGrid, Stack, Text, Textarea, useToast } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import PageWrapper from '../../components/ui/PageWrapper';
import { createAdmission, fetchAdmission, updateAdmission } from '../../services/admissions';
import { fetchBatches, fetchCourses } from '../../services/courses';
import { fetchLeads } from '../../services/leads';

const genderOptions = ['female', 'male', 'other', 'prefer-not-to-say'];
const defaultChecklist = ['Application form', 'ID proof', 'Photo', 'Previous certificates', 'Fee confirmation'];

export default function AdmissionFormPage() {
  const { admissionId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(admissionId);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [leads, setLeads] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState({
    lead: '',
    course: '',
    batch: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'prefer-not-to-say',
    address: '',
    guardianName: '',
    guardianPhone: '',
    documentChecklist: defaultChecklist.map((name) => ({ name, required: true, received: false, verified: false, notes: '' })),
  });

  useEffect(() => {
    fetchLeads({ limit: 100 }).then((response) => setLeads((response.data || []).filter((lead) => !lead.convertedToAdmission || lead.id === form.lead)));
    fetchCourses({ limit: 100 }).then((response) => setCourses(response.data || []));
    fetchBatches({ limit: 100 }).then((response) => setBatches(response.data || []));
    if (!isEdit) return;
    fetchAdmission(admissionId)
      .then((admission) => {
        setForm({
          lead: admission.lead?._id || admission.lead?.id || admission.lead || '',
          course: admission.course?._id || admission.course?.id || admission.course || '',
          batch: admission.batch?._id || admission.batch?.id || admission.batch || '',
          firstName: admission.firstName || '',
          lastName: admission.lastName || '',
          email: admission.email || '',
          phone: admission.phone || '',
          dateOfBirth: admission.dateOfBirth ? new Date(admission.dateOfBirth).toISOString().slice(0, 10) : '',
          gender: admission.gender || 'prefer-not-to-say',
          address: admission.address || '',
          guardianName: admission.guardianName || '',
          guardianPhone: admission.guardianPhone || '',
          documentChecklist: admission.documentChecklist?.length ? admission.documentChecklist : defaultChecklist.map((name) => ({ name, required: true, received: false, verified: false, notes: '' })),
        });
      })
      .finally(() => setLoading(false));
  }, [admissionId, isEdit]);

  const visibleBatches = useMemo(() => batches.filter((batch) => !form.course || (batch.course?._id || batch.course?.id || batch.course) === form.course), [batches, form.course]);
  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const applyLead = (leadId) => {
    const lead = leads.find((item) => item.id === leadId);
    const [firstName, ...lastParts] = (lead?.name || '').split(' ');
    setForm((current) => ({
      ...current,
      lead: leadId,
      firstName: lead ? firstName || '' : current.firstName,
      lastName: lead ? lastParts.join(' ') || '-' : current.lastName,
      email: lead?.email || current.email,
      phone: lead?.phone || current.phone,
    }));
  };

  const updateChecklistItem = (index, field, value) => {
    setForm((current) => ({
      ...current,
      documentChecklist: current.documentChecklist.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      lead: form.lead,
      course: form.course,
      batch: form.batch,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      dateOfBirth: form.dateOfBirth || null,
      gender: form.gender,
      address: form.address,
      guardianName: form.guardianName,
      guardianPhone: form.guardianPhone,
      documentChecklist: form.documentChecklist,
    };
    try {
      const admission = isEdit ? await updateAdmission(admissionId, payload) : await createAdmission(payload);
      toast({ title: isEdit ? 'Admission updated' : 'Admission created', status: 'success' });
      navigate(`/admissions/${admission.id}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageWrapper><Text>Loading admission...</Text></PageWrapper>;

  return (
    <PageWrapper>
      <Stack as="form" spacing={6} onSubmit={handleSubmit}>
        <Box>
          <Text fontSize="sm" color="gray.500">Admissions / Workflow</Text>
          <Heading size="lg">{isEdit ? 'Edit admission' : 'Create admission'}</Heading>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl>
            <FormLabel>Lead</FormLabel>
            <Select value={form.lead} onChange={(event) => applyLead(event.target.value)} placeholder="Select converted lead source" isDisabled={isEdit}>
              {leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.name} - {lead.phone}</option>)}
            </Select>
          </FormControl>
          <FormControl><FormLabel>Course</FormLabel><Select value={form.course} onChange={(event) => updateField('course', event.target.value)} placeholder="Select course">{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</Select></FormControl>
          <FormControl><FormLabel>Batch</FormLabel><Select value={form.batch} onChange={(event) => updateField('batch', event.target.value)} placeholder="Select batch">{visibleBatches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name}</option>)}</Select></FormControl>
          <FormControl><FormLabel>Gender</FormLabel><Select value={form.gender} onChange={(event) => updateField('gender', event.target.value)}>{genderOptions.map((gender) => <option key={gender} value={gender}>{gender}</option>)}</Select></FormControl>
          <FormControl><FormLabel>First name</FormLabel><Input value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} /></FormControl>
          <FormControl><FormLabel>Last name</FormLabel><Input value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} /></FormControl>
          <FormControl><FormLabel>Email</FormLabel><Input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} /></FormControl>
          <FormControl><FormLabel>Phone</FormLabel><Input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} /></FormControl>
          <FormControl><FormLabel>Date of birth</FormLabel><Input type="date" value={form.dateOfBirth} onChange={(event) => updateField('dateOfBirth', event.target.value)} /></FormControl>
          <FormControl><FormLabel>Guardian name</FormLabel><Input value={form.guardianName} onChange={(event) => updateField('guardianName', event.target.value)} /></FormControl>
          <FormControl><FormLabel>Guardian phone</FormLabel><Input value={form.guardianPhone} onChange={(event) => updateField('guardianPhone', event.target.value)} /></FormControl>
        </SimpleGrid>

        <FormControl>
          <FormLabel>Address</FormLabel>
          <Textarea value={form.address} onChange={(event) => updateField('address', event.target.value)} />
        </FormControl>

        <Stack spacing={3}>
          <Heading size="sm">Document checklist</Heading>
          {form.documentChecklist.map((item, index) => (
            <SimpleGrid key={item.name} columns={{ base: 1, md: 4 }} spacing={3} alignItems="center">
              <Input value={item.name} onChange={(event) => updateChecklistItem(index, 'name', event.target.value)} />
              <Checkbox isChecked={item.required} onChange={(event) => updateChecklistItem(index, 'required', event.target.checked)}>Required</Checkbox>
              <Checkbox isChecked={item.received} onChange={(event) => updateChecklistItem(index, 'received', event.target.checked)}>Received</Checkbox>
              <Checkbox isChecked={item.verified} onChange={(event) => updateChecklistItem(index, 'verified', event.target.checked)}>Verified</Checkbox>
            </SimpleGrid>
          ))}
        </Stack>

        <Button type="submit" isLoading={saving}>{isEdit ? 'Save changes' : 'Create admission'}</Button>
      </Stack>
    </PageWrapper>
  );
}

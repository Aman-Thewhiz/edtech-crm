import { useEffect, useState } from 'react';
import { Badge, Box, Button, Checkbox, Heading, HStack, Link, SimpleGrid, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, Text, Textarea, useToast, VStack } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../../components/ui/EmptyState';
import PageWrapper from '../../components/ui/PageWrapper';
import { fetchAdmission, updateAdmissionChecklist, updateAdmissionStatus } from '../../services/admissions';

const statusFlow = ['initiated', 'documents-pending', 'documents-verified', 'fee-pending', 'enrolled'];

function nextStatus(status) {
  const index = statusFlow.indexOf(status);
  return index >= 0 ? statusFlow[index + 1] : null;
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

export default function AdmissionDetailPage() {
  const { admissionId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [admission, setAdmission] = useState(null);
  const [note, setNote] = useState('');

  const loadAdmission = async () => {
    setLoading(true);
    try {
      setAdmission(await fetchAdmission(admissionId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmission();
  }, [admissionId]);

  const updateChecklistItem = (index, field, value) => {
    setAdmission((current) => ({
      ...current,
      documentChecklist: current.documentChecklist.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    }));
  };

  const saveChecklist = async () => {
    setSaving(true);
    try {
      const updated = await updateAdmissionChecklist(admissionId, admission.documentChecklist);
      setAdmission(updated);
      toast({ title: 'Checklist saved', status: 'success' });
    } finally {
      setSaving(false);
    }
  };

  const advanceStatus = async () => {
    const target = nextStatus(admission.status);
    if (!target) return;
    setSaving(true);
    try {
      const updated = await updateAdmissionStatus(admissionId, target, note);
      setAdmission(updated);
      setNote('');
      toast({ title: 'Admission status updated', status: 'success' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageWrapper><Text>Loading admission...</Text></PageWrapper>;
  if (!admission) return <PageWrapper><EmptyState title="Admission not found" description="The admission may have been deleted or you may not have access." /></PageWrapper>;

  const targetStatus = nextStatus(admission.status);

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Box>
            <Text fontSize="sm" color="gray.500">Admission detail</Text>
            <Heading size="lg">{admission.name}</Heading>
            <Text color="gray.600">{admission.email} / {admission.phone}</Text>
          </Box>
          <HStack>
            <Button variant="outline" as={RouterLink} to="/admissions">Back</Button>
            <Button onClick={() => navigate(`/admissions/${admission.id}/edit`)} isDisabled={admission.status === 'enrolled'}>Edit</Button>
          </HStack>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline"><Text fontSize="sm">Status</Text><Badge mt={2} borderRadius="full">{admission.status}</Badge></Box>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline"><Text fontSize="sm">Course</Text><Text mt={2} fontWeight="700">{admission.course?.name || '-'}</Text></Box>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline"><Text fontSize="sm">Batch</Text><Text mt={2} fontWeight="700">{admission.batch?.name || '-'}</Text></Box>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline"><Text fontSize="sm">Student</Text><Text mt={2} fontWeight="700">{admission.student?.enrollmentNumber || '-'}</Text></Box>
        </SimpleGrid>

        <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
          <HStack justify="space-between" flexWrap="wrap" gap={3}>
            <Box>
              <Heading size="sm">Workflow</Heading>
              <Text color="gray.600">Next step: {targetStatus || 'Completed'}</Text>
            </Box>
            <Button onClick={advanceStatus} isLoading={saving} isDisabled={!targetStatus}>
              {targetStatus ? `Move to ${targetStatus}` : 'Enrolled'}
            </Button>
          </HStack>
          <Textarea mt={3} placeholder="Status note" value={note} onChange={(event) => setNote(event.target.value)} />
        </Box>

        <Tabs variant="enclosed">
          <TabList>
            <Tab>Overview</Tab>
            <Tab>Checklist</Tab>
            <Tab>Invoice Stub</Tab>
            <Tab>History</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                  <Heading size="sm" mb={3}>Personal details</Heading>
                  <Text>Date of birth: {formatDate(admission.dateOfBirth)}</Text>
                  <Text>Gender: {admission.gender}</Text>
                  <Text>Guardian: {admission.guardianName || '-'}</Text>
                  <Text>Guardian phone: {admission.guardianPhone || '-'}</Text>
                  <Text>Address: {admission.address || '-'}</Text>
                </Box>
                <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                  <Heading size="sm" mb={3}>Source lead</Heading>
                  <Text>{admission.lead?.name || '-'}</Text>
                  <Text>{admission.lead?.source || '-'}</Text>
                  {admission.student ? <Link as={RouterLink} to={`/students/${admission.student._id || admission.student.id}`}>Open student profile</Link> : null}
                </Box>
              </SimpleGrid>
            </TabPanel>
            <TabPanel>
              <Stack spacing={3}>
                {(admission.documentChecklist || []).map((item, index) => (
                  <SimpleGrid key={item._id || item.name} columns={{ base: 1, md: 4 }} spacing={3} alignItems="center">
                    <Text fontWeight="700">{item.name}</Text>
                    <Checkbox isChecked={item.required} onChange={(event) => updateChecklistItem(index, 'required', event.target.checked)}>Required</Checkbox>
                    <Checkbox isChecked={item.received} onChange={(event) => updateChecklistItem(index, 'received', event.target.checked)}>Received</Checkbox>
                    <Checkbox isChecked={item.verified} onChange={(event) => updateChecklistItem(index, 'verified', event.target.checked)}>Verified</Checkbox>
                  </SimpleGrid>
                ))}
                <Button onClick={saveChecklist} isLoading={saving}>Save checklist</Button>
              </Stack>
            </TabPanel>
            <TabPanel>
              <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                <Text>Invoice number: {admission.invoiceStub?.invoiceNumber || '-'}</Text>
                <Text>Status: {admission.invoiceStub?.status || '-'}</Text>
                <Text>Amount: INR {Number(admission.invoiceStub?.amount || 0).toLocaleString()}</Text>
                <Text>Generated: {formatDate(admission.invoiceStub?.generatedAt)}</Text>
                <Text color="gray.600">{admission.invoiceStub?.note || 'Invoice generation is stubbed until Phase 7.'}</Text>
              </Box>
            </TabPanel>
            <TabPanel>
              <VStack align="stretch" spacing={3}>
                {(admission.statusHistory || []).map((item) => (
                  <Box key={item._id || item.createdAt} p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                    <Text fontWeight="700">{item.status}</Text>
                    <Text color="gray.600">{item.note || '-'}</Text>
                    <Text fontSize="sm" color="gray.500">{formatDate(item.createdAt)} by {item.changedBy?.name || '-'}</Text>
                  </Box>
                ))}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    </PageWrapper>
  );
}

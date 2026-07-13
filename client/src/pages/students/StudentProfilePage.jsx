import { useEffect, useState } from 'react';
import { Badge, Box, Button, FormControl, FormLabel, Heading, HStack, Input, Link, Select, SimpleGrid, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useToast, VStack } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../../components/ui/EmptyState';
import PageWrapper from '../../components/ui/PageWrapper';
import { downloadStudentIdCard, fetchStudent, uploadStudentDocument } from '../../services/students';

const documentTypes = ['id-proof', 'photo', 'certificate', 'other'];

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function StudentProfilePage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [documentForm, setDocumentForm] = useState({ type: 'id-proof', name: '', file: null });

  const loadStudent = async () => {
    setLoading(true);
    try {
      setStudent(await fetchStudent(studentId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudent();
  }, [studentId]);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!documentForm.file || !documentForm.name) return;
    setUploading(true);
    try {
      const contentBase64 = await readFileAsBase64(documentForm.file);
      const updated = await uploadStudentDocument(studentId, {
        type: documentForm.type,
        name: documentForm.name,
        fileName: documentForm.file.name,
        mimeType: documentForm.file.type,
        contentBase64,
      });
      setStudent(updated);
      setDocumentForm({ type: 'id-proof', name: '', file: null });
      toast({ title: 'Document uploaded', status: 'success' });
    } finally {
      setUploading(false);
    }
  };

  const handleIdCardDownload = async () => {
    const blob = await downloadStudentIdCard(studentId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${student.enrollmentNumber}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <PageWrapper><Text>Loading student...</Text></PageWrapper>;
  }

  if (!student) {
    return <PageWrapper><EmptyState title="Student not found" description="The student may have been deleted or you may not have access." /></PageWrapper>;
  }

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Box>
            <Text fontSize="sm" color="gray.500">Student profile</Text>
            <Heading size="lg">{student.name}</Heading>
            <Text color="gray.600">{student.enrollmentNumber}</Text>
          </Box>
          <HStack>
            <Button variant="outline" as={RouterLink} to="/students">Back</Button>
            <Button variant="outline" onClick={handleIdCardDownload}>Download ID PDF</Button>
            <Button onClick={() => navigate(`/students/${student.id}/edit`)}>Edit</Button>
          </HStack>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline"><Text fontSize="sm">Status</Text><Badge mt={2} borderRadius="full">{student.status}</Badge></Box>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline"><Text fontSize="sm">Course</Text><Text mt={2} fontWeight="700">{student.course?.name || '-'}</Text></Box>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline"><Text fontSize="sm">Batch</Text><Text mt={2} fontWeight="700">{student.batch?.name || '-'}</Text></Box>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline"><Text fontSize="sm">Enrolled</Text><Text mt={2} fontWeight="700">{formatDate(student.enrollmentDate)}</Text></Box>
        </SimpleGrid>

        <Tabs variant="enclosed">
          <TabList>
            <Tab>Personal</Tab>
            <Tab>Course</Tab>
            <Tab>ID Card</Tab>
            <Tab>Documents</Tab>
            <Tab>Invoices</Tab>
            <Tab>Attendance</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                  <Heading size="sm" mb={3}>Contact</Heading>
                  <VStack align="stretch" spacing={2}>
                    <Text>Email: {student.email}</Text>
                    <Text>Phone: {student.phone}</Text>
                    <Text>Date of birth: {formatDate(student.dateOfBirth)}</Text>
                    <Text>Gender: {student.gender}</Text>
                  </VStack>
                </Box>
                <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                  <Heading size="sm" mb={3}>Guardian</Heading>
                  <VStack align="stretch" spacing={2}>
                    <Text>Name: {student.guardianName || '-'}</Text>
                    <Text>Phone: {student.guardianPhone || '-'}</Text>
                    <Text>Address: {student.address || '-'}</Text>
                  </VStack>
                </Box>
              </SimpleGrid>
            </TabPanel>
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                  <Heading size="sm" mb={3}>Course details</Heading>
                  <Text>Course: {student.course?.name || '-'}</Text>
                  <Text>Duration: {student.course?.duration || '-'}</Text>
                  <Text>Fee: INR {Number(student.course?.fee || 0).toLocaleString()}</Text>
                </Box>
                <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                  <Heading size="sm" mb={3}>Batch details</Heading>
                  <Text>Batch: {student.batch?.name || '-'}</Text>
                  <Text>Schedule: {student.batch?.schedule || '-'}</Text>
                  <Text>Capacity: {student.batch?.enrollmentCount || 0}/{student.batch?.capacity || 0}</Text>
                </Box>
              </SimpleGrid>
            </TabPanel>
            <TabPanel>
              <Box maxW="420px" p={6} borderRadius="xl" border="1px solid" borderColor="brand.hairline" bg="brand.canvasLavender">
                <Text fontSize="sm" color="gray.600">EduFlow CRM</Text>
                <Heading size="md" mt={2}>{student.name}</Heading>
                <Text mt={3}>Enrollment: {student.enrollmentNumber}</Text>
                <Text>Course: {student.course?.name || '-'}</Text>
                <Text>Batch: {student.batch?.name || '-'}</Text>
                <Text>Phone: {student.phone}</Text>
                <Badge mt={4} borderRadius="full">{student.status}</Badge>
              </Box>
            </TabPanel>
            <TabPanel>
              <Stack as="form" spacing={4} onSubmit={handleUpload} mb={6}>
                <Heading size="sm">Upload document</Heading>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                  <Select value={documentForm.type} onChange={(event) => setDocumentForm((current) => ({ ...current, type: event.target.value }))}>
                    {documentTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                  </Select>
                  <Input placeholder="Display name" value={documentForm.name} onChange={(event) => setDocumentForm((current) => ({ ...current, name: event.target.value }))} />
                  <FormControl>
                    <FormLabel srOnly>Document file</FormLabel>
                    <Input type="file" onChange={(event) => setDocumentForm((current) => ({ ...current, file: event.target.files?.[0] || null }))} />
                  </FormControl>
                </SimpleGrid>
                <Button type="submit" isLoading={uploading}>Upload document</Button>
              </Stack>
              <VStack align="stretch" spacing={3}>
                {(student.documents || []).map((item) => (
                  <Box key={item._id || item.url} p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                    <Text fontWeight="700">{item.name}</Text>
                    <Text color="gray.600">{item.type}</Text>
                    <Link href={`http://localhost:4011${item.url}`} isExternal>{item.fileName}</Link>
                  </Box>
                ))}
              </VStack>
            </TabPanel>
            <TabPanel><EmptyState title="No invoices yet" description="Invoice records will appear after the billing phase." /></TabPanel>
            <TabPanel><EmptyState title="No attendance yet" description="Attendance records will appear after the attendance phase." /></TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    </PageWrapper>
  );
}

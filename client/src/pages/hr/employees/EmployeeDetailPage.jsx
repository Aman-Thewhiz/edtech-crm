import { useState, useEffect } from 'react';
import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../../../components/ui/EmptyState';
import PageWrapper from '../../../components/ui/PageWrapper';
import { fetchEmployee, deleteEmployee, updateEmployeeStatus } from '../../../services/employees';

const statusColors = {
  active: 'green',
  'on-leave': 'yellow',
  resigned: 'orange',
  terminated: 'red',
};

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

export default function EmployeeDetailPage() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employee, setEmployee] = useState(null);

  const loadEmployee = async () => {
    setLoading(true);
    try {
      const data = await fetchEmployee(employeeId);
      setEmployee(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployee();
  }, [employeeId]);

  const handleStatusChange = async (newStatus) => {
    setSaving(true);
    try {
      const updated = await updateEmployeeStatus(employeeId, newStatus);
      setEmployee(updated);
      toast({ title: 'Employee status updated', status: 'success' });
    } catch (error) {
      toast({ title: 'Error updating status', description: error.message, status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this employee?')) return;
    setSaving(true);
    try {
      await deleteEmployee(employeeId);
      toast({ title: 'Employee deleted', status: 'success' });
      navigate('/hr/employees');
    } catch (error) {
      toast({ title: 'Error deleting employee', description: error.message, status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <Text>Loading employee...</Text>
      </PageWrapper>
    );
  }

  if (!employee) {
    return (
      <PageWrapper>
        <EmptyState
          title="Employee not found"
          description="The employee may have been deleted or you may not have access."
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Box>
            <Text fontSize="sm" color="gray.500">HR / Employees</Text>
            <Heading size="lg">{employee.name}</Heading>
            <Text color="gray.600">{employee.employeeId}</Text>
          </Box>
          <HStack>
            <Button variant="outline" as={RouterLink} to={`/hr/employees/${employeeId}/edit`}>
              Edit
            </Button>
            <Button
              onClick={handleDelete}
              isLoading={saving}
            >
              Delete
            </Button>
          </HStack>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
            <Text fontSize="sm">Status</Text>
            <Badge mt={2} borderRadius="full" colorScheme={statusColors[employee.status]}>
              {employee.status}
            </Badge>
          </Box>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
            <Text fontSize="sm">Department</Text>
            <Text mt={2} fontWeight="700">
              {employee.department?.name || '-'}
            </Text>
          </Box>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
            <Text fontSize="sm">Designation</Text>
            <Text mt={2} fontWeight="700">
              {employee.designation?.name || '-'}
            </Text>
          </Box>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
            <Text fontSize="sm">Joining Date</Text>
            <Text mt={2} fontWeight="700">
              {formatDate(employee.joiningDate)}
            </Text>
          </Box>
        </SimpleGrid>

        <Tabs variant="enclosed">
          <TabList>
            <Tab>Personal</Tab>
            <Tab>Job</Tab>
            <Tab>Bank</Tab>
            <Tab>Documents</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                    <Text fontSize="sm">Email</Text>
                    <Text mt={2} fontWeight="700">{employee.email}</Text>
                  </Box>
                  <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                    <Text fontSize="sm">Phone</Text>
                    <Text mt={2} fontWeight="700">{employee.phone}</Text>
                  </Box>
                  <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                    <Text fontSize="sm">Date of Birth</Text>
                    <Text mt={2} fontWeight="700">{formatDate(employee.dateOfBirth)}</Text>
                  </Box>
                  <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                    <Text fontSize="sm">Gender</Text>
                    <Text mt={2} fontWeight="700">{employee.gender || '-'}</Text>
                  </Box>
                </SimpleGrid>
                {employee.address && (
                  <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                    <Text fontSize="sm">Address</Text>
                    <Text mt={2}>{employee.address}</Text>
                  </Box>
                )}
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                    <Text fontSize="sm">Employment Type</Text>
                    <Text mt={2} fontWeight="700">{employee.employmentType}</Text>
                  </Box>
                  <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                    <Text fontSize="sm">Joining Date</Text>
                    <Text mt={2} fontWeight="700">{formatDate(employee.joiningDate)}</Text>
                  </Box>
                </SimpleGrid>
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack align="stretch" spacing={4}>
                {employee.bankAccountNumber ? (
                  <>
                    <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                      <Text fontSize="sm">Account Number</Text>
                      <Text mt={2} fontWeight="700">{employee.bankAccountNumber}</Text>
                    </Box>
                    <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                      <Text fontSize="sm">IFSC Code</Text>
                      <Text mt={2} fontWeight="700">{employee.bankIFSC}</Text>
                    </Box>
                    <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                      <Text fontSize="sm">Account Holder Name</Text>
                      <Text mt={2} fontWeight="700">{employee.bankAccountHolderName}</Text>
                    </Box>
                  </>
                ) : (
                  <EmptyState title="No bank details" description="Bank details not added yet." />
                )}
              </VStack>
            </TabPanel>

            <TabPanel>
              {employee.documents && employee.documents.length > 0 ? (
                <VStack align="stretch" spacing={3}>
                  {employee.documents.map((doc, index) => (
                    <Box key={index} p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="700">{doc.name}</Text>
                          <Text fontSize="sm" color="gray.500">{doc.type}</Text>
                          <Text fontSize="xs" color="gray.400">{formatDate(doc.uploadedAt)}</Text>
                        </VStack>
                        <Badge borderRadius="full">{doc.mimeType}</Badge>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              ) : (
                <EmptyState title="No documents" description="No documents uploaded yet." />
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    </PageWrapper>
  );
}

import { useState, useEffect } from 'react';
import {
  Badge,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/ui/PageWrapper';
import { bulkMarkAttendance } from '../../services/attendance';
import { fetchStudents } from '../../services/students';
import { fetchEmployees } from '../../services/employees';
import { fetchBatches } from '../../services/courses';
import { fetchDepartments } from '../../services/departments';

const statusOptions = ['present', 'absent', 'half-day', 'on-leave', 'holiday'];

const statusColors = {
  present: 'green',
  absent: 'red',
  'half-day': 'yellow',
  'on-leave': 'blue',
  holiday: 'purple',
};

export default function AttendanceMarkingPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [entityType, setEntityType] = useState('student');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [batchOrDept, setBatchOrDept] = useState('');
  const [entities, setEntities] = useState([]);
  const [batches, setBatches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    Promise.all([
      fetchBatches({ limit: 100 }).then((res) => setBatches(res.data || [])),
      fetchDepartments({ limit: 100 }).then((res) => setDepartments(res.data || [])),
    ]);
  }, []);

  const loadEntities = async () => {
    setLoading(true);
    try {
      if (entityType === 'student' && batchOrDept) {
        const response = await fetchStudents({ batch: batchOrDept, limit: 100 });
        setEntities(response.data || []);
      } else if (entityType === 'employee' && batchOrDept) {
        const response = await fetchEmployees({ department: batchOrDept, limit: 100 });
        setEntities(response.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (entityId, status) => {
    setAttendance((current) => ({
      ...current,
      [entityId]: status,
    }));
  };

  const handleMarkAll = (status) => {
    const newAttendance = {};
    entities.forEach((entity) => {
      newAttendance[entity._id] = status;
    });
    setAttendance(newAttendance);
  };

  const handleSubmit = async () => {
    if (!date || !entityType || !batchOrDept || Object.keys(attendance).length === 0) {
      toast({ title: 'Please fill all required fields', status: 'error' });
      return;
    }

    setSaving(true);
    try {
      const attendanceData = Object.entries(attendance).map(([entityId, status]) => ({
        entityId,
        status,
      }));

      const payload = {
        date: new Date(date),
        entityType,
        batchOrDepartment: batchOrDept,
        attendanceData,
      };

      const result = await bulkMarkAttendance(payload);
      toast({
        title: `Attendance marked: ${result.successful} successful, ${result.failed} failed`,
        status: result.failed === 0 ? 'success' : 'warning',
      });
      setAttendance({});
    } catch (error) {
      toast({ title: 'Error marking attendance', description: error.message, status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <Box>
          <Text fontSize="sm" color="gray.500">Attendance</Text>
          <Text fontSize="2xl" fontWeight="700">Mark Attendance</Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={3}>
          <FormControl isRequired>
            <FormLabel>Entity Type</FormLabel>
            <Select
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value);
                setEntities([]);
                setAttendance({});
              }}
            >
              <option value="student">Student</option>
              <option value="employee">Employee</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Date</FormLabel>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>{entityType === 'student' ? 'Batch' : 'Department'}</FormLabel>
            <Select
              value={batchOrDept}
              onChange={(e) => {
                setBatchOrDept(e.target.value);
                setEntities([]);
                setAttendance({});
              }}
            >
              <option value="">Select {entityType === 'student' ? 'batch' : 'department'}</option>
              {(entityType === 'student' ? batches : departments).map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <Button onClick={loadEntities} isLoading={loading}>
            Load {entityType === 'student' ? 'Students' : 'Employees'}
          </Button>
        </SimpleGrid>

        {entities.length > 0 && (
          <>
            <HStack spacing={2}>
              <Text fontWeight="700">Mark All As:</Text>
              {statusOptions.map((status) => (
                <Button
                  key={status}
                  size="sm"
                  onClick={() => handleMarkAll(status)}
                  colorScheme={statusColors[status]}
                  variant="outline"
                >
                  {status}
                </Button>
              ))}
            </HStack>

            <Box overflowX="auto" borderRadius="xl" border="1px solid" borderColor="brand.hairline">
              <Table variant="simple">
                <Thead bg="brand.canvasLavender">
                  <Tr>
                    <Th>Name</Th>
                    <Th>ID</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {entities.map((entity) => (
                    <Tr key={entity._id}>
                      <Td>{entity.name || entity.firstName}</Td>
                      <Td>{entity.enrollmentNumber || entity.employeeId}</Td>
                      <Td>
                        <Select
                          size="sm"
                          value={attendance[entity._id] || ''}
                          onChange={(e) => handleAttendanceChange(entity._id, e.target.value)}
                        >
                          <option value="">Select status</option>
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </Select>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            <HStack justify="flex-end">
              <Button variant="outline" onClick={() => navigate('/attendance')}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} isLoading={saving}>
                Mark Attendance
              </Button>
            </HStack>
          </>
        )}
      </Stack>
    </PageWrapper>
  );
}

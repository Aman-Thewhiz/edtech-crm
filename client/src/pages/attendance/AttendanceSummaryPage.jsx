import { useState, useEffect } from 'react';
import {
  Badge,
  Box,
  FormControl,
  FormLabel,
  HStack,
  Progress,
  Select,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import PageWrapper from '../../components/ui/PageWrapper';
import { fetchAttendanceSummary } from '../../services/attendance';
import { fetchStudents } from '../../services/students';
import { fetchEmployees } from '../../services/employees';

export default function AttendanceSummaryPage() {
  const [entityType, setEntityType] = useState('student');
  const [entityId, setEntityId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [entities, setEntities] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadEntities = async () => {
      try {
        if (entityType === 'student') {
          const response = await fetchStudents({ limit: 100 });
          setEntities(response.data || []);
        } else {
          const response = await fetchEmployees({ limit: 100 });
          setEntities(response.data || []);
        }
      } catch (error) {
        console.error('Error loading entities:', error);
      }
    };

    loadEntities();
  }, [entityType]);

  useEffect(() => {
    if (entityId) {
      loadSummary();
    }
  }, [entityId, month, year]);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const data = await fetchAttendanceSummary(entityType, entityId, month, year);
      setSummary(data);
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <Box>
          <Text fontSize="sm" color="gray.500">Attendance</Text>
          <Text fontSize="2xl" fontWeight="700">Attendance Summary</Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={3}>
          <FormControl>
            <FormLabel>Entity Type</FormLabel>
            <Select
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value);
                setEntityId('');
                setSummary(null);
              }}
            >
              <option value="student">Student</option>
              <option value="employee">Employee</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>{entityType === 'student' ? 'Student' : 'Employee'}</FormLabel>
            <Select
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
            >
              <option value="">Select {entityType}</option>
              {entities.map((entity) => (
                <option key={entity._id} value={entity._id}>
                  {entity.name || entity.firstName}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Month</FormLabel>
            <Select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {monthNames.map((m, index) => (
                <option key={index} value={index + 1}>
                  {m}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Year</FormLabel>
            <Select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => year - 2 + i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </FormControl>
        </SimpleGrid>

        {summary && (
          <VStack align="stretch" spacing={6}>
            <Box p={6} borderRadius="xl" bg="brand.canvasLavender">
              <Text fontSize="lg" fontWeight="700" mb={4}>
                {monthNames[month - 1]} {year} Summary
              </Text>

              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600">Present Days</Text>
                  <Text fontSize="2xl" fontWeight="700" color="green.600">
                    {summary.present}
                  </Text>
                </VStack>

                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600">Absent Days</Text>
                  <Text fontSize="2xl" fontWeight="700" color="red.600">
                    {summary.absent}
                  </Text>
                </VStack>

                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600">Half Days</Text>
                  <Text fontSize="2xl" fontWeight="700" color="yellow.600">
                    {summary.halfDay}
                  </Text>
                </VStack>

                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" color="gray.600">On Leave</Text>
                  <Text fontSize="2xl" fontWeight="700" color="blue.600">
                    {summary.onLeave}
                  </Text>
                </VStack>
              </SimpleGrid>

              <VStack align="start" spacing={3} mt={6}>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="700">Attendance Percentage</Text>
                  <Badge fontSize="lg" colorScheme="green">
                    {summary.percentage}%
                  </Badge>
                </HStack>
                <Progress value={summary.percentage} colorScheme="green" borderRadius="full" />
              </VStack>

              <HStack justify="space-between" mt={6} pt={6} borderTop="1px solid" borderColor="brand.hairline">
                <Text fontWeight="700">Total Days</Text>
                <Text fontSize="lg" fontWeight="700">
                  {summary.total}
                </Text>
              </HStack>
            </Box>
          </VStack>
        )}
      </Stack>
    </PageWrapper>
  );
}

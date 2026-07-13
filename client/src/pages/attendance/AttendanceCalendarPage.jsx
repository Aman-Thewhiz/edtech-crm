import { useState, useEffect } from 'react';
import {
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Select,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/ui/PageWrapper';
import { fetchAttendanceByEntity } from '../../services/attendance';
import { fetchStudents } from '../../services/students';
import { fetchEmployees } from '../../services/employees';

const statusColors = {
  present: 'green',
  absent: 'red',
  'half-day': 'yellow',
  'on-leave': 'blue',
  holiday: 'purple',
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function AttendanceCalendarPage() {
  const navigate = useNavigate();
  const [entityType, setEntityType] = useState('student');
  const [entityId, setEntityId] = useState('');
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [entities, setEntities] = useState([]);
  const [attendance, setAttendance] = useState({});
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
      loadAttendance();
    }
  }, [entityId, month, year]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const from = new Date(year, month, 1).toISOString().split('T')[0];
      const to = new Date(year, month + 1, 0).toISOString().split('T')[0];
      const records = await fetchAttendanceByEntity(entityType, entityId, { from, to });

      const attendanceMap = {};
      records.forEach((record) => {
        const date = new Date(record.date).getDate();
        attendanceMap[date] = record.status;
      });
      setAttendance(attendanceMap);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <Box>
          <Text fontSize="sm" color="gray.500">Attendance</Text>
          <Text fontSize="2xl" fontWeight="700">Attendance Calendar</Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
          <FormControl>
            <FormLabel>Entity Type</FormLabel>
            <Select
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value);
                setEntityId('');
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
        </SimpleGrid>

        {entityId && (
          <VStack align="stretch" spacing={4}>
            <HStack justify="space-between" align="center">
              <Button onClick={handlePrevMonth} variant="outline">
                Previous
              </Button>
              <Text fontSize="lg" fontWeight="700">
                {monthNames[month]} {year}
              </Text>
              <Button onClick={handleNextMonth} variant="outline">
                Next
              </Button>
            </HStack>

            <Box overflowX="auto" borderRadius="xl" border="1px solid" borderColor="brand.hairline">
              <SimpleGrid columns={7} spacing={1} p={4}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <Box key={day} p={2} textAlign="center" fontWeight="700" fontSize="sm">
                    {day}
                  </Box>
                ))}

                {emptyDays.map((_, index) => (
                  <Box key={`empty-${index}`} />
                ))}

                {days.map((day) => {
                  const status = attendance[day];
                  return (
                    <Box
                      key={day}
                      p={3}
                      textAlign="center"
                      borderRadius="lg"
                      border="1px solid"
                      borderColor="brand.hairline"
                      bg={status ? `${statusColors[status]}.50` : 'white'}
                      cursor="pointer"
                      _hover={{ bg: 'gray.50' }}
                    >
                      <Text fontSize="sm" fontWeight="700" mb={1}>
                        {day}
                      </Text>
                      {status && (
                        <Badge fontSize="xs" colorScheme={statusColors[status]} borderRadius="full">
                          {status}
                        </Badge>
                      )}
                    </Box>
                  );
                })}
              </SimpleGrid>
            </Box>

            <HStack spacing={4} justify="center" flexWrap="wrap">
              {Object.entries(statusColors).map(([status, color]) => (
                <HStack key={status} spacing={2}>
                  <Box w={4} h={4} borderRadius="md" bg={`${color}.200`} />
                  <Text fontSize="sm">{status}</Text>
                </HStack>
              ))}
            </HStack>
          </VStack>
        )}
      </Stack>
    </PageWrapper>
  );
}

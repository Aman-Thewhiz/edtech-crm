import {
  Box,
  VStack,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  Input,
  Select,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Spinner,
  Center,
  useToast,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import PageWrapper from '../../components/ui/PageWrapper';
import * as auditLogService from '../../services/auditLogs';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    resource: '',
    action: '',
  });
  const toast = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await auditLogService.listAuditLogs(filters);
      setLogs(response.data);
    } catch (error) {
      toast({
        title: 'Error fetching audit logs',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'POST': return 'green';
      case 'PUT':
      case 'PATCH': return 'blue';
      case 'DELETE': return 'red';
      default: return 'gray';
    }
  };

  return (
    <PageWrapper>
      <VStack spacing={6} align="stretch">
        <Breadcrumb fontSize="sm" color="brand.ink-mute">
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/settings">Settings</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <Text>Audit Logs</Text>
          </BreadcrumbItem>
        </Breadcrumb>

        <VStack align="start" spacing={0}>
          <Heading size="lg">Audit Logs</Heading>
          <Text color="brand.ink-mute">Track all system activities and changes.</Text>
        </VStack>

        <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline" shadow="sm">
          <HStack spacing={4} mb={6}>
            <Input
              name="resource"
              placeholder="Filter by resource (e.g. /api/v1/leads)"
              value={filters.resource}
              onChange={handleFilterChange}
              maxW="300px"
            />
            <Select
              name="action"
              placeholder="All Actions"
              value={filters.action}
              onChange={handleFilterChange}
              maxW="200px"
            >
              <option value="POST">POST (Create)</option>
              <option value="PUT">PUT (Update)</option>
              <option value="PATCH">PATCH (Partial Update)</option>
              <option value="DELETE">DELETE (Delete)</option>
            </Select>
          </HStack>

          {loading ? (
            <Center py={10}>
              <Spinner color="brand.primary" />
            </Center>
          ) : (
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Timestamp</Th>
                  <Th>Actor</Th>
                  <Th>Action</Th>
                  <Th>Resource</Th>
                  <Th>Details</Th>
                </Tr>
              </Thead>
              <Tbody>
                {logs.map((log) => (
                  <Tr key={log._id}>
                    <Td fontSize="xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="bold" fontSize="sm">{log.actorId?.name || 'System'}</Text>
                        <Badge fontSize="10px" colorScheme="purple">{log.actorRole}</Badge>
                      </VStack>
                    </Td>
                    <Td>
                      <Badge colorScheme={getMethodColor(log.action)}>
                        {log.action}
                      </Badge>
                    </Td>
                    <Td fontSize="xs" maxW="200px" isTruncated>
                      {log.resource}
                    </Td>
                    <Td fontSize="xs">
                      <Box maxW="300px" maxH="60px" overflow="auto" p={1} bg="gray.50" borderRadius="md">
                        <pre style={{ fontSize: '10px' }}>
                          {JSON.stringify(log.metadata?.body, null, 2)}
                        </pre>
                      </Box>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
      </VStack>
    </PageWrapper>
  );
}

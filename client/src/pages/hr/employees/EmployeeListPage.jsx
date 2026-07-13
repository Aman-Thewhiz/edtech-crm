import { useState, useEffect, useMemo } from 'react';
import { Badge, Box, Button, HStack, Input, Select, SimpleGrid, Stack, Text, useToast } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../../components/ui/DataTable';
import EmptyState from '../../../components/ui/EmptyState';
import PageWrapper from '../../../components/ui/PageWrapper';
import { deleteEmployee, fetchEmployees } from '../../../services/employees';
import { fetchDepartments } from '../../../services/departments';
import { fetchDesignations } from '../../../services/designations';

const statusOptions = ['active', 'on-leave', 'resigned', 'terminated'];
const employmentTypeOptions = ['full-time', 'part-time', 'contract', 'intern'];

const statusColors = {
  active: 'green',
  'on-leave': 'yellow',
  resigned: 'orange',
  terminated: 'red',
};

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({});
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    designation: '',
    status: '',
  });

  const loadEmployees = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const response = await fetchEmployees({ ...nextFilters, limit: 20 });
      setEmployees(response.data || []);
      setPagination(response.pagination || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
    fetchDepartments({ limit: 100 }).then((res) => setDepartments(res.data || []));
    fetchDesignations({ limit: 100 }).then((res) => setDesignations(res.data || []));
  }, []);

  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value }));

  const clearFilters = async () => {
    const empty = { search: '', department: '', designation: '', status: '' };
    setFilters(empty);
    await loadEmployees(empty);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    try {
      await deleteEmployee(id);
      toast({ title: 'Employee deleted', status: 'success' });
      await loadEmployees();
    } catch (error) {
      toast({ title: 'Error deleting employee', description: error.message, status: 'error' });
    }
  };

  const columns = useMemo(() => ([
    {
      key: 'employeeId',
      header: 'Employee ID',
      render: (row) => <Link to={`/hr/employees/${row._id}`} style={{ color: '#1264a3' }}>{row.employeeId}</Link>,
    },
    {
      key: 'name',
      header: 'Name',
      render: (row) => row.name,
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => row.email,
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => row.department?.name || '-',
    },
    {
      key: 'designation',
      header: 'Designation',
      render: (row) => row.designation?.name || '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge borderRadius="full" colorScheme={statusColors[row.status]}>{row.status}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <HStack spacing={2}>
          <Button size="sm" variant="outline" onClick={() => navigate(`/hr/employees/${row._id}`)}>View</Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(row._id)}>Delete</Button>
        </HStack>
      ),
    },
  ]), [navigate]);

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Box>
            <Text fontSize="sm" color="gray.500">HR / Employees</Text>
            <Text fontSize="2xl" fontWeight="700">Employees</Text>
          </Box>
          <Button onClick={() => navigate('/hr/employees/new')}>Add Employee</Button>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={3}>
          <Input
            placeholder="Search employee"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
          />
          <Select
            placeholder="Department"
            value={filters.department}
            onChange={(event) => updateFilter('department', event.target.value)}
          >
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </Select>
          <Select
            placeholder="Designation"
            value={filters.designation}
            onChange={(event) => updateFilter('designation', event.target.value)}
          >
            {designations.map((desig) => (
              <option key={desig._id} value={desig._id}>
                {desig.name}
              </option>
            ))}
          </Select>
          <Select
            placeholder="Status"
            value={filters.status}
            onChange={(event) => updateFilter('status', event.target.value)}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </SimpleGrid>

        <HStack>
          <Button variant="outline" onClick={() => loadEmployees()}>
            Apply filters
          </Button>
          <Button variant="secondary" onClick={clearFilters}>
            Clear
          </Button>
        </HStack>

        {!loading && employees.length === 0 ? (
          <EmptyState
            title="No employees found"
            description="Add an employee to your organization."
          />
        ) : null}
        <DataTable columns={columns} data={employees} />
        <HStack justify="space-between" color="gray.500" fontSize="sm">
          <Text>
            Page {pagination.page || 1} of {pagination.totalPages || 1}
          </Text>
          <Text>{pagination.total || 0} total employees</Text>
        </HStack>
      </Stack>
    </PageWrapper>
  );
}

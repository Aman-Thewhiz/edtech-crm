import { useState, useEffect, useMemo } from 'react';
import { Badge, Box, Button, HStack, Input, Select, SimpleGrid, Stack, Text, useToast } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import PageWrapper from '../../components/ui/PageWrapper';
import { deleteInvoice, fetchInvoices } from '../../services/invoices';
import { fetchStudents } from '../../services/students';

const statusOptions = ['draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled'];

const statusColors = {
  draft: 'gray',
  sent: 'blue',
  partially_paid: 'orange',
  paid: 'green',
  overdue: 'red',
  cancelled: 'red',
};

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

function formatCurrency(value) {
  if (!value) return '₹0';
  return `₹${Number(value).toLocaleString()}`;
}

export default function InvoiceListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({});
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    student: '',
    from: '',
    to: '',
  });

  const loadInvoices = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const response = await fetchInvoices({ ...nextFilters, limit: 20 });
      setInvoices(response.data || []);
      setPagination(response);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
    fetchStudents({ limit: 100 }).then((response) => setStudents(response.data || []));
  }, []);

  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value }));

  const clearFilters = async () => {
    const empty = { search: '', status: '', student: '', from: '', to: '' };
    setFilters(empty);
    await loadInvoices(empty);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    try {
      await deleteInvoice(id);
      toast({ title: 'Invoice deleted', status: 'success' });
      await loadInvoices();
    } catch (error) {
      toast({ title: 'Error deleting invoice', description: error.message, status: 'error' });
    }
  };

  const columns = useMemo(() => ([
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (row) => <Link to={`/invoices/${row._id}`} style={{ color: '#1264a3' }}>{row.invoiceNumber}</Link>,
    },
    {
      key: 'student',
      header: 'Student',
      render: (row) => row.student?.name || '-',
    },
    {
      key: 'issueDate',
      header: 'Issue Date',
      render: (row) => formatDate(row.issueDate),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (row) => formatDate(row.dueDate),
    },
    {
      key: 'totalAmount',
      header: 'Total',
      render: (row) => formatCurrency(row.totalAmount),
    },
    {
      key: 'paidAmount',
      header: 'Paid',
      render: (row) => formatCurrency(row.paidAmount),
    },
    {
      key: 'balanceAmount',
      header: 'Balance',
      render: (row) => formatCurrency(row.balanceAmount),
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
          <Button size="sm" variant="outline" onClick={() => navigate(`/invoices/${row._id}`)}>View</Button>
          <Button size="sm" onClick={() => navigate(`/invoices/${row._id}/edit`)} isDisabled={row.status !== 'draft'}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(row._id)} isDisabled={row.status !== 'draft'}>Delete</Button>
        </HStack>
      ),
    },
  ]), [navigate]);

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Box>
            <Text fontSize="sm" color="gray.500">Finance / Invoices</Text>
            <Text fontSize="2xl" fontWeight="700">Invoices</Text>
          </Box>
          <Button onClick={() => navigate('/invoices/new')}>New Invoice</Button>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={3}>
          <Input
            placeholder="Search invoice number"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
          />
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
          <Select
            placeholder="Student"
            value={filters.student}
            onChange={(event) => updateFilter('student', event.target.value)}
          >
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.name}
              </option>
            ))}
          </Select>
          <Input
            type="date"
            placeholder="From date"
            value={filters.from}
            onChange={(event) => updateFilter('from', event.target.value)}
          />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={3}>
          <Input
            type="date"
            placeholder="To date"
            value={filters.to}
            onChange={(event) => updateFilter('to', event.target.value)}
          />
        </SimpleGrid>

        <HStack>
          <Button variant="outline" onClick={() => loadInvoices()}>
            Apply filters
          </Button>
          <Button variant="secondary" onClick={clearFilters}>
            Clear
          </Button>
        </HStack>

        {!loading && invoices.length === 0 ? (
          <EmptyState
            title="No invoices found"
            description="Create an invoice to start tracking student fees."
          />
        ) : null}
        <DataTable columns={columns} data={invoices} />
        <HStack justify="space-between" color="gray.500" fontSize="sm">
          <Text>
            Page {pagination.page || 1} of {pagination.totalPages || 1}
          </Text>
          <Text>{pagination.total || 0} total invoices</Text>
        </HStack>
      </Stack>
    </PageWrapper>
  );
}

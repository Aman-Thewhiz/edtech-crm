import { useState, useEffect, useMemo } from 'react';
import { Badge, Box, Button, HStack, Input, Select, SimpleGrid, Stack, Text, useToast } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import PageWrapper from '../../components/ui/PageWrapper';
import { deletePayment, fetchPayments } from '../../services/payments';
import { fetchInvoices } from '../../services/invoices';

const modeOptions = ['cash', 'upi', 'neft', 'cheque'];
const statusOptions = ['recorded', 'verified', 'reversed'];

const statusColors = {
  recorded: 'blue',
  verified: 'green',
  reversed: 'red',
};

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

function formatCurrency(value) {
  if (!value) return '₹0';
  return `₹${Number(value).toLocaleString()}`;
}

export default function PaymentListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({});
  const [invoices, setInvoices] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    mode: '',
    status: '',
    invoice: '',
    from: '',
    to: '',
  });

  const loadPayments = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const response = await fetchPayments({ ...nextFilters, limit: 20 });
      setPayments(response.data || []);
      setPagination(response.pagination || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
    fetchInvoices({ limit: 100 }).then((response) => setInvoices(response.data || []));
  }, []);

  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value }));

  const clearFilters = async () => {
    const empty = { search: '', mode: '', status: '', invoice: '', from: '', to: '' };
    setFilters(empty);
    await loadPayments(empty);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment?')) return;
    try {
      await deletePayment(id);
      toast({ title: 'Payment deleted', status: 'success' });
      await loadPayments();
    } catch (error) {
      toast({ title: 'Error deleting payment', description: error.message, status: 'error' });
    }
  };

  const columns = useMemo(() => ([
    {
      key: 'paymentNumber',
      header: 'Payment #',
      render: (row) => <Link to={`/payments/${row._id}`} style={{ color: '#1264a3' }}>{row.paymentNumber}</Link>,
    },
    {
      key: 'invoice',
      header: 'Invoice',
      render: (row) => row.invoice?.invoiceNumber || '-',
    },
    {
      key: 'student',
      header: 'Student',
      render: (row) => row.student?.name || '-',
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => formatCurrency(row.amount),
    },
    {
      key: 'mode',
      header: 'Mode',
      render: (row) => <Badge borderRadius="full">{row.mode}</Badge>,
    },
    {
      key: 'paymentDate',
      header: 'Date',
      render: (row) => formatDate(row.paymentDate),
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
          <Button size="sm" variant="outline" onClick={() => navigate(`/payments/${row._id}`)}>View</Button>
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
            <Text fontSize="sm" color="gray.500">Finance / Payments</Text>
            <Text fontSize="2xl" fontWeight="700">Payments</Text>
          </Box>
          <Button onClick={() => navigate('/payments/new')}>Record Payment</Button>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={3}>
          <Input
            placeholder="Search payment number"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
          />
          <Select
            placeholder="Mode"
            value={filters.mode}
            onChange={(event) => updateFilter('mode', event.target.value)}
          >
            {modeOptions.map((mode) => (
              <option key={mode} value={mode}>
                {mode.toUpperCase()}
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
          <Select
            placeholder="Invoice"
            value={filters.invoice}
            onChange={(event) => updateFilter('invoice', event.target.value)}
          >
            {invoices.map((invoice) => (
              <option key={invoice._id} value={invoice._id}>
                {invoice.invoiceNumber}
              </option>
            ))}
          </Select>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={3}>
          <Input
            type="date"
            placeholder="From date"
            value={filters.from}
            onChange={(event) => updateFilter('from', event.target.value)}
          />
          <Input
            type="date"
            placeholder="To date"
            value={filters.to}
            onChange={(event) => updateFilter('to', event.target.value)}
          />
        </SimpleGrid>

        <HStack>
          <Button variant="outline" onClick={() => loadPayments()}>
            Apply filters
          </Button>
          <Button variant="secondary" onClick={clearFilters}>
            Clear
          </Button>
        </HStack>

        {!loading && payments.length === 0 ? (
          <EmptyState
            title="No payments found"
            description="Record a payment to track student fee collections."
          />
        ) : null}
        <DataTable columns={columns} data={payments} />
        <HStack justify="space-between" color="gray.500" fontSize="sm">
          <Text>
            Page {pagination.page || 1} of {pagination.totalPages || 1}
          </Text>
          <Text>{pagination.total || 0} total payments</Text>
        </HStack>
      </Stack>
    </PageWrapper>
  );
}

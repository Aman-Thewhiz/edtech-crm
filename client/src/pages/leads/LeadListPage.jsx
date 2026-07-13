import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import PageWrapper from '../../components/ui/PageWrapper';
import { bulkUpdateLeads, deleteLead, exportLeads, fetchLeads } from '../../services/leads';

const statusOptions = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
const sourceOptions = ['walk-in', 'website', 'referral', 'social-media', 'campaign'];

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

export default function LeadListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [filters, setFilters] = useState({ q: '', status: '', source: '', assignedTo: '', from: '', to: '' });
  const [bulkStatus, setBulkStatus] = useState('');

  const loadLeads = async () => {
    setLoading(true);
    try {
      const response = await fetchLeads({ ...filters, limit: 20 });
      setLeads(response.data || []);
      setPagination(response.pagination || {});
    } finally {
      setLoading(false);
      setSelectedIds([]);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const applyFilters = async () => {
    await loadLeads();
  };

  const clearFilters = async () => {
    setFilters({ q: '', status: '', source: '', assignedTo: '', from: '', to: '' });
    await fetchLeads({ limit: 20 }).then((response) => {
      setLeads(response.data || []);
      setPagination(response.pagination || {});
    });
  };

  const columns = useMemo(() => ([
    {
      key: 'select',
      header: '',
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onChange={(event) => {
            if (event.target.checked) {
              setSelectedIds((current) => [...current, row.id]);
            } else {
              setSelectedIds((current) => current.filter((id) => id !== row.id));
            }
          }}
        />
      ),
    },
    { key: 'name', header: 'Lead', render: (row) => <Link to={`/leads/${row.id}`}>{row.name}</Link> },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'status', header: 'Status', render: (row) => <Badge borderRadius="full">{row.status}</Badge> },
    { key: 'source', header: 'Source' },
    { key: 'assignedTo', header: 'Assigned', render: (row) => row.assignedTo?.name || '-' },
    { key: 'followUpAt', header: 'Follow-up', render: (row) => <Text color={row.followUpAt && new Date(row.followUpAt) < new Date() ? 'red.500' : 'inherit'}>{formatDate(row.followUpAt)}</Text> },
    { key: 'leadScore', header: 'Score' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <HStack spacing={2}>
          <Button size="sm" variant="outline" onClick={() => navigate(`/leads/${row.id}`)}>View</Button>
          <Button size="sm" onClick={() => navigate(`/leads/${row.id}/edit`)}>Edit</Button>
        </HStack>
      ),
    },
  ]), [navigate, selectedIds]);

  const handleBulkAssign = async () => {
    const assignedTo = window.prompt('Enter the user ID to assign selected leads to');
    if (!assignedTo || !selectedIds.length) return;
    await bulkUpdateLeads({ ids: selectedIds, assignedTo });
    toast({ title: 'Leads assigned', status: 'success' });
    await loadLeads();
  };

  const handleBulkStatus = async () => {
    if (!bulkStatus || !selectedIds.length) return;
    await bulkUpdateLeads({ ids: selectedIds, status: bulkStatus });
    toast({ title: 'Lead status updated', status: 'success' });
    await loadLeads();
  };

  const handleExport = async () => {
    const blob = await exportLeads(filters);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leads.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    await deleteLead(id);
    toast({ title: 'Lead deleted', status: 'success' });
    await loadLeads();
  };

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Box>
            <Text fontSize="sm" color="gray.500">CRM / Lead Management</Text>
            <Text fontSize="2xl" fontWeight="700">Leads</Text>
          </Box>
          <HStack>
            <Button variant="outline" onClick={() => navigate('/leads/pipeline')}>Pipeline</Button>
            <Button onClick={() => navigate('/leads/new')}>New Lead</Button>
          </HStack>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={3}>
          <Input placeholder="Search name, email, phone" value={filters.q} onChange={(event) => handleFilterChange('q', event.target.value)} />
          <Select placeholder="Status" value={filters.status} onChange={(event) => handleFilterChange('status', event.target.value)}>
            {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
          </Select>
          <Select placeholder="Source" value={filters.source} onChange={(event) => handleFilterChange('source', event.target.value)}>
            {sourceOptions.map((source) => <option key={source} value={source}>{source}</option>)}
          </Select>
          <Input placeholder="Assigned to user id" value={filters.assignedTo} onChange={(event) => handleFilterChange('assignedTo', event.target.value)} />
          <Input type="date" value={filters.from} onChange={(event) => handleFilterChange('from', event.target.value)} />
          <Input type="date" value={filters.to} onChange={(event) => handleFilterChange('to', event.target.value)} />
        </SimpleGrid>

        <HStack flexWrap="wrap">
          <Button variant="outline" onClick={applyFilters}>Apply filters</Button>
          <Button variant="secondary" onClick={clearFilters}>Clear</Button>
          <Button variant="outline" onClick={handleExport}>Export CSV</Button>
          <Select w="200px" placeholder="Bulk status" value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value)}>
            {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
          </Select>
          <Button variant="outline" onClick={handleBulkStatus} isDisabled={!selectedIds.length}>Change status</Button>
          <Button variant="outline" onClick={handleBulkAssign} isDisabled={!selectedIds.length}>Assign</Button>
        </HStack>

        {!loading && leads.length === 0 ? <EmptyState title="No leads found" description="Use the filters or create a new lead to get started." /> : null}

        <DataTable
          columns={columns}
          data={leads.map((lead) => ({ ...lead, onDelete: () => handleDelete(lead.id) }))}
        />

        <HStack justify="space-between" color="gray.500" fontSize="sm">
          <Text>Page {pagination.page || 1} of {pagination.totalPages || 1}</Text>
          <Text>{pagination.total || 0} total leads</Text>
        </HStack>
      </Stack>
    </PageWrapper>
  );
}
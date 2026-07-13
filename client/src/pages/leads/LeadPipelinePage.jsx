import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Heading, HStack, SimpleGrid, Stack, Text, useToast, VStack } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/ui/PageWrapper';
import EmptyState from '../../components/ui/EmptyState';
import { fetchLeads, updateLeadStatus } from '../../services/leads';

const statuses = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

export default function LeadPipelinePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedLead, setDraggedLead] = useState(null);

  useEffect(() => {
    fetchLeads({ limit: 100 })
      .then((response) => setLeads(response.data || []))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => Object.fromEntries(statuses.map((status) => [status, leads.filter((lead) => lead.status === status)])), [leads]);

  const handleDrop = async (status) => {
    if (!draggedLead) return;
    const updated = await updateLeadStatus(draggedLead.id, status);
    setLeads((current) => current.map((lead) => (lead.id === updated.id ? updated : lead)));
    setDraggedLead(null);
    toast({ title: 'Lead moved', status: 'success' });
  };

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <HStack justify="space-between">
          <Box>
            <Text fontSize="sm" color="gray.500">Pipeline view</Text>
            <Heading size="lg">Lead pipeline</Heading>
          </Box>
          <Button onClick={() => navigate('/leads')}>Back to list</Button>
        </HStack>

        {loading ? <Text>Loading pipeline...</Text> : null}
        {!loading && leads.length === 0 ? <EmptyState title="No leads in pipeline" description="Create a lead to start dragging cards between statuses." /> : null}

        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4}>
          {statuses.map((status) => (
            <Box
              key={status}
              border="1px solid"
              borderColor="brand.hairline"
              borderRadius="xl"
              p={4}
              minH="320px"
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(status)}
            >
              <Heading size="sm" mb={4}>{status}</Heading>
              <VStack align="stretch" spacing={3}>
                {grouped[status].map((lead) => (
                  <Box
                    key={lead.id}
                    draggable
                    onDragStart={() => setDraggedLead(lead)}
                    p={3}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="brand.hairline"
                    bg="white"
                    cursor="grab"
                  >
                    <Link to={`/leads/${lead.id}`}><Text fontWeight="700">{lead.name}</Text></Link>
                    <Text fontSize="sm" color="gray.600">{lead.source} · Score {lead.leadScore}</Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </Stack>
    </PageWrapper>
  );
}
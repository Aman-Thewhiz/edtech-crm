import { useEffect, useState } from 'react';
import { Badge, Box, Button, Heading, HStack, Link, SimpleGrid, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, Text, Textarea, useToast, VStack } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import PageWrapper from '../../components/ui/PageWrapper';
import EmptyState from '../../components/ui/EmptyState';
import { addLeadActivity, fetchLead } from '../../services/leads';

export default function LeadDetailPage() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState(null);
  const [activity, setActivity] = useState({ type: 'call', summary: '', scheduledAt: '' });

  useEffect(() => {
    fetchLead(leadId)
      .then(setLead)
      .finally(() => setLoading(false));
  }, [leadId]);

  const refreshLead = async () => {
    const latest = await fetchLead(leadId);
    setLead(latest);
  };

  const submitActivity = async (event) => {
    event.preventDefault();
    await addLeadActivity(leadId, activity);
    setActivity({ type: 'call', summary: '', scheduledAt: '' });
    toast({ title: 'Activity logged', status: 'success' });
    await refreshLead();
  };

  if (loading) {
    return <PageWrapper><Text>Loading lead...</Text></PageWrapper>;
  }

  if (!lead) {
    return <PageWrapper><EmptyState title="Lead not found" description="The lead may have been deleted or you may not have access." /></PageWrapper>;
  }

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Box>
            <Text fontSize="sm" color="gray.500">Lead detail</Text>
            <Heading size="lg">{lead.name}</Heading>
          </Box>
          <HStack>
            <Button variant="outline" as={RouterLink} to="/leads">Back</Button>
            <Button onClick={() => navigate(`/leads/${lead.id}/edit`)}>Edit</Button>
          </HStack>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline"><Text fontSize="sm">Status</Text><Badge mt={2} borderRadius="full">{lead.status}</Badge></Box>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline"><Text fontSize="sm">Source</Text><Text mt={2} fontWeight="700">{lead.source}</Text></Box>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline"><Text fontSize="sm">Score</Text><Text mt={2} fontWeight="700">{lead.leadScore}/5</Text></Box>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline"><Text fontSize="sm">Follow-up</Text><Text mt={2} fontWeight="700">{lead.followUpAt ? new Date(lead.followUpAt).toLocaleDateString() : 'None'}</Text></Box>
        </SimpleGrid>

        <Tabs variant="enclosed">
          <TabList>
            <Tab>Overview</Tab>
            <Tab>Activities</Tab>
            <Tab>Notes</Tab>
            <Tab>Documents</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                  <Heading size="sm" mb={3}>Contact</Heading>
                  <VStack align="stretch" spacing={2}>
                    <Text>Email: {lead.email}</Text>
                    <Text>Phone: {lead.phone}</Text>
                    <Text>Alternate: {lead.alternatePhone || '-'}</Text>
                    <Text>Assigned to: {lead.assignedTo?.name || '-'}</Text>
                  </VStack>
                </Box>
                <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                  <Heading size="sm" mb={3}>Conversion</Heading>
                  <Text>Converted to admission: {lead.convertedToAdmission ? 'Yes' : 'No'}</Text>
                  <Link as={RouterLink} to="/admissions">Trigger admission flow later</Link>
                </Box>
              </SimpleGrid>
            </TabPanel>
            <TabPanel>
              <Stack as="form" spacing={4} onSubmit={submitActivity}>
                <Heading size="sm">Log activity</Heading>
                <Textarea value={activity.summary} onChange={(event) => setActivity((current) => ({ ...current, summary: event.target.value }))} placeholder="Call, email, meeting notes" />
                <HStack>
                  <Button type="submit">Save activity</Button>
                </HStack>
              </Stack>
              <VStack mt={6} align="stretch" spacing={3}>
                {(lead.activities || []).map((item) => (
                  <Box key={item._id || item.createdAt} p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                    <Text fontWeight="700">{item.type}</Text>
                    <Text color="gray.600">{item.summary}</Text>
                  </Box>
                ))}
              </VStack>
            </TabPanel>
            <TabPanel>
              <VStack align="stretch" spacing={3}>
                {(lead.notes || []).map((item) => (
                  <Box key={item._id || item.createdAt} p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                    <Text>{item.body}</Text>
                  </Box>
                ))}
              </VStack>
            </TabPanel>
            <TabPanel>
              <VStack align="stretch" spacing={3}>
                {(lead.documents || []).map((item) => (
                  <Box key={item._id || item.createdAt} p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                    <Link href={item.url} isExternal>{item.name}</Link>
                  </Box>
                ))}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    </PageWrapper>
  );
}
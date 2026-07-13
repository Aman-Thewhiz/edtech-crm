import { useEffect, useState } from 'react';
import { Box, Button, FormControl, FormLabel, Heading, Input, Select, SimpleGrid, Stack, Text, Textarea, useToast } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import PageWrapper from '../../components/ui/PageWrapper';
import { createLead, fetchLead, updateLead } from '../../services/leads';

const sourceOptions = ['walk-in', 'website', 'referral', 'social-media', 'campaign'];
const statusOptions = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

export default function LeadFormPage() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(leadId);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    alternatePhone: '',
    source: 'website',
    status: 'new',
    leadScore: 3,
    assignedTo: '',
    followUpAt: '',
    notes: '',
    documentName: '',
    documentUrl: '',
  });

  useEffect(() => {
    if (!isEdit) return;
    fetchLead(leadId)
      .then((lead) => {
        setForm({
          name: lead.name || '',
          email: lead.email || '',
          phone: lead.phone || '',
          alternatePhone: lead.alternatePhone || '',
          source: lead.source || 'website',
          status: lead.status || 'new',
          leadScore: lead.leadScore || 3,
          assignedTo: lead.assignedTo?._id || lead.assignedTo || '',
          followUpAt: lead.followUpAt ? new Date(lead.followUpAt).toISOString().slice(0, 10) : '',
          notes: '',
          documentName: lead.documents?.[0]?.name || '',
          documentUrl: lead.documents?.[0]?.url || '',
        });
      })
      .finally(() => setLoading(false));
  }, [isEdit, leadId]);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      alternatePhone: form.alternatePhone,
      source: form.source,
      status: form.status,
      leadScore: Number(form.leadScore),
      assignedTo: form.assignedTo || undefined,
      followUpAt: form.followUpAt || undefined,
      notes: form.notes,
      documents: form.documentName && form.documentUrl ? [{ name: form.documentName, url: form.documentUrl }] : [],
    };

    try {
      if (isEdit) {
        await updateLead(leadId, payload);
        toast({ title: 'Lead updated', status: 'success' });
      } else {
        await createLead(payload);
        toast({ title: 'Lead created', status: 'success' });
      }
      navigate('/leads');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageWrapper><Text>Loading lead...</Text></PageWrapper>;
  }

  return (
    <PageWrapper>
      <Stack as="form" spacing={6} onSubmit={handleSubmit}>
        <Box>
          <Text fontSize="sm" color="gray.500">CRM / Lead Management</Text>
          <Heading size="lg">{isEdit ? 'Edit lead' : 'Create lead'}</Heading>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl><FormLabel>Name</FormLabel><Input value={form.name} onChange={(event) => updateField('name', event.target.value)} /></FormControl>
          <FormControl><FormLabel>Email</FormLabel><Input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} /></FormControl>
          <FormControl><FormLabel>Phone</FormLabel><Input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} /></FormControl>
          <FormControl><FormLabel>Alternate phone</FormLabel><Input value={form.alternatePhone} onChange={(event) => updateField('alternatePhone', event.target.value)} /></FormControl>
          <FormControl><FormLabel>Source</FormLabel><Select value={form.source} onChange={(event) => updateField('source', event.target.value)}>{sourceOptions.map((source) => <option key={source} value={source}>{source}</option>)}</Select></FormControl>
          <FormControl><FormLabel>Status</FormLabel><Select value={form.status} onChange={(event) => updateField('status', event.target.value)}>{statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</Select></FormControl>
          <FormControl><FormLabel>Lead score</FormLabel><Input type="number" min={1} max={5} value={form.leadScore} onChange={(event) => updateField('leadScore', event.target.value)} /></FormControl>
          <FormControl><FormLabel>Assigned to user ID</FormLabel><Input value={form.assignedTo} onChange={(event) => updateField('assignedTo', event.target.value)} /></FormControl>
          <FormControl><FormLabel>Follow-up date</FormLabel><Input type="date" value={form.followUpAt} onChange={(event) => updateField('followUpAt', event.target.value)} /></FormControl>
          <FormControl><FormLabel>Document name</FormLabel><Input value={form.documentName} onChange={(event) => updateField('documentName', event.target.value)} /></FormControl>
          <FormControl><FormLabel>Document URL</FormLabel><Input value={form.documentUrl} onChange={(event) => updateField('documentUrl', event.target.value)} /></FormControl>
        </SimpleGrid>

        <FormControl>
          <FormLabel>Notes</FormLabel>
          <Textarea value={form.notes} onChange={(event) => updateField('notes', event.target.value)} />
        </FormControl>

        <Button type="submit" isLoading={saving}>{isEdit ? 'Save changes' : 'Create lead'}</Button>
      </Stack>
    </PageWrapper>
  );
}
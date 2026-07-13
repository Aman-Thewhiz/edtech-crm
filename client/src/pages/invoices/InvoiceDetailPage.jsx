import { useState, useEffect } from 'react';
import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  VStack,
  Select,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../../components/ui/EmptyState';
import PageWrapper from '../../components/ui/PageWrapper';
import {
  fetchInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  downloadInvoicePdf,
} from '../../services/invoices';

const statusFlow = ['draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled'];

const statusColors = {
  draft: 'gray',
  sent: 'blue',
  partially_paid: 'orange',
  paid: 'green',
  overdue: 'red',
  cancelled: 'red',
};

function nextStatus(status) {
  const index = statusFlow.indexOf(status);
  return index >= 0 && index < statusFlow.length - 1 ? statusFlow[index + 1] : null;
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

function formatCurrency(value) {
  if (!value) return '₹0';
  return `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function InvoiceDetailPage() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [nextStatusValue, setNextStatusValue] = useState('');

  const loadInvoice = async () => {
    setLoading(true);
    try {
      const data = await fetchInvoice(invoiceId);
      setInvoice(data);
      setNextStatusValue(nextStatus(data.status) || '');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const handleStatusChange = async () => {
    if (!nextStatusValue) return;
    setSaving(true);
    try {
      const updated = await updateInvoiceStatus(invoiceId, nextStatusValue);
      setInvoice(updated);
      setNextStatusValue(nextStatus(updated.status) || '');
      toast({ title: 'Invoice status updated', status: 'success' });
    } catch (error) {
      toast({ title: 'Error updating status', description: error.message, status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this invoice?')) return;
    setSaving(true);
    try {
      await deleteInvoice(invoiceId);
      toast({ title: 'Invoice deleted', status: 'success' });
      navigate('/invoices');
    } catch (error) {
      toast({ title: 'Error deleting invoice', description: error.message, status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await downloadInvoicePdf(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoice.invoiceNumber}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({ title: 'Error downloading PDF', description: error.message, status: 'error' });
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <Text>Loading invoice...</Text>
      </PageWrapper>
    );
  }

  if (!invoice) {
    return (
      <PageWrapper>
        <EmptyState
          title="Invoice not found"
          description="The invoice may have been deleted or you may not have access."
        />
      </PageWrapper>
    );
  }

  const isOverdue = invoice.status === 'overdue' || (new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid' && invoice.status !== 'cancelled');

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Box>
            <Text fontSize="sm" color="gray.500">Finance / Invoices</Text>
            <Heading size="lg">{invoice.invoiceNumber}</Heading>
            <Text color="gray.600">{invoice.student?.name || '-'}</Text>
          </Box>
          <HStack>
            <Button variant="outline" as={RouterLink} to="/invoices">
              Back
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/invoices/${invoice._id}/edit`)}
              isDisabled={invoice.status !== 'draft'}
            >
              Edit
            </Button>
            <Button onClick={handleDownloadPdf}>Download PDF</Button>
            <Button
              onClick={handleDelete}
              isDisabled={invoice.status !== 'draft'}
              isLoading={saving}
            >
              Delete
            </Button>
          </HStack>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
            <Text fontSize="sm">Status</Text>
            <Badge mt={2} borderRadius="full" colorScheme={statusColors[invoice.status]}>
              {invoice.status}
            </Badge>
            {isOverdue && (
              <Badge mt={2} ml={2} borderRadius="full" colorScheme="red">
                OVERDUE
              </Badge>
            )}
          </Box>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
            <Text fontSize="sm">Issue Date</Text>
            <Text mt={2} fontWeight="700">
              {formatDate(invoice.issueDate)}
            </Text>
          </Box>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
            <Text fontSize="sm">Due Date</Text>
            <Text mt={2} fontWeight="700">
              {formatDate(invoice.dueDate)}
            </Text>
          </Box>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
            <Text fontSize="sm">Student</Text>
            <Text mt={2} fontWeight="700">
              {invoice.student?.enrollmentNumber || '-'}
            </Text>
          </Box>
        </SimpleGrid>

        <Tabs variant="enclosed">
          <TabList>
            <Tab>Line Items</Tab>
            <Tab>Summary</Tab>
            <Tab>Workflow</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {invoice.items && invoice.items.length > 0 ? (
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Item</Th>
                      <Th>Description</Th>
                      <Th isNumeric>Qty</Th>
                      <Th isNumeric>Amount</Th>
                      <Th isNumeric>Total</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {invoice.items.map((item, idx) => (
                      <Tr key={idx}>
                        <Td>{item.title}</Td>
                        <Td>{item.description || '-'}</Td>
                        <Td isNumeric>{item.quantity}</Td>
                        <Td isNumeric>{formatCurrency(item.amount)}</Td>
                        <Td isNumeric>{formatCurrency(item.total)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <EmptyState title="No items" description="This invoice has no line items." />
              )}
            </TabPanel>

            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                  <HStack justify="space-between">
                    <Text>Subtotal</Text>
                    <Text fontWeight="700">{formatCurrency(invoice.subtotal)}</Text>
                  </HStack>
                </Box>

                {invoice.discount > 0 && (
                  <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                    <HStack justify="space-between">
                      <Text>Discount</Text>
                      <Text fontWeight="700">-{formatCurrency(invoice.discount)}</Text>
                    </HStack>
                  </Box>
                )}

                {invoice.tax > 0 && (
                  <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                    <HStack justify="space-between">
                      <Text>Tax</Text>
                      <Text fontWeight="700">{formatCurrency(invoice.tax)}</Text>
                    </HStack>
                  </Box>
                )}

                <Box p={4} borderRadius="xl" border="2px solid" borderColor="brand.primary" bg="brand.canvasLavender">
                  <HStack justify="space-between">
                    <Text fontWeight="700">Total Amount</Text>
                    <Text fontWeight="700" fontSize="lg">
                      {formatCurrency(invoice.totalAmount)}
                    </Text>
                  </HStack>
                </Box>

                <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                  <HStack justify="space-between">
                    <Text>Paid Amount</Text>
                    <Text fontWeight="700">{formatCurrency(invoice.paidAmount)}</Text>
                  </HStack>
                </Box>

                <Box p={4} borderRadius="xl" border="2px solid" borderColor="brand.primary">
                  <HStack justify="space-between">
                    <Text fontWeight="700">Balance Amount</Text>
                    <Text fontWeight="700" fontSize="lg">
                      {formatCurrency(invoice.balanceAmount)}
                    </Text>
                  </HStack>
                </Box>

                {invoice.notes && (
                  <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                    <Text fontSize="sm" fontWeight="700" mb={2}>
                      Notes
                    </Text>
                    <Text>{invoice.notes}</Text>
                  </Box>
                )}
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                  <Text fontSize="sm" fontWeight="700" mb={3}>
                    Update Status
                  </Text>
                  <HStack spacing={3}>
                    <Select
                      value={nextStatusValue}
                      onChange={(e) => setNextStatusValue(e.target.value)}
                      isDisabled={!nextStatusValue}
                      placeholder="Select next status"
                    >
                      {nextStatusValue && (
                        <option value={nextStatusValue}>{nextStatusValue}</option>
                      )}
                    </Select>
                    <Button
                      onClick={handleStatusChange}
                      isDisabled={!nextStatusValue}
                      isLoading={saving}
                    >
                      Update
                    </Button>
                  </HStack>
                </Box>

                <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                  <Text fontSize="sm" fontWeight="700" mb={2}>
                    Status Flow
                  </Text>
                  <HStack spacing={2} flexWrap="wrap">
                    {statusFlow.map((status, idx) => (
                      <Box key={status}>
                        <Badge
                          borderRadius="full"
                          colorScheme={statusColors[status]}
                          opacity={statusFlow.indexOf(invoice.status) >= idx ? 1 : 0.5}
                        >
                          {status}
                        </Badge>
                        {idx < statusFlow.length - 1 && <Text mx={1}>→</Text>}
                      </Box>
                    ))}
                  </HStack>
                </Box>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    </PageWrapper>
  );
}

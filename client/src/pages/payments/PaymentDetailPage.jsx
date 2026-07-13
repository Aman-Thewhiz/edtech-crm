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
  Textarea,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../../components/ui/EmptyState';
import PageWrapper from '../../components/ui/PageWrapper';
import { fetchPayment, reversePayment, deletePayment } from '../../services/payments';

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
  return `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PaymentDetailPage() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [payment, setPayment] = useState(null);
  const [reversalReason, setReversalReason] = useState('');

  const loadPayment = async () => {
    setLoading(true);
    try {
      const data = await fetchPayment(paymentId);
      setPayment(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayment();
  }, [paymentId]);

  const handleReverse = async () => {
    if (!reversalReason.trim()) {
      toast({ title: 'Please provide a reversal reason', status: 'error' });
      return;
    }
    setSaving(true);
    try {
      const updated = await reversePayment(paymentId, reversalReason);
      setPayment(updated);
      setReversalReason('');
      toast({ title: 'Payment reversed', status: 'success' });
    } catch (error) {
      toast({ title: 'Error reversing payment', description: error.message, status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this payment?')) return;
    setSaving(true);
    try {
      await deletePayment(paymentId);
      toast({ title: 'Payment deleted', status: 'success' });
      navigate('/payments');
    } catch (error) {
      toast({ title: 'Error deleting payment', description: error.message, status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <Text>Loading payment...</Text>
      </PageWrapper>
    );
  }

  if (!payment) {
    return (
      <PageWrapper>
        <EmptyState
          title="Payment not found"
          description="The payment may have been deleted or you may not have access."
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Box>
            <Text fontSize="sm" color="gray.500">Finance / Payments</Text>
            <Heading size="lg">{payment.paymentNumber}</Heading>
            <Text color="gray.600">{payment.student?.name || '-'}</Text>
          </Box>
          <HStack>
            <Button variant="outline" as={RouterLink} to="/payments">
              Back
            </Button>
            <Button
              onClick={handleDelete}
              isLoading={saving}
            >
              Delete
            </Button>
          </HStack>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
            <Text fontSize="sm">Status</Text>
            <Badge mt={2} borderRadius="full" colorScheme={statusColors[payment.status]}>
              {payment.status}
            </Badge>
          </Box>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
            <Text fontSize="sm">Amount</Text>
            <Text mt={2} fontWeight="700" fontSize="lg">
              {formatCurrency(payment.amount)}
            </Text>
          </Box>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
            <Text fontSize="sm">Mode</Text>
            <Text mt={2} fontWeight="700">
              {payment.mode?.toUpperCase()}
            </Text>
          </Box>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
            <Text fontSize="sm">Date</Text>
            <Text mt={2} fontWeight="700">
              {formatDate(payment.paymentDate)}
            </Text>
          </Box>
        </SimpleGrid>

        <Tabs variant="enclosed">
          <TabList>
            <Tab>Details</Tab>
            <Tab>Invoice</Tab>
            <Tab>Actions</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                  <Text fontSize="sm" fontWeight="700" mb={2}>
                    Reference Number
                  </Text>
                  <Text>{payment.referenceNumber || '-'}</Text>
                </Box>

                {payment.notes && (
                  <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                    <Text fontSize="sm" fontWeight="700" mb={2}>
                      Notes
                    </Text>
                    <Text>{payment.notes}</Text>
                  </Box>
                )}

                {payment.reversalReason && (
                  <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline" bg="brand.canvasLavender">
                    <Text fontSize="sm" fontWeight="700" mb={2}>
                      Reversal Reason
                    </Text>
                    <Text>{payment.reversalReason}</Text>
                  </Box>
                )}
              </VStack>
            </TabPanel>

            <TabPanel>
              {payment.invoice ? (
                <VStack align="stretch" spacing={4}>
                  <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                    <Text fontSize="sm">Invoice Number</Text>
                    <Text mt={2} fontWeight="700">
                      {payment.invoice?.invoiceNumber}
                    </Text>
                  </Box>
                  <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                    <Text fontSize="sm">Invoice Amount</Text>
                    <Text mt={2} fontWeight="700">
                      {formatCurrency(payment.invoice?.totalAmount)}
                    </Text>
                  </Box>
                  <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                    <Text fontSize="sm">Invoice Status</Text>
                    <Badge mt={2} borderRadius="full">
                      {payment.invoice?.status}
                    </Badge>
                  </Box>
                </VStack>
              ) : (
                <EmptyState title="No invoice linked" description="This payment is not linked to an invoice." />
              )}
            </TabPanel>

            <TabPanel>
              {payment.status !== 'reversed' ? (
                <VStack align="stretch" spacing={4}>
                  <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
                    <Text fontSize="sm" fontWeight="700" mb={3}>
                      Reverse Payment
                    </Text>
                    <Textarea
                      placeholder="Enter reason for reversal..."
                      value={reversalReason}
                      onChange={(e) => setReversalReason(e.target.value)}
                      mb={3}
                    />
                    <Button
                      onClick={handleReverse}
                      isDisabled={!reversalReason.trim()}
                      isLoading={saving}
                    >
                      Reverse Payment
                    </Button>
                  </Box>
                </VStack>
              ) : (
                <EmptyState
                  title="Payment reversed"
                  description="This payment has already been reversed and cannot be modified."
                />
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    </PageWrapper>
  );
}

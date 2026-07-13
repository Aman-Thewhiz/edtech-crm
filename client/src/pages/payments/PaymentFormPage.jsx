import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  Stack,
  Text,
  Textarea,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/ui/PageWrapper';
import { createPayment } from '../../services/payments';
import { fetchInvoices } from '../../services/invoices';
import { fetchStudents } from '../../services/students';

const modeOptions = ['cash', 'upi', 'neft', 'cheque'];

export default function PaymentFormPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    invoice: '',
    amount: '',
    mode: 'cash',
    referenceNumber: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    Promise.all([
      fetchInvoices({ limit: 100 }).then((res) => setInvoices(res.data || [])),
      fetchStudents({ limit: 100 }).then((res) => setStudents(res.data || [])),
    ]);
  }, []);

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.invoice || !formData.amount || !formData.mode) {
      toast({ title: 'Please fill all required fields', status: 'error' });
      return;
    }

    setLoading(true);
    try {
      const invoice = invoices.find((inv) => inv._id === formData.invoice);
      const payload = {
        invoice: formData.invoice,
        student: invoice?.student?._id,
        amount: Number(formData.amount),
        mode: formData.mode,
        referenceNumber: formData.referenceNumber,
        paymentDate: new Date(formData.paymentDate),
        notes: formData.notes,
      };

      const payment = await createPayment(payload);
      toast({ title: 'Payment recorded', status: 'success' });
      navigate(`/payments/${payment._id}`);
    } catch (error) {
      toast({ title: 'Error recording payment', description: error.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const selectedInvoice = invoices.find((inv) => inv._id === formData.invoice);
  const maxAmount = selectedInvoice?.balanceAmount || 0;

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <Box>
          <Text fontSize="sm" color="gray.500">Finance / Payments</Text>
          <Text fontSize="2xl" fontWeight="700">Record Payment</Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack align="stretch" spacing={4}>
            <FormControl isRequired>
              <FormLabel>Invoice</FormLabel>
              <Select
                value={formData.invoice}
                onChange={(e) => handleChange('invoice', e.target.value)}
              >
                <option value="">Select invoice</option>
                {invoices.map((invoice) => (
                  <option key={invoice._id} value={invoice._id}>
                    {invoice.invoiceNumber} - {invoice.student?.name} - ₹{invoice.balanceAmount}
                  </option>
                ))}
              </Select>
            </FormControl>

            {selectedInvoice && (
              <Box p={4} borderRadius="xl" bg="brand.canvasLavender">
                <Stack spacing={2}>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Invoice Total:</Text>
                    <Text fontWeight="700">₹{selectedInvoice.totalAmount}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Paid Amount:</Text>
                    <Text fontWeight="700">₹{selectedInvoice.paidAmount}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Balance:</Text>
                    <Text fontWeight="700" color="brand.primary">
                      ₹{selectedInvoice.balanceAmount}
                    </Text>
                  </HStack>
                </Stack>
              </Box>
            )}

            <FormControl isRequired>
              <FormLabel>Amount</FormLabel>
              <Input
                type="number"
                step="0.01"
                min="0"
                max={maxAmount}
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="Enter payment amount"
              />
              {maxAmount > 0 && (
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Max: ₹{maxAmount}
                </Text>
              )}
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Payment Mode</FormLabel>
              <Select
                value={formData.mode}
                onChange={(e) => handleChange('mode', e.target.value)}
              >
                {modeOptions.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode.toUpperCase()}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Reference Number</FormLabel>
              <Input
                value={formData.referenceNumber}
                onChange={(e) => handleChange('referenceNumber', e.target.value)}
                placeholder="e.g., Cheque #, UPI Ref #"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Payment Date</FormLabel>
              <Input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => handleChange('paymentDate', e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Notes</FormLabel>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Additional notes..."
              />
            </FormControl>

            <HStack justify="flex-end" pt={4}>
              <Button variant="outline" onClick={() => navigate('/payments')}>
                Cancel
              </Button>
              <Button type="submit" isLoading={loading}>
                Record Payment
              </Button>
            </HStack>
          </VStack>
        </form>
      </Stack>
    </PageWrapper>
  );
}

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  useToast,
  VStack,
  HStack,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiTrash2, FiPlus } from 'react-icons/fi';
import PageWrapper from '../../components/ui/PageWrapper';
import { createInvoice, fetchInvoice, updateInvoice } from '../../services/invoices';
import { fetchStudents } from '../../services/students';

function formatCurrency(value) {
  if (!value) return '₹0';
  return `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function InvoiceFormPage() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(invoiceId);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    student: '',
    dueDate: '',
    items: [{ title: '', description: '', quantity: 1, amount: 0 }],
    discount: 0,
    tax: 0,
    notes: '',
  });

  useEffect(() => {
    fetchStudents({ limit: 100 }).then((response) => setStudents(response.data || []));
    if (!isEdit) return;
    fetchInvoice(invoiceId)
      .then((invoice) => {
        const dueDate = invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '';
        setForm({
          student: invoice.student?._id || '',
          dueDate,
          items: invoice.items || [{ title: '', description: '', quantity: 1, amount: 0 }],
          discount: invoice.discount || 0,
          tax: invoice.tax || 0,
          notes: invoice.notes || '',
        });
      })
      .finally(() => setLoading(false));
  }, [invoiceId, isEdit]);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const updateItem = (index, field, value) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => {
        if (itemIndex === index) {
          const updated = { ...item, [field]: value };
          // Recalculate total if quantity or amount changes
          if (field === 'quantity' || field === 'amount') {
            updated.total = Number(updated.quantity) * Number(updated.amount);
          }
          return updated;
        }
        return item;
      }),
    }));
  };

  const addItem = () => {
    setForm((current) => ({
      ...current,
      items: [...current.items, { title: '', description: '', quantity: 1, amount: 0, total: 0 }],
    }));
  };

  const removeItem = (index) => {
    setForm((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const calculateSubtotal = () => {
    return form.items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - Number(form.discount) + Number(form.tax);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.student) {
      toast({ title: 'Please select a student', status: 'error' });
      return;
    }

    if (!form.dueDate) {
      toast({ title: 'Please select a due date', status: 'error' });
      return;
    }

    if (form.items.length === 0 || form.items.every((item) => !item.title)) {
      toast({ title: 'Please add at least one item', status: 'error' });
      return;
    }

    setSaving(true);
    const payload = {
      student: form.student,
      dueDate: form.dueDate,
      items: form.items.map((item) => ({
        title: item.title,
        description: item.description || '',
        quantity: Number(item.quantity),
        amount: Number(item.amount),
        total: Number(item.total),
      })),
      discount: Number(form.discount),
      tax: Number(form.tax),
      notes: form.notes,
    };

    try {
      if (isEdit) {
        await updateInvoice(invoiceId, payload);
        toast({ title: 'Invoice updated', status: 'success' });
      } else {
        await createInvoice(payload);
        toast({ title: 'Invoice created', status: 'success' });
      }
      navigate('/invoices');
    } catch (error) {
      toast({ title: 'Error saving invoice', description: error.message, status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <Text>Loading invoice...</Text>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Stack as="form" spacing={6} onSubmit={handleSubmit}>
        <Box>
          <Text fontSize="sm" color="gray.500">
            Finance / Invoices
          </Text>
          <Heading size="lg">{isEdit ? 'Edit invoice' : 'Create invoice'}</Heading>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl isRequired>
            <FormLabel>Student</FormLabel>
            <Select
              value={form.student}
              onChange={(event) => updateField('student', event.target.value)}
              placeholder="Select student"
              isDisabled={isEdit}
            >
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.enrollmentNumber})
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Due Date</FormLabel>
            <Input
              type="date"
              value={form.dueDate}
              onChange={(event) => updateField('dueDate', event.target.value)}
            />
          </FormControl>
        </SimpleGrid>

        <Box>
          <HStack justify="space-between" mb={4}>
            <Heading size="sm">Line Items</Heading>
            <Button size="sm" leftIcon={<FiPlus />} onClick={addItem}>
              Add Item
            </Button>
          </HStack>

          {form.items.length > 0 ? (
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Item Title</Th>
                  <Th>Description</Th>
                  <Th isNumeric>Qty</Th>
                  <Th isNumeric>Amount</Th>
                  <Th isNumeric>Total</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {form.items.map((item, idx) => (
                  <Tr key={idx}>
                    <Td>
                      <Input
                        size="sm"
                        value={item.title}
                        onChange={(e) => updateItem(idx, 'title', e.target.value)}
                        placeholder="e.g. Tuition Fee"
                      />
                    </Td>
                    <Td>
                      <Input
                        size="sm"
                        value={item.description}
                        onChange={(e) => updateItem(idx, 'description', e.target.value)}
                        placeholder="Optional"
                      />
                    </Td>
                    <Td>
                      <Input
                        size="sm"
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                      />
                    </Td>
                    <Td>
                      <Input
                        size="sm"
                        type="number"
                        min={0}
                        step="0.01"
                        value={item.amount}
                        onChange={(e) => updateItem(idx, 'amount', e.target.value)}
                      />
                    </Td>
                    <Td isNumeric>
                      <Text fontSize="sm" fontWeight="700">
                        {formatCurrency(item.total)}
                      </Text>
                    </Td>
                    <Td>
                      <IconButton
                        size="sm"
                        icon={<FiTrash2 />}
                        onClick={() => removeItem(idx)}
                        variant="ghost"
                        isDisabled={form.items.length === 1}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : null}
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
          <Box p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
            <Text fontSize="sm">Subtotal</Text>
            <Text mt={2} fontWeight="700" fontSize="lg">
              {formatCurrency(calculateSubtotal())}
            </Text>
          </Box>

          <FormControl>
            <FormLabel>Discount</FormLabel>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.discount}
              onChange={(event) => updateField('discount', event.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Tax</FormLabel>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.tax}
              onChange={(event) => updateField('tax', event.target.value)}
            />
          </FormControl>

          <Box p={4} borderRadius="xl" border="2px solid" borderColor="brand.primary" bg="brand.canvasLavender">
            <Text fontSize="sm" fontWeight="700">
              Total Amount
            </Text>
            <Text mt={2} fontWeight="700" fontSize="lg">
              {formatCurrency(calculateTotal())}
            </Text>
          </Box>
        </SimpleGrid>

        <FormControl>
          <FormLabel>Notes</FormLabel>
          <Textarea
            value={form.notes}
            onChange={(event) => updateField('notes', event.target.value)}
            placeholder="Add any additional notes or terms..."
          />
        </FormControl>

        <Button type="submit" isLoading={saving}>
          {isEdit ? 'Save changes' : 'Create invoice'}
        </Button>
      </Stack>
    </PageWrapper>
  );
}

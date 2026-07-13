import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
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
import { useNavigate, useParams } from 'react-router-dom';
import PageWrapper from '../../components/ui/PageWrapper';
import { createHoliday, fetchHoliday, updateHoliday } from '../../services/attendance';

const typeOptions = ['national', 'regional', 'company'];

export default function HolidayFormPage() {
  const navigate = useNavigate();
  const { holidayId } = useParams();
  const toast = useToast();
  const [loading, setLoading] = useState(!!holidayId);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    description: '',
    type: 'national',
    applicableFor: ['both'],
  });

  useEffect(() => {
    if (holidayId) {
      fetchHoliday(holidayId)
        .then((holiday) => {
          setFormData({
            name: holiday.name,
            date: holiday.date.split('T')[0],
            description: holiday.description,
            type: holiday.type,
            applicableFor: holiday.applicableFor,
          });
        })
        .catch((err) => toast({ title: 'Error loading holiday', description: err.message, status: 'error' }))
        .finally(() => setLoading(false));
    }
  }, [holidayId]);

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.date) {
      toast({ title: 'Please fill all required fields', status: 'error' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        date: new Date(formData.date),
        description: formData.description,
        type: formData.type,
        applicableFor: formData.applicableFor,
      };

      if (holidayId) {
        await updateHoliday(holidayId, payload);
        toast({ title: 'Holiday updated', status: 'success' });
      } else {
        const holiday = await createHoliday(payload);
        toast({ title: 'Holiday created', status: 'success' });
        navigate(`/attendance/holidays/${holiday._id}`);
      }
    } catch (error) {
      toast({ title: 'Error saving holiday', description: error.message, status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <Box>
          <Text fontSize="sm" color="gray.500">Attendance / Holidays</Text>
          <Text fontSize="2xl" fontWeight="700">
            {holidayId ? 'Edit Holiday' : 'New Holiday'}
          </Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack align="stretch" spacing={4}>
            <FormControl isRequired>
              <FormLabel>Holiday Name</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., New Year"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Date</FormLabel>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Holiday description..."
              />
            </FormControl>

            <FormControl>
              <FormLabel>Type</FormLabel>
              <Select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
              >
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Applicable For</FormLabel>
              <CheckboxGroup
                value={formData.applicableFor}
                onChange={(value) => handleChange('applicableFor', value)}
              >
                <Stack>
                  <Checkbox value="students">Students</Checkbox>
                  <Checkbox value="employees">Employees</Checkbox>
                  <Checkbox value="both">Both</Checkbox>
                </Stack>
              </CheckboxGroup>
            </FormControl>

            <HStack justify="flex-end" pt={4}>
              <Button variant="outline" onClick={() => navigate('/attendance/holidays')}>
                Cancel
              </Button>
              <Button type="submit" isLoading={saving}>
                {holidayId ? 'Update' : 'Create'} Holiday
              </Button>
            </HStack>
          </VStack>
        </form>
      </Stack>
    </PageWrapper>
  );
}

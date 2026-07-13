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
import { useNavigate, useParams } from 'react-router-dom';
import PageWrapper from '../../../components/ui/PageWrapper';
import { createDesignation, fetchDesignation, updateDesignation } from '../../../services/designations';
import { fetchDepartments } from '../../../services/departments';

const levelOptions = ['entry', 'mid', 'senior', 'lead', 'manager', 'director'];
const statusOptions = ['active', 'inactive'];

export default function DesignationFormPage() {
  const navigate = useNavigate();
  const { designationId } = useParams();
  const toast = useToast();
  const [loading, setLoading] = useState(!!designationId);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: '',
    level: 'entry',
    description: '',
    status: 'active',
  });

  useEffect(() => {
    fetchDepartments({ limit: 100 }).then((res) => setDepartments(res.data || []));

    if (designationId) {
      fetchDesignation(designationId)
        .then((desig) => {
          setFormData({
            name: desig.name,
            code: desig.code,
            department: desig.department?._id || '',
            level: desig.level,
            description: desig.description,
            status: desig.status,
          });
        })
        .catch((err) => toast({ title: 'Error loading designation', description: err.message, status: 'error' }))
        .finally(() => setLoading(false));
    }
  }, [designationId]);

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.department) {
      toast({ title: 'Please fill all required fields', status: 'error' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        department: formData.department,
        level: formData.level,
        description: formData.description,
        status: formData.status,
      };

      if (designationId) {
        await updateDesignation(designationId, payload);
        toast({ title: 'Designation updated', status: 'success' });
      } else {
        const desig = await createDesignation(payload);
        toast({ title: 'Designation created', status: 'success' });
        navigate(`/hr/designations/${desig._id}`);
      }
    } catch (error) {
      toast({ title: 'Error saving designation', description: error.message, status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <Box>
          <Text fontSize="sm" color="gray.500">HR / Designations</Text>
          <Text fontSize="2xl" fontWeight="700">
            {designationId ? 'Edit Designation' : 'New Designation'}
          </Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack align="stretch" spacing={4}>
            <FormControl isRequired>
              <FormLabel>Designation Name</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Senior Engineer"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Code</FormLabel>
              <Input
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder="e.g., SE001"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Department</FormLabel>
              <Select
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Level</FormLabel>
              <Select
                value={formData.level}
                onChange={(e) => handleChange('level', e.target.value)}
              >
                {levelOptions.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Designation description..."
              />
            </FormControl>

            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </FormControl>

            <HStack justify="flex-end" pt={4}>
              <Button variant="outline" onClick={() => navigate('/hr/designations')}>
                Cancel
              </Button>
              <Button type="submit" isLoading={saving}>
                {designationId ? 'Update' : 'Create'} Designation
              </Button>
            </HStack>
          </VStack>
        </form>
      </Stack>
    </PageWrapper>
  );
}

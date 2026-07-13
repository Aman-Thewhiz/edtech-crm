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
import { createDepartment, fetchDepartment, updateDepartment } from '../../../services/departments';
import { fetchEmployees } from '../../../services/employees';

const statusOptions = ['active', 'inactive'];

export default function DepartmentFormPage() {
  const navigate = useNavigate();
  const { departmentId } = useParams();
  const toast = useToast();
  const [loading, setLoading] = useState(!!departmentId);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    headEmployee: '',
    parentDepartment: '',
    status: 'active',
  });

  useEffect(() => {
    Promise.all([
      fetchEmployees({ limit: 100 }).then((res) => setEmployees(res.data || [])),
    ]);

    if (departmentId) {
      fetchDepartment(departmentId)
        .then((dept) => {
          setFormData({
            name: dept.name,
            code: dept.code,
            description: dept.description,
            headEmployee: dept.headEmployee?._id || '',
            parentDepartment: dept.parentDepartment?._id || '',
            status: dept.status,
          });
        })
        .catch((err) => toast({ title: 'Error loading department', description: err.message, status: 'error' }))
        .finally(() => setLoading(false));
    }
  }, [departmentId]);

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      toast({ title: 'Please fill all required fields', status: 'error' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        headEmployee: formData.headEmployee || null,
        parentDepartment: formData.parentDepartment || null,
        status: formData.status,
      };

      if (departmentId) {
        await updateDepartment(departmentId, payload);
        toast({ title: 'Department updated', status: 'success' });
      } else {
        const dept = await createDepartment(payload);
        toast({ title: 'Department created', status: 'success' });
        navigate(`/hr/departments/${dept._id}`);
      }
    } catch (error) {
      toast({ title: 'Error saving department', description: error.message, status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <Box>
          <Text fontSize="sm" color="gray.500">HR / Departments</Text>
          <Text fontSize="2xl" fontWeight="700">
            {departmentId ? 'Edit Department' : 'New Department'}
          </Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack align="stretch" spacing={4}>
            <FormControl isRequired>
              <FormLabel>Department Name</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Engineering"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Department Code</FormLabel>
              <Input
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder="e.g., ENG"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Department description..."
              />
            </FormControl>

            <FormControl>
              <FormLabel>Department Head</FormLabel>
              <Select
                value={formData.headEmployee}
                onChange={(e) => handleChange('headEmployee', e.target.value)}
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name}
                  </option>
                ))}
              </Select>
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
              <Button variant="outline" onClick={() => navigate('/hr/departments')}>
                Cancel
              </Button>
              <Button type="submit" isLoading={saving}>
                {departmentId ? 'Update' : 'Create'} Department
              </Button>
            </HStack>
          </VStack>
        </form>
      </Stack>
    </PageWrapper>
  );
}

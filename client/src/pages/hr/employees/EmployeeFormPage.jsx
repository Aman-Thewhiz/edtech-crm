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
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import PageWrapper from '../../../components/ui/PageWrapper';
import { createEmployee, fetchEmployee, updateEmployee } from '../../../services/employees';
import { fetchDepartments } from '../../../services/departments';
import { fetchDesignations } from '../../../services/designations';

const genderOptions = ['male', 'female', 'other'];
const employmentTypeOptions = ['full-time', 'part-time', 'contract', 'intern'];
const statusOptions = ['active', 'on-leave', 'resigned', 'terminated'];

export default function EmployeeFormPage() {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const toast = useToast();
  const [loading, setLoading] = useState(!!employeeId);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    department: '',
    designation: '',
    joiningDate: '',
    employmentType: 'full-time',
    status: 'active',
    bankAccountNumber: '',
    bankIFSC: '',
    bankAccountHolderName: '',
  });

  useEffect(() => {
    Promise.all([
      fetchDepartments({ limit: 100 }).then((res) => setDepartments(res.data || [])),
      fetchDesignations({ limit: 100 }).then((res) => setDesignations(res.data || [])),
    ]);

    if (employeeId) {
      fetchEmployee(employeeId)
        .then((emp) => {
          setFormData({
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            phone: emp.phone,
            dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split('T')[0] : '',
            gender: emp.gender || '',
            address: emp.address || '',
            department: emp.department?._id || '',
            designation: emp.designation?._id || '',
            joiningDate: emp.joiningDate ? emp.joiningDate.split('T')[0] : '',
            employmentType: emp.employmentType,
            status: emp.status,
            bankAccountNumber: emp.bankAccountNumber || '',
            bankIFSC: emp.bankIFSC || '',
            bankAccountHolderName: emp.bankAccountHolderName || '',
          });
        })
        .catch((err) => toast({ title: 'Error loading employee', description: err.message, status: 'error' }))
        .finally(() => setLoading(false));
    }
  }, [employeeId]);

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.department || !formData.designation) {
      toast({ title: 'Please fill all required fields', status: 'error' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        address: formData.address,
        department: formData.department,
        designation: formData.designation,
        joiningDate: new Date(formData.joiningDate),
        employmentType: formData.employmentType,
        status: formData.status,
        bankAccountNumber: formData.bankAccountNumber,
        bankIFSC: formData.bankIFSC,
        bankAccountHolderName: formData.bankAccountHolderName,
      };

      if (employeeId) {
        await updateEmployee(employeeId, payload);
        toast({ title: 'Employee updated', status: 'success' });
      } else {
        const emp = await createEmployee(payload);
        toast({ title: 'Employee created', status: 'success' });
        navigate(`/hr/employees/${emp._id}`);
      }
    } catch (error) {
      toast({ title: 'Error saving employee', description: error.message, status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <Box>
          <Text fontSize="sm" color="gray.500">HR / Employees</Text>
          <Text fontSize="2xl" fontWeight="700">
            {employeeId ? 'Edit Employee' : 'New Employee'}
          </Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack align="stretch" spacing={4}>
            <Text fontWeight="700">Personal Information</Text>

            <HStack spacing={4}>
              <FormControl isRequired flex={1}>
                <FormLabel>First Name</FormLabel>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="First name"
                />
              </FormControl>
              <FormControl isRequired flex={1}>
                <FormLabel>Last Name</FormLabel>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Last name"
                />
              </FormControl>
            </HStack>

            <HStack spacing={4}>
              <FormControl isRequired flex={1}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Email"
                />
              </FormControl>
              <FormControl isRequired flex={1}>
                <FormLabel>Phone</FormLabel>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Phone"
                />
              </FormControl>
            </HStack>

            <HStack spacing={4}>
              <FormControl flex={1}>
                <FormLabel>Date of Birth</FormLabel>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                />
              </FormControl>
              <FormControl flex={1}>
                <FormLabel>Gender</FormLabel>
                <Select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                >
                  <option value="">Select gender</option>
                  {genderOptions.map((gender) => (
                    <option key={gender} value={gender}>
                      {gender}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>Address</FormLabel>
              <Input
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Address"
              />
            </FormControl>

            <Text fontWeight="700" pt={4}>
              Job Information
            </Text>

            <HStack spacing={4}>
              <FormControl isRequired flex={1}>
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
              <FormControl isRequired flex={1}>
                <FormLabel>Designation</FormLabel>
                <Select
                  value={formData.designation}
                  onChange={(e) => handleChange('designation', e.target.value)}
                >
                  <option value="">Select designation</option>
                  {designations.map((desig) => (
                    <option key={desig._id} value={desig._id}>
                      {desig.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </HStack>

            <HStack spacing={4}>
              <FormControl isRequired flex={1}>
                <FormLabel>Joining Date</FormLabel>
                <Input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => handleChange('joiningDate', e.target.value)}
                />
              </FormControl>
              <FormControl flex={1}>
                <FormLabel>Employment Type</FormLabel>
                <Select
                  value={formData.employmentType}
                  onChange={(e) => handleChange('employmentType', e.target.value)}
                >
                  {employmentTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </HStack>

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

            <Text fontWeight="700" pt={4}>
              Bank Details
            </Text>

            <FormControl>
              <FormLabel>Account Number</FormLabel>
              <Input
                value={formData.bankAccountNumber}
                onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
                placeholder="Bank account number"
              />
            </FormControl>

            <HStack spacing={4}>
              <FormControl flex={1}>
                <FormLabel>IFSC Code</FormLabel>
                <Input
                  value={formData.bankIFSC}
                  onChange={(e) => handleChange('bankIFSC', e.target.value)}
                  placeholder="IFSC code"
                />
              </FormControl>
              <FormControl flex={1}>
                <FormLabel>Account Holder Name</FormLabel>
                <Input
                  value={formData.bankAccountHolderName}
                  onChange={(e) => handleChange('bankAccountHolderName', e.target.value)}
                  placeholder="Account holder name"
                />
              </FormControl>
            </HStack>

            <HStack justify="flex-end" pt={4}>
              <Button variant="outline" onClick={() => navigate('/hr/employees')}>
                Cancel
              </Button>
              <Button type="submit" isLoading={saving}>
                {employeeId ? 'Update' : 'Create'} Employee
              </Button>
            </HStack>
          </VStack>
        </form>
      </Stack>
    </PageWrapper>
  );
}

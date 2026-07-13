import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
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
import {
  createLeavePolicy,
  fetchLeavePolicy,
  updateLeavePolicy,
} from '../../services/leaves';

const leaveTypeOptions = ['casual', 'sick', 'earned', 'unpaid', 'maternity', 'paternity', 'bereavement'];

export default function LeavePolicyFormPage() {
  const navigate = useNavigate();
  const { policyId } = useParams();
  const toast = useToast();
  const [loading, setLoading] = useState(!!policyId);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: '',
    code: '',
    description: '',
    annualQuota: 0,
    carryForwardAllowed: false,
    carryForwardLimit: 0,
    minimumDaysPerRequest: 0.5,
    maxConsecutiveDays: null,
    requiresApproval: true,
    requiresHRApproval: false,
    isActive: true,
  });

  useEffect(() => {
    if (policyId) {
      fetchLeavePolicy(policyId)
        .then((policy) => {
          setFormData({
            leaveType: policy.leaveType,
            code: policy.code,
            description: policy.description,
            annualQuota: policy.annualQuota,
            carryForwardAllowed: policy.carryForwardAllowed,
            carryForwardLimit: policy.carryForwardLimit,
            minimumDaysPerRequest: policy.minimumDaysPerRequest,
            maxConsecutiveDays: policy.maxConsecutiveDays,
            requiresApproval: policy.requiresApproval,
            requiresHRApproval: policy.requiresHRApproval,
            isActive: policy.isActive,
          });
        })
        .catch((err) => toast({ title: 'Error loading policy', description: err.message, status: 'error' }))
        .finally(() => setLoading(false));
    }
  }, [policyId]);

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.leaveType || !formData.code || !formData.annualQuota) {
      toast({ title: 'Please fill all required fields', status: 'error' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        leaveType: formData.leaveType,
        code: formData.code.toUpperCase(),
        description: formData.description,
        annualQuota: parseInt(formData.annualQuota),
        carryForwardAllowed: formData.carryForwardAllowed,
        carryForwardLimit: parseInt(formData.carryForwardLimit),
        minimumDaysPerRequest: parseFloat(formData.minimumDaysPerRequest),
        maxConsecutiveDays: formData.maxConsecutiveDays ? parseInt(formData.maxConsecutiveDays) : null,
        requiresApproval: formData.requiresApproval,
        requiresHRApproval: formData.requiresHRApproval,
        isActive: formData.isActive,
      };

      if (policyId) {
        await updateLeavePolicy(policyId, payload);
        toast({ title: 'Policy updated', status: 'success' });
      } else {
        const policy = await createLeavePolicy(payload);
        toast({ title: 'Policy created', status: 'success' });
        navigate(`/leaves/policies/${policy._id}`);
      }
    } catch (error) {
      toast({ title: 'Error saving policy', description: error.message, status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageWrapper><Text>Loading...</Text></PageWrapper>;

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <Box>
          <Text fontSize="sm" color="gray.500">Leave Management / Policies</Text>
          <Text fontSize="2xl" fontWeight="700">
            {policyId ? 'Edit Leave Policy' : 'New Leave Policy'}
          </Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack align="stretch" spacing={4}>
            <FormControl isRequired>
              <FormLabel>Leave Type</FormLabel>
              <Select
                value={formData.leaveType}
                onChange={(e) => handleChange('leaveType', e.target.value)}
              >
                <option value="">Select leave type</option>
                {leaveTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Code</FormLabel>
              <Input
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                placeholder="e.g., CL, SL, EL"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Policy description..."
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Annual Quota (days)</FormLabel>
              <Input
                type="number"
                value={formData.annualQuota}
                onChange={(e) => handleChange('annualQuota', e.target.value)}
                min="0"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Minimum Days Per Request</FormLabel>
              <Input
                type="number"
                value={formData.minimumDaysPerRequest}
                onChange={(e) => handleChange('minimumDaysPerRequest', e.target.value)}
                min="0.5"
                step="0.5"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Maximum Consecutive Days</FormLabel>
              <Input
                type="number"
                value={formData.maxConsecutiveDays || ''}
                onChange={(e) => handleChange('maxConsecutiveDays', e.target.value)}
                min="1"
                placeholder="Leave empty for unlimited"
              />
            </FormControl>

            <FormControl>
              <Checkbox
                isChecked={formData.carryForwardAllowed}
                onChange={(e) => handleChange('carryForwardAllowed', e.target.checked)}
              >
                Allow Carry Forward
              </Checkbox>
            </FormControl>

            {formData.carryForwardAllowed && (
              <FormControl>
                <FormLabel>Carry Forward Limit (days)</FormLabel>
                <Input
                  type="number"
                  value={formData.carryForwardLimit}
                  onChange={(e) => handleChange('carryForwardLimit', e.target.value)}
                  min="0"
                />
              </FormControl>
            )}

            <FormControl>
              <Checkbox
                isChecked={formData.requiresApproval}
                onChange={(e) => handleChange('requiresApproval', e.target.checked)}
              >
                Requires Manager Approval
              </Checkbox>
            </FormControl>

            <FormControl>
              <Checkbox
                isChecked={formData.requiresHRApproval}
                onChange={(e) => handleChange('requiresHRApproval', e.target.checked)}
              >
                Requires HR Approval
              </Checkbox>
            </FormControl>

            <FormControl>
              <Checkbox
                isChecked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
              >
                Active
              </Checkbox>
            </FormControl>

            <HStack justify="flex-end" pt={4}>
              <Button variant="outline" onClick={() => navigate('/leaves/policies')}>
                Cancel
              </Button>
              <Button type="submit" isLoading={saving}>
                {policyId ? 'Update' : 'Create'} Policy
              </Button>
            </HStack>
          </VStack>
        </form>
      </Stack>
    </PageWrapper>
  );
}

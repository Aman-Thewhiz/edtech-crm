import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Stack,
  Text,
  Textarea,
  useToast,
  VStack,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import PageWrapper from '../../components/ui/PageWrapper';
import {
  fetchLeaveRequest,
  approveLeaveRequest,
  cancelLeaveRequest,
} from '../../services/leaves';

const statusColors = {
  applied: 'blue',
  pending: 'yellow',
  approved: 'green',
  rejected: 'red',
  cancelled: 'gray',
};

const approvalStatusColors = {
  pending: 'yellow',
  approved: 'green',
  rejected: 'red',
};

export default function LeaveRequestDetailPage() {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    loadRequest();
  }, [requestId]);

  const loadRequest = async () => {
    try {
      const data = await fetchLeaveRequest(requestId);
      setRequest(data);
    } catch (error) {
      toast({ title: 'Error loading request', description: error.message, status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalType) => {
    setApproving(true);
    try {
      const payload = {
        approvalType,
        status: 'approved',
        remarks: approvalRemarks,
      };
      await approveLeaveRequest(requestId, payload);
      toast({ title: 'Leave request approved', status: 'success' });
      setApprovalRemarks('');
      loadRequest();
    } catch (error) {
      toast({ title: 'Error approving request', description: error.message, status: 'error' });
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (approvalType) => {
    setApproving(true);
    try {
      const payload = {
        approvalType,
        status: 'rejected',
        remarks: approvalRemarks,
      };
      await approveLeaveRequest(requestId, payload);
      toast({ title: 'Leave request rejected', status: 'success' });
      setApprovalRemarks('');
      loadRequest();
    } catch (error) {
      toast({ title: 'Error rejecting request', description: error.message, status: 'error' });
    } finally {
      setApproving(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
    try {
      await cancelLeaveRequest(requestId, { reason: 'Cancelled by employee' });
      toast({ title: 'Request cancelled', status: 'success' });
      navigate('/leaves/requests');
    } catch (error) {
      toast({ title: 'Error cancelling request', description: error.message, status: 'error' });
    }
  };

  if (loading) return <PageWrapper><Text>Loading...</Text></PageWrapper>;
  if (!request) return <PageWrapper><Text>Request not found</Text></PageWrapper>;

  return (
    <PageWrapper>
      <Stack spacing={6}>
        <Box>
          <Text fontSize="sm" color="gray.500">Leave Management / Requests</Text>
          <HStack justify="space-between">
            <Text fontSize="2xl" fontWeight="700">Leave Request Details</Text>
            <Badge colorScheme={statusColors[request.status] || 'gray'}>
              {request.status.toUpperCase()}
            </Badge>
          </HStack>
        </Box>

        {/* Request Information */}
        <Box p={6} bg="white" borderRadius="lg" borderWidth="1px">
          <Text fontSize="lg" fontWeight="600" mb={4}>Request Information</Text>
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
              <Text color="gray.600">Employee:</Text>
              <Text fontWeight="600">{request.employee?.name || 'N/A'}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.600">Leave Type:</Text>
              <Text fontWeight="600">{request.leavePolicy?.leaveType || 'N/A'}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.600">Start Date:</Text>
              <Text>{new Date(request.startDate).toLocaleDateString()}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.600">End Date:</Text>
              <Text>{new Date(request.endDate).toLocaleDateString()}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.600">Number of Days:</Text>
              <Text fontWeight="600">{request.numberOfDays}</Text>
            </HStack>
            <Divider />
            <Box>
              <Text color="gray.600" mb={2}>Reason:</Text>
              <Text>{request.reason}</Text>
            </Box>
            {request.notes && (
              <Box>
                <Text color="gray.600" mb={2}>Notes:</Text>
                <Text>{request.notes}</Text>
              </Box>
            )}
          </VStack>
        </Box>

        {/* Manager Approval */}
        <Box p={6} bg="white" borderRadius="lg" borderWidth="1px">
          <HStack justify="space-between" mb={4}>
            <Text fontSize="lg" fontWeight="600">Manager Approval</Text>
            <Badge colorScheme={approvalStatusColors[request.managerApproval?.status] || 'gray'}>
              {request.managerApproval?.status?.toUpperCase() || 'PENDING'}
            </Badge>
          </HStack>
          <VStack align="stretch" spacing={3}>
            {request.managerApproval?.approvedBy && (
              <>
                <HStack justify="space-between">
                  <Text color="gray.600">Approved By:</Text>
                  <Text>{request.managerApproval.approvedBy?.email || 'N/A'}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.600">Approved At:</Text>
                  <Text>{new Date(request.managerApproval.approvedAt).toLocaleString()}</Text>
                </HStack>
                {request.managerApproval.remarks && (
                  <Box>
                    <Text color="gray.600" mb={2}>Remarks:</Text>
                    <Text>{request.managerApproval.remarks}</Text>
                  </Box>
                )}
              </>
            )}
            {request.managerApproval?.status === 'pending' && (
              <VStack align="stretch" spacing={3} pt={4}>
                <FormControl>
                  <FormLabel>Approval Remarks</FormLabel>
                  <Textarea
                    value={approvalRemarks}
                    onChange={(e) => setApprovalRemarks(e.target.value)}
                    placeholder="Enter your remarks..."
                  />
                </FormControl>
                <HStack justify="flex-end" spacing={2}>
                  <Button
                    colorScheme="green"
                    isLoading={approving}
                    onClick={() => handleApprove('manager')}
                  >
                    Approve
                  </Button>
                  <Button
                    colorScheme="red"
                    variant="outline"
                    isLoading={approving}
                    onClick={() => handleReject('manager')}
                  >
                    Reject
                  </Button>
                </HStack>
              </VStack>
            )}
          </VStack>
        </Box>

        {/* HR Approval (if required) */}
        {request.leavePolicy?.requiresHRApproval && (
          <Box p={6} bg="white" borderRadius="lg" borderWidth="1px">
            <HStack justify="space-between" mb={4}>
              <Text fontSize="lg" fontWeight="600">HR Approval</Text>
              <Badge colorScheme={approvalStatusColors[request.hrApproval?.status] || 'gray'}>
                {request.hrApproval?.status?.toUpperCase() || 'PENDING'}
              </Badge>
            </HStack>
            <VStack align="stretch" spacing={3}>
              {request.hrApproval?.approvedBy && (
                <>
                  <HStack justify="space-between">
                    <Text color="gray.600">Approved By:</Text>
                    <Text>{request.hrApproval.approvedBy?.email || 'N/A'}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.600">Approved At:</Text>
                    <Text>{new Date(request.hrApproval.approvedAt).toLocaleString()}</Text>
                  </HStack>
                  {request.hrApproval.remarks && (
                    <Box>
                      <Text color="gray.600" mb={2}>Remarks:</Text>
                      <Text>{request.hrApproval.remarks}</Text>
                    </Box>
                  )}
                </>
              )}
              {request.hrApproval?.status === 'pending' && (
                <VStack align="stretch" spacing={3} pt={4}>
                  <FormControl>
                    <FormLabel>Approval Remarks</FormLabel>
                    <Textarea
                      value={approvalRemarks}
                      onChange={(e) => setApprovalRemarks(e.target.value)}
                      placeholder="Enter your remarks..."
                    />
                  </FormControl>
                  <HStack justify="flex-end" spacing={2}>
                    <Button
                      colorScheme="green"
                      isLoading={approving}
                      onClick={() => handleApprove('hr')}
                    >
                      Approve
                    </Button>
                    <Button
                      colorScheme="red"
                      variant="outline"
                      isLoading={approving}
                      onClick={() => handleReject('hr')}
                    >
                      Reject
                    </Button>
                  </HStack>
                </VStack>
              )}
            </VStack>
          </Box>
        )}

        {/* Actions */}
        <HStack justify="flex-end" spacing={2}>
          {request.status === 'applied' && (
            <Button colorScheme="red" variant="outline" onClick={handleCancel}>
              Cancel Request
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate('/leaves/requests')}>
            Back to Requests
          </Button>
        </HStack>
      </Stack>
    </PageWrapper>
  );
}

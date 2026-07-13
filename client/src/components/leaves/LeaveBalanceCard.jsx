import {
  Box,
  HStack,
  VStack,
  Text,
  Progress,
  Badge,
} from '@chakra-ui/react';

export default function LeaveBalanceCard({ balance }) {
  if (!balance) {
    return (
      <Box p={4} bg="gray.50" borderRadius="md" borderWidth="1px">
        <Text color="gray.500">No leave balance data available</Text>
      </Box>
    );
  }

  const usagePercentage = (balance.usedDays / balance.totalAvailable) * 100;
  const availablePercentage = (balance.balanceDays / balance.totalAvailable) * 100;

  return (
    <Box p={6} bg="white" borderRadius="lg" borderWidth="1px" borderColor="gray.200">
      <VStack align="stretch" spacing={4}>
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Text fontSize="lg" fontWeight="600">
              {balance.leavePolicy?.leaveType || 'Leave'}
            </Text>
            <Text fontSize="sm" color="gray.600">
              Financial Year: {balance.financialYear}
            </Text>
          </VStack>
          <Badge colorScheme="blue" fontSize="md" px={3} py={2}>
            {balance.balanceDays} days available
          </Badge>
        </HStack>

        {/* Balance Breakdown */}
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Total Available:</Text>
            <Text fontWeight="600">{balance.totalAvailable} days</Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Used:</Text>
            <HStack>
              <Text fontWeight="600">{balance.usedDays} days</Text>
              <Text fontSize="xs" color="gray.500">
                ({(usagePercentage).toFixed(1)}%)
              </Text>
            </HStack>
          </HStack>

          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Pending Approval:</Text>
            <Text fontWeight="600">{balance.pendingDays} days</Text>
          </HStack>

          <HStack justify="space-between">
            <Text fontSize="sm" color="gray.600">Balance:</Text>
            <HStack>
              <Text fontWeight="600" color="green.600">
                {balance.balanceDays} days
              </Text>
              <Text fontSize="xs" color="gray.500">
                ({(availablePercentage).toFixed(1)}%)
              </Text>
            </HStack>
          </HStack>
        </VStack>

        {/* Progress Bar */}
        <VStack align="stretch" spacing={2}>
          <HStack spacing={2}>
            <Box flex={usagePercentage} bg="red.300" h="8px" borderRadius="sm" />
            <Box flex={balance.pendingDays / balance.totalAvailable * 100} bg="yellow.300" h="8px" borderRadius="sm" />
            <Box flex={availablePercentage} bg="green.300" h="8px" borderRadius="sm" />
          </HStack>
          <HStack spacing={4} fontSize="xs">
            <HStack spacing={1}>
              <Box w="3" h="3" bg="red.300" borderRadius="sm" />
              <Text>Used</Text>
            </HStack>
            <HStack spacing={1}>
              <Box w="3" h="3" bg="yellow.300" borderRadius="sm" />
              <Text>Pending</Text>
            </HStack>
            <HStack spacing={1}>
              <Box w="3" h="3" bg="green.300" borderRadius="sm" />
              <Text>Available</Text>
            </HStack>
          </HStack>
        </VStack>

        {/* Additional Info */}
        {balance.carryForwardDays > 0 && (
          <Box p={3} bg="blue.50" borderRadius="md">
            <Text fontSize="sm" color="blue.900">
              <strong>Carried Forward:</strong> {balance.carryForwardDays} days
            </Text>
          </Box>
        )}

        {balance.lapsedDays > 0 && (
          <Box p={3} bg="orange.50" borderRadius="md">
            <Text fontSize="sm" color="orange.900">
              <strong>Lapsed:</strong> {balance.lapsedDays} days
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}

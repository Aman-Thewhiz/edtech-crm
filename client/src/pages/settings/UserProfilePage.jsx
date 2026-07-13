import {
  Box,
  VStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Avatar,
  HStack,
  Divider,
  SimpleGrid,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import PageWrapper from '../../components/ui/PageWrapper';
import { useAuth } from '../../contexts/AuthContext';
import * as authService from '../../services/api'; // Using api directly as auth service is not separate

export default function UserProfilePage() {
  const { user } = useAuth();
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const updatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 3000,
      });
    }

    setSaving(true);
    try {
      await authService.default.patch('/auth/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      toast({
        title: 'Password updated successfully',
        status: 'success',
        duration: 3000,
      });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast({
        title: 'Error updating password',
        description: error.response?.data?.error || 'Failed to change password',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper>
      <VStack spacing={6} align="stretch">
        <Breadcrumb fontSize="sm" color="brand.ink-mute">
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <Text>My Profile</Text>
          </BreadcrumbItem>
        </Breadcrumb>

        <Heading size="lg">My Profile</Heading>

        <Box bg="white" p={6} borderRadius="xl" border="1px solid" borderColor="brand.hairline" shadow="sm">
          <HStack spacing={6} mb={8}>
            <Avatar size="2xl" name={user?.name} bg="brand.primary" color="white" />
            <VStack align="start" spacing={1}>
              <Heading size="md">{user?.name}</Heading>
              <Text color="brand.ink-mute">{user?.email}</Text>
              <Badge colorScheme="purple" borderRadius="full" px={2} mt={1}>
                {user?.role?.replace('_', ' ')}
              </Badge>
            </VStack>
          </HStack>

          <Divider mb={8} />

          <Box maxW="500px">
            <Heading size="md" mb={6}>Change Password</Heading>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Old Password</FormLabel>
                <Input
                  type="password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>New Password</FormLabel>
                <Input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Confirm New Password</FormLabel>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                />
              </FormControl>
              <Button
                colorScheme="purple"
                bg="brand.primary"
                borderRadius="full"
                w="full"
                mt={4}
                onClick={updatePassword}
                isLoading={saving}
              >
                Update Password
              </Button>
            </VStack>
          </Box>
        </Box>
        
        <Box mt={4}>
          <Button as={RouterLink} to="/settings/notifications" variant="outline" borderRadius="full">
            Manage Notification Preferences
          </Button>
        </Box>
      </VStack>
    </PageWrapper>
  );
}

function Badge({ children, ...props }) {
  return (
    <Box
      as="span"
      px={2}
      py={1}
      fontSize="xs"
      fontWeight="bold"
      textTransform="uppercase"
      {...props}
    >
      {children}
    </Box>
  );
}

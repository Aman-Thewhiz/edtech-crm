import {
  Box,
  VStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Switch,
  Button,
  useToast,
  Divider,
  SimpleGrid,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import PageWrapper from '../../components/ui/PageWrapper';
import * as notificationService from '../../services/notifications';

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const data = await notificationService.getPreferences();
        setPreferences(data);
      } catch (error) {
        toast({
          title: 'Error fetching preferences',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPrefs();
  }, [toast]);

  const handleToggle = (category, field) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: !prev[category][field],
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await notificationService.updatePreferences(preferences);
      toast({
        title: 'Preferences updated',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error updating preferences',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <Center py={20}>
          <Spinner color="brand.primary" size="xl" />
        </Center>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <VStack spacing={6} align="stretch">
        <Breadcrumb fontSize="sm" color="brand.ink-mute">
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/dashboard">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/settings">
              Settings
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <Text>Notification Preferences</Text>
          </BreadcrumbItem>
        </Breadcrumb>

        <HStack justify="space-between">
          <VStack align="start" spacing={0}>
            <Heading size="lg">Notification Preferences</Heading>
            <Text color="brand.ink-mute">
              Control how and when you want to be notified.
            </Text>
          </VStack>
          <Button
            colorScheme="purple"
            bg="brand.primary"
            borderRadius="full"
            onClick={handleSave}
            isLoading={saving}
          >
            Save Changes
          </Button>
        </HStack>

        <Box bg="white" p={6} borderRadius="xl" border="1px solid" borderColor="brand.hairline" shadow="sm">
          <VStack align="stretch" spacing={6}>
            <Box>
              <Heading size="md" mb={4}>In-App Notifications</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel mb="0">Enable In-App Notifications</FormLabel>
                  <Switch
                    colorScheme="purple"
                    isChecked={preferences.inAppNotifications.enabled}
                    onChange={() => handleToggle('inAppNotifications', 'enabled')}
                  />
                </FormControl>
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel mb="0">Lead Assignments</FormLabel>
                  <Switch
                    colorScheme="purple"
                    isChecked={preferences.inAppNotifications.leadAssigned}
                    onChange={() => handleToggle('inAppNotifications', 'leadAssigned')}
                  />
                </FormControl>
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel mb="0">Follow-up Reminders</FormLabel>
                  <Switch
                    colorScheme="purple"
                    isChecked={preferences.inAppNotifications.followUpDue}
                    onChange={() => handleToggle('inAppNotifications', 'followUpDue')}
                  />
                </FormControl>
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel mb="0">Admission Status Changes</FormLabel>
                  <Switch
                    colorScheme="purple"
                    isChecked={preferences.inAppNotifications.admissionStatusChanged}
                    onChange={() => handleToggle('inAppNotifications', 'admissionStatusChanged')}
                  />
                </FormControl>
              </SimpleGrid>
            </Box>

            <Divider />

            <Box>
              <Heading size="md" mb={2}>Email Notifications</Heading>
              <Text color="brand.ink-mute" mb={4} fontSize="sm">
                (Note: Email delivery is currently disabled as per project requirements)
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel mb="0">Enable Email Notifications</FormLabel>
                  <Switch
                    colorScheme="purple"
                    isChecked={preferences.emailNotifications.enabled}
                    onChange={() => handleToggle('emailNotifications', 'enabled')}
                    isDisabled
                  />
                </FormControl>
              </SimpleGrid>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </PageWrapper>
  );
}

function HStack({ children, ...props }) {
  return (
    <Box display="flex" flexDirection="row" {...props}>
      {children}
    </Box>
  );
}

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
  SimpleGrid,
  Select,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Divider,
  HStack,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import PageWrapper from '../../components/ui/PageWrapper';
import * as settingsService from '../../services/settings';

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.getSettings();
        setSettings(data);
      } catch (error) {
        toast({
          title: 'Error fetching settings',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setSettings((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.updateSettings(settings);
      toast({
        title: 'Settings updated successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error updating settings',
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
          <BreadcrumbItem isCurrentPage>
            <Text>Settings</Text>
          </BreadcrumbItem>
        </Breadcrumb>

        <HStack justify="space-between">
          <VStack align="start" spacing={0}>
            <Heading size="lg">Institute Settings</Heading>
            <Text color="brand.ink-mute">Manage your institute's global configuration.</Text>
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
          <VStack spacing={8} align="stretch">
            <Box>
              <Heading size="md" mb={4}>General Information</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl isRequired>
                  <FormLabel>Institute Name</FormLabel>
                  <Input
                    name="instituteName"
                    value={settings.instituteName}
                    onChange={handleChange}
                    placeholder="Enter institute name"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Logo URL</FormLabel>
                  <Input
                    name="logoUrl"
                    value={settings.logoUrl || ''}
                    onChange={handleChange}
                    placeholder="https://example.com/logo.png"
                  />
                </FormControl>
              </SimpleGrid>
            </Box>

            <Divider />

            <Box>
              <Heading size="md" mb={4}>Address Details</Heading>
              <VStack spacing={6} align="stretch">
                <FormControl>
                  <FormLabel>Street Address</FormLabel>
                  <Input
                    name="address.street"
                    value={settings.address?.street || ''}
                    onChange={handleChange}
                    placeholder="123 Main St"
                  />
                </FormControl>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <FormControl>
                    <FormLabel>City</FormLabel>
                    <Input
                      name="address.city"
                      value={settings.address?.city || ''}
                      onChange={handleChange}
                      placeholder="City"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>State</FormLabel>
                    <Input
                      name="address.state"
                      value={settings.address?.state || ''}
                      onChange={handleChange}
                      placeholder="State"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Zip Code</FormLabel>
                    <Input
                      name="address.zipCode"
                      value={settings.address?.zipCode || ''}
                      onChange={handleChange}
                      placeholder="Zip Code"
                    />
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </Box>

            <Divider />

            <Box>
              <Heading size="md" mb={4}>Regional & Academic</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl>
                  <FormLabel>Currency Code</FormLabel>
                  <Input
                    name="currency.code"
                    value={settings.currency?.code || 'INR'}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Timezone</FormLabel>
                  <Select
                    name="timezone"
                    value={settings.timezone || 'Asia/Kolkata'}
                    onChange={handleChange}
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
            </Box>
          </VStack>
        </Box>
        
        <Box mt={4}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Button as={RouterLink} to="/settings/notifications" variant="outline" borderRadius="full">
              Notification Preferences
            </Button>
            <Button as={RouterLink} to="/settings/users" variant="outline" borderRadius="full">
              User Management
            </Button>
            <Button as={RouterLink} to="/settings/audit-logs" variant="outline" borderRadius="full">
              Audit Logs
            </Button>
          </SimpleGrid>
        </Box>
      </VStack>
    </PageWrapper>
  );
}

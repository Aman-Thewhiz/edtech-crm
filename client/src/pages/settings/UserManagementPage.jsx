import {
  Box,
  VStack,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Button,
  useToast,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Switch,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import PageWrapper from '../../components/ui/PageWrapper';
import * as userService from '../../services/users';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.listUsers({ q: search, role: roleFilter });
      setUsers(response.data);
    } catch (error) {
      toast({
        title: 'Error fetching users',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleEdit = (user) => {
    setSelectedUser(user);
    onOpen();
  };

  const handleUpdate = async () => {
    try {
      await userService.updateUser(selectedUser._id, selectedUser);
      toast({
        title: 'User updated successfully',
        status: 'success',
        duration: 3000,
      });
      onClose();
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error updating user',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await userService.deleteUser(id);
        toast({
          title: 'User deactivated',
          status: 'success',
          duration: 3000,
        });
        fetchUsers();
      } catch (error) {
        toast({
          title: 'Error deactivating user',
          status: 'error',
          duration: 3000,
        });
      }
    }
  };

  return (
    <PageWrapper>
      <VStack spacing={6} align="stretch">
        <Breadcrumb fontSize="sm" color="brand.ink-mute">
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/settings">Settings</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <Text>User Management</Text>
          </BreadcrumbItem>
        </Breadcrumb>

        <HStack justify="space-between">
          <VStack align="start" spacing={0}>
            <Heading size="lg">User Management</Heading>
            <Text color="brand.ink-mute">Manage system users and their roles.</Text>
          </VStack>
        </HStack>

        <Box bg="white" p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline" shadow="sm">
          <HStack spacing={4} mb={6}>
            <InputGroup maxW="400px">
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
            <Select
              maxW="200px"
              placeholder="All Roles"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="hr_manager">HR Manager</option>
              <option value="sales_manager">Sales Manager</option>
              <option value="counsellor">Counsellor</option>
              <option value="finance">Finance</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </Select>
          </HStack>

          {loading ? (
            <Center py={10}>
              <Spinner color="brand.primary" />
            </Center>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((user) => (
                  <Tr key={user._id}>
                    <Td fontWeight="medium">{user.name}</Td>
                    <Td>{user.email}</Td>
                    <Td>
                      <Badge colorScheme="purple" borderRadius="full" px={2}>
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme={user.isActive ? 'green' : 'red'} borderRadius="full" px={2}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          icon={<FiEdit2 />}
                          aria-label="Edit user"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(user)}
                        />
                        <IconButton
                          icon={<FiTrash2 />}
                          aria-label="Deactivate user"
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDelete(user._id)}
                          isDisabled={!user.isActive}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUser && (
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={selectedUser.name}
                    onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Role</FormLabel>
                  <Select
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                  >
                    <option value="admin">Admin</option>
                    <option value="hr_manager">HR Manager</option>
                    <option value="sales_manager">Sales Manager</option>
                    <option value="counsellor">Counsellor</option>
                    <option value="finance">Finance</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                  </Select>
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Is Active</FormLabel>
                  <Switch
                    colorScheme="purple"
                    isChecked={selectedUser.isActive}
                    onChange={(e) => setSelectedUser({ ...selectedUser, isActive: e.target.checked })}
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="purple" bg="brand.primary" onClick={handleUpdate}>Update</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageWrapper>
  );
}

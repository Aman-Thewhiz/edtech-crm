import { Box, Flex, useBreakpointValue, useDisclosure } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppShell() {
  const sidebarCollapsed = useBreakpointValue({ base: true, md: true, lg: false });
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex minH="100vh" bg="brand.canvas">
      <Sidebar collapsed={sidebarCollapsed} isOpen={isOpen} onClose={onClose} />
      <Box flex="1" ml={{ base: 0, md: sidebarCollapsed ? '88px' : '280px' }}>
        <Header onOpenSidebar={onOpen} />
        <Box as="main" p={{ base: 4, md: 6 }}>
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
}
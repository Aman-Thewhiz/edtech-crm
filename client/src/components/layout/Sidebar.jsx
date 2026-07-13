import { Box, Drawer, DrawerBody, DrawerContent, DrawerOverlay, HStack, Icon, Text, VStack, Link } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { FiBarChart2, FiBookOpen, FiCheckSquare, FiFileText, FiGrid, FiHeadphones, FiHome, FiLayers, FiUsers, FiCalendar, FiDollarSign } from 'react-icons/fi';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/leads', label: 'Leads', icon: FiUsers },
  { to: '/courses', label: 'Courses', icon: FiBookOpen },
  { to: '/students', label: 'Students', icon: FiHome },
  { to: '/admissions', label: 'Admissions', icon: FiFileText },
  { to: '/invoices', label: 'Invoices', icon: FiLayers },
  { to: '/payments', label: 'Payments', icon: FiLayers },
  { to: '/hr/employees', label: 'HR', icon: FiUsers },
  { to: '/attendance', label: 'Attendance', icon: FiCheckSquare },
  { to: '/leaves/requests', label: 'Leaves', icon: FiCalendar },
  { to: '/payroll/payroll', label: 'Payroll', icon: FiDollarSign },
  { to: '/reports', label: 'Reports', icon: FiBarChart2 },
  { to: '/settings', label: 'Settings', icon: FiHeadphones },
];

function SidebarContent({ collapsed }) {
  return (
    <VStack align="stretch" spacing={3}>
      <Text fontSize="lg" fontWeight="700" px={2}>
        {collapsed ? 'EF' : 'EduFlow CRM'}
      </Text>
      {links.map((link) => (
        <Link
          key={link.to}
          as={NavLink}
          to={link.to}
          px={3}
          py={2}
          borderRadius="full"
          _activeLink={{ bg: 'brand.primaryPress' }}
        >
          <HStack spacing={collapsed ? 0 : 3} justify={collapsed ? 'center' : 'flex-start'}>
            <Icon as={link.icon} boxSize={4} />
            {!collapsed && <Text>{link.label}</Text>}
          </HStack>
        </Link>
      ))}
    </VStack>
  );
}

export default function Sidebar({ collapsed, isOpen, onClose }) {
  return (
    <>
      <Box
        as="aside"
        w={{ md: collapsed ? '88px' : '280px' }}
        pos="fixed"
        insetY="0"
        left="0"
        bg="brand.primary"
        color="brand.onPrimary"
        px={4}
        py={6}
        overflow="hidden"
        display={{ base: 'none', md: 'block' }}
      >
        <SidebarContent collapsed={collapsed} />
      </Box>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="brand.primary" color="brand.onPrimary">
          <DrawerBody py={6}>
            <SidebarContent collapsed={false} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
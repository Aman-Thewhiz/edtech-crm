import { Link as RouterLink } from "react-router-dom";

import {
  Flex,
  Heading,
  Button,
  IconButton,
  useBreakpointValue,
  Box,
  useDisclosure,
} from '@chakra-ui/react';
import { FiMenu, FiBell } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationDrawer from './NotificationDrawer';

export default function Header({ onOpenSidebar }) {
  const { logout, user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const showMenuButton = useBreakpointValue({ base: true, md: true, lg: false });

  return (
    <>
      <Flex as="header" align="center" justify="space-between" px={6} py={4} borderBottom="1px solid" borderColor="brand.hairline" bg="brand.canvas">
        <Flex align="center" gap={3}>
          {showMenuButton ? <IconButton aria-label="Open navigation" icon={<FiMenu />} onClick={onOpenSidebar} variant="outline" /> : null}
          <Heading size="md">Dashboard</Heading>
        </Flex>
        <Flex align="center" gap={3}>
          <Box position="relative">
            <IconButton
              aria-label="Notifications"
              icon={<FiBell />}
              variant="ghost"
              fontSize="xl"
              onClick={onOpen}
            />
            {unreadCount > 0 && (
              <Box
                position="absolute"
                top="2px"
                right="2px"
                bg="brand.semantic-error"
                color="white"
                borderRadius="full"
                minW="18px"
                h="18px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="10px"
                fontWeight="bold"
                border="2px solid"
                borderColor="brand.canvas"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Box>
            )}
          </Box>
          <Button as={RouterLink} to="/profile" variant="outline">{user?.name || 'Profile'}</Button>
          <Button onClick={logout}>Logout</Button>
        </Flex>
      </Flex>

      <NotificationDrawer
        isOpen={isOpen}
        onClose={onClose}
        notifications={notifications}
        unreadCount={unreadCount}
        loading={loading}
        onMarkRead={markAsRead}
        onMarkAllRead={markAllAsRead}
        onDelete={deleteNotification}
      />
    </>
  );
}
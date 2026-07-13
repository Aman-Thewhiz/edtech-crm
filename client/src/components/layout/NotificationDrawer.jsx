import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Text,
  Box,
  HStack,
  Badge,
  IconButton,
  Button,
  Divider,
  Spinner,
  Center,
  Link,
} from '@chakra-ui/react';
import { FiTrash2, FiCheckCircle, FiBell } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';

const NotificationItem = ({ notification, onMarkRead, onDelete }) => {
  const getIcon = (type) => {
    return <FiBell color="#4a154b" />;
  };

  return (
    <Box
      p={4}
      w="full"
      bg={notification.isRead ? 'transparent' : 'brand.canvas-lavender'}
      borderRadius="md"
      borderWidth="1px"
      borderColor="brand.hairline"
      position="relative"
      transition="all 0.2s"
      _hover={{ shadow: 'sm' }}
    >
      <HStack align="start" spacing={3}>
        <Center p={2} bg="white" borderRadius="full" shadow="xs">
          {getIcon(notification.type)}
        </Center>
        <VStack align="start" spacing={1} flex={1}>
          <HStack w="full" justify="space-between">
            <Text fontWeight="bold" fontSize="sm" color="brand.ink">
              {notification.title}
            </Text>
            {!notification.isRead && (
              <Badge colorScheme="purple" borderRadius="full" fontSize="xs">
                New
              </Badge>
            )}
          </HStack>
          <Text fontSize="sm" color="brand.ink-mute" noOfLines={2}>
            {notification.message}
          </Text>
          <HStack w="full" justify="space-between" mt={2}>
            <Text fontSize="xs" color="brand.ink-mute">
              {new Date(notification.createdAt).toLocaleString()}
            </Text>
            {notification.actionUrl && (
              <Link
                as={RouterLink}
                to={notification.actionUrl}
                fontSize="xs"
                color="brand.link-blue"
                fontWeight="bold"
              >
                View Details
              </Link>
            )}
          </HStack>
        </VStack>
      </HStack>
      <HStack position="absolute" top={2} right={2} spacing={1} opacity={0} _groupHover={{ opacity: 1 }}>
        {!notification.isRead && (
          <IconButton
            size="xs"
            icon={<FiCheckCircle />}
            aria-label="Mark as read"
            onClick={() => onMarkRead(notification._id)}
            variant="ghost"
          />
        )}
        <IconButton
          size="xs"
          icon={<FiTrash2 />}
          aria-label="Delete"
          onClick={() => onDelete(notification._id)}
          variant="ghost"
          colorScheme="red"
        />
      </HStack>
    </Box>
  );
};

export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  loading,
  onMarkRead,
  onMarkAllRead,
  onDelete,
}) {
  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" borderColor="brand.hairline">
          <HStack justify="space-between" pr={8}>
            <HStack>
              <Text>Notifications</Text>
              {unreadCount > 0 && (
                <Badge borderRadius="full" px={2} colorScheme="purple">
                  {unreadCount}
                </Badge>
              )}
            </HStack>
            {unreadCount > 0 && (
              <Button size="xs" variant="ghost" onClick={onMarkAllRead} color="brand.link-blue">
                Mark all as read
              </Button>
            )}
          </HStack>
        </DrawerHeader>

        <DrawerBody p={0}>
          {loading && notifications.length === 0 ? (
            <Center h="full">
              <Spinner color="brand.primary" />
            </Center>
          ) : notifications.length === 0 ? (
            <Center h="full" flexDirection="column" p={8} textAlign="center">
              <FiBell size={48} color="#e6e6e6" />
              <Text mt={4} color="brand.ink-mute">
                No notifications yet.
              </Text>
            </Center>
          ) : (
            <VStack spacing={0} align="stretch">
              {notifications.map((n) => (
                <Box key={n._id} p={2} role="group">
                  <NotificationItem
                    notification={n}
                    onMarkRead={onMarkRead}
                    onDelete={onDelete}
                  />
                </Box>
              ))}
              {notifications.length > 0 && (
                <Box p={4} textAlign="center">
                  <Button
                    as={RouterLink}
                    to="/notifications"
                    variant="link"
                    size="sm"
                    color="brand.link-blue"
                    onClick={onClose}
                  >
                    View all notifications
                  </Button>
                </Box>
              )}
            </VStack>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

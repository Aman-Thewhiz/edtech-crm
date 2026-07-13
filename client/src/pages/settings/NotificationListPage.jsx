import {
  Box,
  VStack,
  Heading,
  Text,
  HStack,
  Button,
  Badge,
  IconButton,
  Center,
  Spinner,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react';
import { FiTrash2, FiCheckCircle, FiChevronLeft, FiBell } from 'react-icons/fi';
import { Link as RouterLink } from 'react-router-dom';
import PageWrapper from '../../components/ui/PageWrapper';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationItem = ({ notification, onMarkRead, onDelete }) => (
  <Box
    p={4}
    w="full"
    bg={notification.isRead ? 'white' : 'brand.canvas-lavender'}
    borderRadius="xl"
    borderWidth="1px"
    borderColor="brand.hairline"
    shadow="sm"
    transition="all 0.2s"
    _hover={{ shadow: 'md' }}
  >
    <HStack justify="space-between" align="start">
      <VStack align="start" spacing={1} flex={1}>
        <HStack>
          <Text fontWeight="bold" color="brand.ink">
            {notification.title}
          </Text>
          {!notification.isRead && (
            <Badge colorScheme="purple" borderRadius="full">
              New
            </Badge>
          )}
        </HStack>
        <Text color="brand.ink-mute">{notification.message}</Text>
        <Text fontSize="xs" color="brand.ink-mute">
          {new Date(notification.createdAt).toLocaleString()}
        </Text>
        {notification.actionUrl && (
          <Button
            as={RouterLink}
            to={notification.actionUrl}
            size="xs"
            variant="link"
            color="brand.link-blue"
            mt={2}
          >
            View Details
          </Button>
        )}
      </VStack>
      <HStack>
        {!notification.isRead && (
          <IconButton
            icon={<FiCheckCircle />}
            aria-label="Mark as read"
            onClick={() => onMarkRead(notification._id)}
            variant="ghost"
            size="sm"
          />
        )}
        <IconButton
          icon={<FiTrash2 />}
          aria-label="Delete"
          onClick={() => onDelete(notification._id)}
          variant="ghost"
          size="sm"
          colorScheme="red"
        />
      </HStack>
    </HStack>
  </Box>
);

export default function NotificationListPage() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

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
            <Text>Notifications</Text>
          </BreadcrumbItem>
        </Breadcrumb>

        <HStack justify="space-between">
          <VStack align="start" spacing={0}>
            <Heading size="lg">Notifications</Heading>
            <Text color="brand.ink-mute">
              Stay updated with your latest activities.
            </Text>
          </VStack>
          <HStack>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                leftIcon={<FiCheckCircle />}
                onClick={markAllAsRead}
                size="sm"
              >
                Mark all as read
              </Button>
            )}
          </HStack>
        </HStack>

        {loading && notifications.length === 0 ? (
          <Center py={20}>
            <Spinner color="brand.primary" size="xl" />
          </Center>
        ) : notifications.length === 0 ? (
          <Center py={20} flexDirection="column" bg="white" borderRadius="xl" border="1px solid" borderColor="brand.hairline">
            <FiBell size={48} color="#e6e6e6" />
            <Text mt={4} color="brand.ink-mute">
              You have no notifications.
            </Text>
            <Button as={RouterLink} to="/dashboard" mt={6} leftIcon={<FiChevronLeft />}>
              Back to Dashboard
            </Button>
          </Center>
        ) : (
          <VStack spacing={4} align="stretch">
            {notifications.map((n) => (
              <NotificationItem
                key={n._id}
                notification={n}
                onMarkRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
          </VStack>
        )}
      </VStack>
    </PageWrapper>
  );
}

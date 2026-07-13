import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  HStack,
  SimpleGrid,
  Skeleton,
  SkeletonText,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardStats } from '../../services/dashboard';
import { useAuth } from '../../contexts/AuthContext';
import EmptyState from '../../components/ui/EmptyState';

function StatCard({ label, value, delta }) {
  return (
    <Card borderRadius="xl" border="1px solid" borderColor="brand.hairline">
      <CardBody>
        <Stack spacing={2}>
          <Text fontSize="sm" color="brand.inkMute">{label}</Text>
          <Heading size="md">{value}</Heading>
          <Badge w="fit-content" borderRadius="full" colorScheme={delta?.startsWith('-') ? 'red' : 'green'}>{delta}</Badge>
        </Stack>
      </CardBody>
    </Card>
  );
}

function LineChart({ data }) {
  const width = 620;
  const height = 220;
  const padding = 24;
  const series = data || [];
  const maxValue = Math.max(...series.flatMap((point) => [point.admissions, point.revenue]), 1);

  const admissionsPath = series.map((point, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(series.length - 1, 1);
    const y = height - padding - (point.admissions / maxValue) * (height - padding * 2);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const revenuePath = series.map((point, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(series.length - 1, 1);
    const y = height - padding - (point.revenue / maxValue) * (height - padding * 2);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <Box border="1px solid" borderColor="brand.hairline" borderRadius="xl" bg="white" p={5}>
      <Heading size="sm" mb={4}>Monthly admissions vs revenue</Heading>
      <Box as="svg" viewBox={`0 0 ${width} ${height}`} w="100%" h="220px">
        {series.map((point, index) => {
          const x = padding + (index * (width - padding * 2)) / Math.max(series.length - 1, 1);
          return (
            <Text key={point.month} as="text" x={x - 10} y={height - 6} fontSize="10" fill="#696969">
              {point.month}
            </Text>
          );
        })}
        <path d={admissionsPath} fill="none" stroke="#4a154b" strokeWidth="3" strokeLinecap="round" />
        <path d={revenuePath} fill="none" stroke="#1264a3" strokeWidth="3" strokeLinecap="round" />
      </Box>
    </Box>
  );
}

function BarChart({ data }) {
  return (
    <Box border="1px solid" borderColor="brand.hairline" borderRadius="xl" bg="white" p={5}>
      <Heading size="sm" mb={4}>Leads by source</Heading>
      <VStack align="stretch" spacing={3}>
        {(data || []).map((item) => (
          <Box key={item.source}>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="sm">{item.source}</Text>
              <Text fontSize="sm" color="brand.inkMute">{item.value}</Text>
            </HStack>
            <Box bg="brand.canvasLavender" borderRadius="full" h="10px" overflow="hidden">
              <Box bg="brand.primary" h="100%" w={`${Math.min(item.value * 3, 100)}%`} />
            </Box>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

function ActivityFeed({ items }) {
  if (!items?.length) {
    return <EmptyState title="No recent activity" description="Relevant audit events will appear here once module actions are logged." />;
  }

  return (
    <VStack align="stretch" spacing={3}>
      {items.map((item) => (
        <Box key={item.id} p={4} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
          <Text fontWeight="700">{item.action}</Text>
          <Text fontSize="sm" color="brand.inkMute">{item.resource}</Text>
        </Box>
      ))}
    </VStack>
  );
}

function QuickActions({ items, navigate }) {
  return (
    <Card borderRadius="xl" border="1px solid" borderColor="brand.hairline">
      <CardBody>
        <Heading size="sm" mb={4}>Quick actions</Heading>
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
          {items.map((item) => (
            <Button key={item.label} onClick={() => navigate(item.href)}>{item.label}</Button>
          ))}
        </SimpleGrid>
      </CardBody>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchDashboardStats()
      .then((data) => {
        if (mounted) setDashboard(data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user?.role]);

  const stats = dashboard?.stats || [];
  const quickActions = dashboard?.quickActions || [];
  const activity = dashboard?.recentActivity || [];
  const charts = dashboard?.charts || {};

  const skeletonCards = useMemo(() => Array.from({ length: 4 }, (_, index) => index), []);

  return (
    <Stack spacing={6}>
      <Box>
        <Heading size="lg">{user?.role?.replaceAll('_', ' ') || 'Dashboard'}</Heading>
        <Text color="brand.inkMute">A quick view of current activity and priorities.</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={4}>
        {loading ? skeletonCards.map((index) => (
          <Card key={index} borderRadius="xl" border="1px solid" borderColor="brand.hairline">
            <CardBody>
              <Skeleton height="14px" mb={3} />
              <Skeleton height="28px" mb={3} />
              <SkeletonText noOfLines={1} width="40%" />
            </CardBody>
          </Card>
        )) : stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
        {loading ? <Skeleton height="220px" borderRadius="xl" /> : <LineChart data={charts.admissionsVsRevenue} />}
        {loading ? <Skeleton height="220px" borderRadius="xl" /> : <BarChart data={charts.leadsBySource} />}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
        <Card borderRadius="xl" border="1px solid" borderColor="brand.hairline">
          <CardBody>
            <Heading size="sm" mb={4}>Recent activity</Heading>
            {loading ? <SkeletonText noOfLines={5} spacing={4} /> : <ActivityFeed items={activity} />}
          </CardBody>
        </Card>
        {loading ? <Skeleton height="220px" borderRadius="xl" /> : <QuickActions items={quickActions} navigate={navigate} />}
      </SimpleGrid>
    </Stack>
  );
}
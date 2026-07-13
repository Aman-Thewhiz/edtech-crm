import { Box, Heading, Text } from '@chakra-ui/react';

export default function EmptyState({ title, description }) {
  return (
    <Box textAlign="center" py={12}>
      <Heading size="md">{title}</Heading>
      <Text mt={2} color="gray.600">{description}</Text>
    </Box>
  );
}
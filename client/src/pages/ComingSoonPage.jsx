import { Center, Heading, Text, VStack } from '@chakra-ui/react';

export default function ComingSoonPage({ title = 'Coming soon' }) {
  return (
    <Center minH="60vh">
      <VStack spacing={3} textAlign="center">
        <Heading size="lg">{title}</Heading>
        <Text color="gray.600">This module will be implemented in a later phase.</Text>
      </VStack>
    </Center>
  );
}
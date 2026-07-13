import { Center, Heading, Text, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <Center minH="100vh">
      <VStack spacing={4}>
        <Heading>404</Heading>
        <Text>Page not found.</Text>
        <Link to="/dashboard">Go home</Link>
      </VStack>
    </Center>
  );
}
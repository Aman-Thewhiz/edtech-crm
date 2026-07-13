import { Box, Container } from '@chakra-ui/react';

export default function PageWrapper({ children }) {
  return (
    <Box py={6}>
      <Container maxW="7xl">{children}</Container>
    </Box>
  );
}
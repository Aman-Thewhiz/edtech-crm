import { Button, Container, FormControl, FormLabel, Heading, Input, Stack } from '@chakra-ui/react';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  return (
    <Container maxW="md" py={20}>
      <Stack spacing={4}>
        <Heading size="lg">Forgot password</Heading>
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input value={email} onChange={(event) => setEmail(event.target.value)} />
        </FormControl>
        <Button>Send OTP</Button>
      </Stack>
    </Container>
  );
}
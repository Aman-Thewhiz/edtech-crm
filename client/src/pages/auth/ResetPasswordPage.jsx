import { Button, Container, FormControl, FormLabel, Heading, Input, Stack } from '@chakra-ui/react';
import { useState } from 'react';

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ email: '', otp: '', password: '' });

  return (
    <Container maxW="md" py={20}>
      <Stack spacing={4}>
        <Heading size="lg">Reset password</Heading>
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </FormControl>
        <FormControl>
          <FormLabel>OTP</FormLabel>
          <Input value={form.otp} onChange={(event) => setForm({ ...form, otp: event.target.value })} />
        </FormControl>
        <FormControl>
          <FormLabel>New password</FormLabel>
          <Input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        </FormControl>
        <Button>Reset password</Button>
      </Stack>
    </Container>
  );
}
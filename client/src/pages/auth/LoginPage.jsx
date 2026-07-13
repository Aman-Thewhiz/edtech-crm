import { useState } from 'react';
import { Button, Card, CardBody, Checkbox, Container, FormControl, FormLabel, Heading, Input, Stack, Text } from '@chakra-ui/react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });

  const submit = async (event) => {
    event.preventDefault();
    await login(form);
    navigate('/dashboard');
  };

  return (
    <Container maxW="md" py={20}>
      <Card borderRadius="xl" boxShadow="lg">
        <CardBody>
          <Stack spacing={5} as="form" onSubmit={submit}>
            <Heading size="lg">Sign in</Heading>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </FormControl>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            </FormControl>
            <Checkbox isChecked={form.rememberMe} onChange={(event) => setForm({ ...form, rememberMe: event.target.checked })}>Remember me</Checkbox>
            <Button type="submit">Login</Button>
            <Text>
              <Link to="/forgot-password">Forgot password?</Link>
            </Text>
          </Stack>
        </CardBody>
      </Card>
    </Container>
  );
}
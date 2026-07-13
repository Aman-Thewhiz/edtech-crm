import { Alert, AlertIcon } from '@chakra-ui/react';

export default function AlertBanner({ status = 'info', children }) {
  return (
    <Alert status={status} borderRadius="xl">
      <AlertIcon />
      {children}
    </Alert>
  );
}
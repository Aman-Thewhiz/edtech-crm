import { Badge as ChakraBadge } from '@chakra-ui/react';

export default function Badge(props) {
  return <ChakraBadge borderRadius="full" px={3} py={1} {...props} />;
}
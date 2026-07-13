import { Button as ChakraButton } from '@chakra-ui/react';

export default function Button(props) {
  return <ChakraButton borderRadius="full" px={7} py={4} {...props} />;
}
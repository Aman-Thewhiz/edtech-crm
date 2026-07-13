import { FormControl, FormLabel } from '@chakra-ui/react';

export default function FormField({ label, children, ...rest }) {
  return (
    <FormControl {...rest}>
      <FormLabel>{label}</FormLabel>
      {children}
    </FormControl>
  );
}
import { Box, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';

export default function DataTable({ columns = [], data = [] }) {
  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            {columns.map((column) => (
              <Th key={column.key}>{column.header}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row) => (
            <Tr key={row.id || JSON.stringify(row)}>
              {columns.map((column) => (
                <Td key={column.key}>{column.render ? column.render(row) : row[column.key]}</Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
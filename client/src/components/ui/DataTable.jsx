import { Box, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";

export default function DataTable({ columns = [], data = [] }) {
  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            {columns.map((column) => (
              <Th key={column.accessor || column.header}>
                {column.header}
              </Th>
            ))}
          </Tr>
        </Thead>

        <Tbody>
          {data.map((row) => (
            <Tr key={row._id || row.id}>
              {columns.map((column) => {
                const value = row[column.accessor];

                return (
                  <Td key={column.accessor || column.header}>
                    {column.render
                      ? column.render(value, row)
                      : value}
                  </Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
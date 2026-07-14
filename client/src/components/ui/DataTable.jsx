import { Box, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";

export default function DataTable({ columns = [], data = [] }) {
  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            {columns.map((column) => (
              <Th key={column.header}>{column.header}</Th>
            ))}
          </Tr>
        </Thead>

        <Tbody>
          {data.map((row) => (
            <Tr key={row._id || row.id}>
              {columns.map((column) => (
                <Td key={column.header}>
  {column.render
  ? (
      column.render.length >= 2
        ? column.render(row[column.accessor], row)
        : column.render(row)
    )
  : row[column.accessor]}
</Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
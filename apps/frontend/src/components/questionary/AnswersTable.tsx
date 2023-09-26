import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import React from 'react';

import { TableRowData } from './QuestionaryDetails';

interface AnswersTableProps {
  rows?: TableRowData[];
}

export function AnswersTable(props: AnswersTableProps) {
  const { rows } = props;

  const createTableRow = (key: string, rowData: TableRowData) => (
    <TableRow
      key={key}
      sx={(theme) => ({
        ':hover': {
          background: theme.palette.grey[100],
        },
      })}
    >
      <TableCell padding={'normal'}>{rowData.label}</TableCell>
      <TableCell width={'35%'}>{rowData.value}</TableCell>
    </TableRow>
  );

  return (
    <Table sx={{ wordBreak: 'break-word' }} size="small">
      <TableBody>
        {rows?.map((row, index) => createTableRow(`row-${index}`, row))}
      </TableBody>
    </Table>
  );
}

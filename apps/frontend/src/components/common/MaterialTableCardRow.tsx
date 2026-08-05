import { Column, MTableBodyRow } from '@material-table/core';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import React from 'react';

type MaterialTableCardRowProps<RowData extends object> = {
  data: RowData;
  columns: Column<RowData>[];
  actions?: unknown[];
  components: Record<string, React.ComponentType<Record<string, unknown>>>;
  getFieldValue: (rowData: RowData, columnDef: Column<RowData>) => unknown;
};

function renderColumnValue<RowData extends object>(
  data: RowData,
  columnDef: Column<RowData>,
  getFieldValue: MaterialTableCardRowProps<RowData>['getFieldValue']
): React.ReactNode {
  const value = getFieldValue(data, columnDef);

  if (
    columnDef.emptyValue !== undefined &&
    (value === undefined || value === null)
  ) {
    return typeof columnDef.emptyValue === 'function'
      ? (columnDef.emptyValue(data) as React.ReactNode)
      : (columnDef.emptyValue as React.ReactNode);
  }

  return columnDef.render ? columnDef.render(data) : (value as React.ReactNode);
}

/**
 * Renders a material-table row as a card, for use as the `Row` component slot
 * on narrow viewports. The card stays inside a TableRow/TableCell so the
 * surrounding table markup, toolbar, loading overlay and pagination keep
 * working unchanged.
 */
export default function MaterialTableCardRow<RowData extends object>({
  data,
  columns,
  actions,
  components,
  getFieldValue,
}: MaterialTableCardRowProps<RowData>) {
  const visibleColumns = columns.filter((columnDef) => !columnDef.hidden);
  const [primaryColumn, ...detailColumns] = visibleColumns;
  const Actions = components.Actions;

  return (
    <TableRow>
      <TableCell
        colSpan={visibleColumns.length + 1}
        sx={{ padding: 1, borderBottom: 'none' }}
      >
        <Card variant="outlined">
          <CardContent sx={{ paddingBottom: 0 }}>
            {primaryColumn && (
              <Typography variant="subtitle1" component="h3" gutterBottom>
                {renderColumnValue(data, primaryColumn, getFieldValue)}
              </Typography>
            )}
            {detailColumns.map((columnDef, index) => (
              <Box
                key={`card-field-${index}`}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '40% 1fr',
                  columnGap: 1,
                  paddingY: 0.25,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  component="span"
                >
                  {columnDef.title}
                </Typography>
                <Typography variant="body2" component="span">
                  {renderColumnValue(data, columnDef, getFieldValue)}
                </Typography>
              </Box>
            ))}
          </CardContent>
          {!!actions?.length && (
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Actions
                data={data}
                actions={actions}
                components={components}
                size="small"
              />
            </CardActions>
          )}
        </Card>
      </TableCell>
    </TableRow>
  );
}

const CARD_ROW = { Row: MaterialTableCardRow };
const DEFAULT_ROW = { Row: MTableBodyRow };

/**
 * material-table merges `components` into a store and ignores a falsy value,
 * so it never falls back to the default Row once one has been supplied. Both
 * states have to be named explicitly, and the references have to be stable or
 * every parent render writes to that store again.
 */
export const rowComponents = (asCards: boolean) =>
  asCards ? CARD_ROW : DEFAULT_ROW;

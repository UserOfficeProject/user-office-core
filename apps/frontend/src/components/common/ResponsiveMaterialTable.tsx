import MaterialTable, {
  MaterialTableProps,
  MTableBodyRow,
} from '@material-table/core';
import Box from '@mui/material/Box';
import React from 'react';

import { CardRowProvider } from 'components/common/cards/CardRowContext';
import MaterialTableCardRow from 'components/common/MaterialTableCardRow';
import { useCardRows } from 'hooks/common/useResponsive';

// material-table ignores a falsy `components`, so it never reverts to the
// default Row. Both states must be named, and the references must be stable.
// Only plain function components belong here: material-table deepmerges this
// object, and deepmerge recurses forever into anything that is not a function,
// which a React.forwardRef result is.
const CARD_ROW = { Row: MaterialTableCardRow };
const DEFAULT_ROW = { Row: MTableBodyRow };

// material-table's own Container is a Paper at elevation 2. The card path
// already sits on a section Panel, so that paper reads as a box inside a box.
// Flattened from the outside rather than by replacing Container, for the reason
// above.
const FLATTEN_CONTAINER = {
  '& > .MuiPaper-root': {
    boxShadow: 'none',
    backgroundColor: 'transparent',
  },
};

const CARD_PAGING = {
  pageSize: 20,
  pageSizeOptions: [20],
  showFirstLastPageButtons: false,
};

export type ResponsiveMaterialTableProps<RowData extends object> =
  MaterialTableProps<RowData> & {
    /** Replaces the generic card body on the mobile card path. */
    cardRow?: (data: RowData) => React.ReactNode;
  };

function ResponsiveMaterialTable<RowData extends object>({
  cardRow,
  ...props
}: ResponsiveMaterialTableProps<RowData>) {
  const asCards = useCardRows();

  const table = (
    <MaterialTable
      {...props}
      components={asCards ? CARD_ROW : DEFAULT_ROW}
      options={{
        header: !asCards,
        ...(asCards ? CARD_PAGING : {}),
        ...props.options,
      }}
    />
  );

  return (
    <CardRowProvider value={asCards ? cardRow ?? null : null}>
      {asCards ? <Box sx={FLATTEN_CONTAINER}>{table}</Box> : table}
    </CardRowProvider>
  );
}

export default ResponsiveMaterialTable;

import MaterialTable, {
  MaterialTableProps,
  MTableBodyRow,
} from '@material-table/core';
import Box from '@mui/material/Box';
import React from 'react';

import { CardRowProvider } from 'components/common/cards/CardRowContext';
import MaterialTableCardRow from 'components/common/MaterialTableCardRow';
import { useIsMobile } from 'hooks/common/useResponsive';

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
    cardRow?: (data: RowData) => React.ReactNode;
  };

function ResponsiveMaterialTable<RowData extends object>({
  cardRow,
  ...props
}: ResponsiveMaterialTableProps<RowData>) {
  const isMobile = useIsMobile();
  const components = React.useMemo(
    () => ({
      ...props.components,
      Row: isMobile
        ? MaterialTableCardRow
        : props.components?.Row ?? MTableBodyRow,
    }),
    [isMobile, props.components]
  );

  const table = (
    <MaterialTable
      {...props}
      components={components}
      options={{
        header: !isMobile,
        ...(isMobile ? CARD_PAGING : {}),
        ...props.options,
      }}
    />
  );

  return (
    <CardRowProvider value={isMobile ? cardRow ?? null : null}>
      {isMobile ? <Box sx={FLATTEN_CONTAINER}>{table}</Box> : table}
    </CardRowProvider>
  );
}

export default ResponsiveMaterialTable;

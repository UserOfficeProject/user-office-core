import MaterialTable, {
  MaterialTableProps,
  MTableBodyRow,
} from '@material-table/core';
import React from 'react';

import { CardRowProvider } from 'components/common/cards/CardRowContext';
import MaterialTableCardRow from 'components/common/MaterialTableCardRow';
import { useCardRows } from 'hooks/common/useResponsive';

// material-table ignores a falsy `components`, so it never reverts to the
// default Row. Both states must be named, and the references must be stable.
const CARD_ROW = { Row: MaterialTableCardRow };
const DEFAULT_ROW = { Row: MTableBodyRow };

type ResponsiveMaterialTableProps<RowData extends object> =
  MaterialTableProps<RowData> & {
    /** Replaces the generic card body on the mobile card path. */
    cardRow?: (data: RowData) => React.ReactNode;
  };

function ResponsiveMaterialTable<RowData extends object>({
  cardRow,
  ...props
}: ResponsiveMaterialTableProps<RowData>) {
  const asCards = useCardRows();

  return (
    <CardRowProvider value={asCards ? cardRow ?? null : null}>
      <MaterialTable
        {...props}
        components={asCards ? CARD_ROW : DEFAULT_ROW}
        options={{ header: !asCards, ...props.options }}
      />
    </CardRowProvider>
  );
}

export default ResponsiveMaterialTable;

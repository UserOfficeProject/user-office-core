import MaterialTable, {
  MaterialTableProps,
  MTableBodyRow,
} from '@material-table/core';
import React from 'react';

import MaterialTableCardRow from 'components/common/MaterialTableCardRow';
import { useCardRows } from 'hooks/common/useResponsive';

// material-table ignores a falsy `components`, so it never reverts to the
// default Row. Both states must be named, and the references must be stable.
const CARD_ROW = { Row: MaterialTableCardRow };
const DEFAULT_ROW = { Row: MTableBodyRow };

function ResponsiveMaterialTable<RowData extends object>(
  props: MaterialTableProps<RowData>
) {
  const asCards = useCardRows();

  return (
    <MaterialTable
      {...props}
      components={asCards ? CARD_ROW : DEFAULT_ROW}
      options={{ header: !asCards, ...props.options }}
    />
  );
}

export default ResponsiveMaterialTable;

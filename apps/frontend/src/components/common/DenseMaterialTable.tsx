import MaterialTable, { MaterialTableProps } from '@material-table/core';
import React, { useMemo } from 'react';

import { columnsWithOverflow } from 'utils/helperFunctions';

/**NOTE:
 * This wrapper component improves the space usage in the MaterialTable by limiting row content to one line
 * and showing indicator(three dots) if there is more content to be shown on hover.
 */
export function DenseMaterialTable<RowData extends object>(
  props: MaterialTableProps<RowData>
) {
  const columns = useMemo(() => columnsWithOverflow(props.columns), []);

  return <MaterialTable {...props} columns={columns} />;
}

export default DenseMaterialTable;

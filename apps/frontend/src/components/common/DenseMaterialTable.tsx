import { MaterialTableProps } from '@material-table/core';
import React, { useMemo } from 'react';

import ResponsiveMaterialTable from 'components/common/ResponsiveMaterialTable';
import { useCardRows } from 'hooks/common/useResponsive';
import { denseTableColumns } from 'utils/helperFunctions';

/**NOTE:
 * This wrapper component improves the space usage in the MaterialTable by limiting row content to one line
 * and showing indicator(three dots) if there is more content to be shown on hover.
 */
function DenseMaterialTable<RowData extends object>(
  props: MaterialTableProps<RowData>
) {
  const asCards = useCardRows();
  // Deliberately not keyed on props.columns.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = useMemo(
    () => (asCards ? props.columns : denseTableColumns(props.columns)),
    [asCards]
  );

  return (
    <ResponsiveMaterialTable
      {...props}
      options={{ ...props.options, pageSize: props.options?.pageSize || 10 }}
      columns={columns}
    />
  );
}

export default DenseMaterialTable;

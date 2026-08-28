import React from 'react';

import ResponsiveMaterialTable, {
  ResponsiveMaterialTableProps,
} from 'components/common/ResponsiveMaterialTable';
import { useCardRows } from 'hooks/common/useResponsive';
import { denseTableColumns } from 'utils/helperFunctions';

/**NOTE:
 * This wrapper component improves the space usage in the MaterialTable by limiting row content to one line
 * and showing indicator(three dots) if there is more content to be shown on hover.
 */
function DenseMaterialTable<RowData extends object>(
  props: ResponsiveMaterialTableProps<RowData>
) {
  const asCards = useCardRows();
  const columns = asCards ? props.columns : denseTableColumns(props.columns);

  return (
    <ResponsiveMaterialTable
      {...props}
      options={{ ...props.options, pageSize: props.options?.pageSize || 10 }}
      columns={columns}
    />
  );
}

export default DenseMaterialTable;

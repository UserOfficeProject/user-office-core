import { Column } from 'material-table';

import { SortDirectionType } from 'components/common/SuperMaterialTable';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getUniqueArrayBy = (roles: any[], uniqueBy: string): any[] => {
  const result = [];
  const map = new Map<number, boolean>();
  for (const item of roles) {
    if (!map.has(item[uniqueBy])) {
      map.set(item.id, true);
      result.push(item);
    }
  }

  return result;
};

export const setSortDirectionOnSortColumn = (
  columns: Column<any>[],
  sortColumn: number | null | undefined,
  sortDirection: string | null | undefined
) => {
  if (sortColumn !== undefined && sortColumn !== null && sortDirection) {
    columns[sortColumn].defaultSort = sortDirection as SortDirectionType;
  }

  return columns;
};

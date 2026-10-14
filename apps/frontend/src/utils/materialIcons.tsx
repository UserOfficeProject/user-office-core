import { Icons } from '@material-table/core';
import AddBox from '@mui/icons-material/AddBox';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import Check from '@mui/icons-material/Check';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Clear from '@mui/icons-material/Clear';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import Edit from '@mui/icons-material/Edit';
import FilterList from '@mui/icons-material/FilterList';
import FirstPage from '@mui/icons-material/FirstPage';
import LastPage from '@mui/icons-material/LastPage';
import Remove from '@mui/icons-material/Remove';
import SaveAlt from '@mui/icons-material/SaveAlt';
import Search from '@mui/icons-material/Search';
import ViewColumn from '@mui/icons-material/ViewColumn';
import { SvgIconProps } from '@mui/material/SvgIcon';
import React, { forwardRef } from 'react';

const createTableIcon = (Icon: typeof AddBox) =>
  forwardRef<SVGSVGElement, SvgIconProps>(function TableIcon(props, ref) {
    return <Icon {...props} ref={ref} />;
  });

export const tableIcons: Icons<never> = {
  Add: createTableIcon(AddBox),
  Check: createTableIcon(Check),
  Clear: createTableIcon(Clear),
  Delete: createTableIcon(DeleteOutline),
  DetailPanel: createTableIcon(ChevronRight),
  Edit: createTableIcon(Edit),
  Export: createTableIcon(SaveAlt),
  Filter: createTableIcon(FilterList),
  FirstPage: createTableIcon(FirstPage),
  LastPage: createTableIcon(LastPage),
  NextPage: createTableIcon(ChevronRight),
  PreviousPage: createTableIcon(ChevronLeft),
  ResetSearch: createTableIcon(Clear),
  Search: createTableIcon(Search),
  SortArrow: createTableIcon(ArrowUpward),
  ThirdStateCheck: createTableIcon(Remove),
  ViewColumn: createTableIcon(ViewColumn),
};

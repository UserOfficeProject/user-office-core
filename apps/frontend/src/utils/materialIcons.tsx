/* eslint-disable react/display-name */
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
import React, { forwardRef } from 'react';

export const tableIcons: Icons<never> = {
  Add: forwardRef<SVGSVGElement | null>((props, ref) => (
    <AddBox {...props} ref={ref} />
  )),
  Check: forwardRef<SVGSVGElement | null>((props, ref) => (
    <Check {...props} ref={ref} />
  )),
  Clear: forwardRef<SVGSVGElement | null>((props, ref) => (
    <Clear {...props} ref={ref} />
  )),
  Delete: forwardRef<SVGSVGElement | null>((props, ref) => (
    <DeleteOutline {...props} ref={ref} />
  )),
  DetailPanel: forwardRef<SVGSVGElement | null>((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef<SVGSVGElement | null>((props, ref) => (
    <Edit {...props} ref={ref} />
  )),
  Export: forwardRef<SVGSVGElement | null>((props, ref) => (
    <SaveAlt {...props} ref={ref} />
  )),
  Filter: forwardRef<SVGSVGElement | null>((props, ref) => (
    <FilterList {...props} ref={ref} />
  )),
  FirstPage: forwardRef<SVGSVGElement | null>((props, ref) => (
    <FirstPage {...props} ref={ref} />
  )),
  LastPage: forwardRef<SVGSVGElement | null>((props, ref) => (
    <LastPage {...props} ref={ref} />
  )),
  NextPage: forwardRef<SVGSVGElement | null>((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  PreviousPage: forwardRef<SVGSVGElement | null>((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef<SVGSVGElement | null>((props, ref) => (
    <Clear {...props} ref={ref} />
  )),
  Search: forwardRef<SVGSVGElement | null>((props, ref) => (
    <Search {...props} ref={ref} />
  )),
  SortArrow: forwardRef<SVGSVGElement | null>((props, ref) => (
    <ArrowUpward {...props} ref={ref} />
  )),
  ThirdStateCheck: forwardRef<SVGSVGElement | null>((props, ref) => (
    <Remove {...props} ref={ref} />
  )),
  ViewColumn: forwardRef<SVGSVGElement | null>((props, ref) => (
    <ViewColumn {...props} ref={ref} />
  )),
};

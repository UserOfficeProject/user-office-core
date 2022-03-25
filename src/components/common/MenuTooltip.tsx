import Tooltip, { TooltipProps } from '@mui/material/Tooltip';
import React from 'react';

//NOTE: Using this tooltip with right placement for menus just because tooltips in MUI v5 by default are https://mui.com/components/tooltips/#interactive
// and if it is placed on the bottom very often it covers element bellow.
const MenuTooltip: React.FC<TooltipProps> = (props) => (
  <Tooltip {...props} placement="right">
    {props.children}
  </Tooltip>
);

export default MenuTooltip;

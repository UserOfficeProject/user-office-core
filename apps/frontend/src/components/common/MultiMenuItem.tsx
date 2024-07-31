import { Checkbox, MenuItem, MenuItemProps } from '@mui/material';
import React from 'react';

const MultiMenuItem = (props: MenuItemProps) => (
  <MenuItem
    {...props}
    sx={{
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      outline: 'none',
      padding: '5px',
    }}
  >
    <Checkbox checked={props.selected} />
    <div>{props.children}</div>
  </MenuItem>
);

export default MultiMenuItem;

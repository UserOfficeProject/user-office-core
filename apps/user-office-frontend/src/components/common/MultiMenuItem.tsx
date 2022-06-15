import { Checkbox, MenuItem, MenuItemProps } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    outline: 'none',
    padding: '5px',
  },
}));

const MultiMenuItem: React.FC<MenuItemProps> = (props) => {
  const classes = useStyles();

  return (
    <MenuItem {...props} className={classes.container}>
      <Checkbox checked={props.selected} />
      <div>{props.children}</div>
    </MenuItem>
  );
};

export default MultiMenuItem;

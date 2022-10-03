import { Typography } from '@mui/material';
import Avatar, { AvatarProps } from '@mui/material/Avatar';
import ListItemIcon from '@mui/material/ListItemIcon';
import { Property } from 'csstype';
import React from 'react';

export function ListShadedItem(
  props: AvatarProps & { shade?: Property.BackgroundColor; title?: string }
) {
  const { shade, title, ...other } = props;

  return (
    <ListItemIcon sx={{ minWidth: '36px' }}>
      <Avatar
        sx={{ width: 24, height: 24, marginRight: '10px' }}
        style={{ backgroundColor: shade ?? '#CCC' }}
        {...other}
      >
        &nbsp;
      </Avatar>
      <Typography color="#000">{title ?? ''}</Typography>
    </ListItemIcon>
  );
}

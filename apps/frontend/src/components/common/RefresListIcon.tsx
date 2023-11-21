import RefreshIcon from '@mui/icons-material/Refresh';
import { IconButton } from '@mui/material';
import React from 'react';

type RefreshListIconProps = {
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
};

const RefreshListIcon = (props: RefreshListIconProps) => {
  return (
    <IconButton
      edge="end"
      title="Refresh"
      aria-label="Refresh the list"
      onClick={props.onClick}
    >
      <RefreshIcon fontSize="small" />
    </IconButton>
  );
};

export default RefreshListIcon;

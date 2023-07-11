import { Menu, MenuItem } from '@mui/material';
import React, { useEffect } from 'react';

type TableActionsDropdownMenuProps = {
  event: null | HTMLElement;
  handleClose: (option: string) => void;
  options: string[];
};
const TableActionsDropdownMenu = ({
  event,
  handleClose,
  options,
}: TableActionsDropdownMenuProps) => {
  const [anchorElement, setAnchorElement] = React.useState<null | HTMLElement>(
    null
  );
  const [open, setOpen] = React.useState<boolean>(false);
  useEffect(() => {
    if (event) {
      setAnchorElement(event);
    }
    setOpen(!!event);
  }, [anchorElement, event, open]);

  return (
    <Menu
      id="basic-menu"
      anchorEl={anchorElement}
      open={open}
      onClose={() => handleClose('close')}
      MenuListProps={{
        'aria-labelledby': 'basic-button',
      }}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
          mt: 1.5,
          '& .MuiAvatar-root': {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
          },
          '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: 'background.paper',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
          },
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      {options.map((option) => (
        <MenuItem
          key={option}
          onClick={() => {
            handleClose(option);
          }}
        >
          {option}
        </MenuItem>
      ))}
    </Menu>
  );
};

export default TableActionsDropdownMenu;

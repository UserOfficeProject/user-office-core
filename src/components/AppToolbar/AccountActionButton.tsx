import { ExitToApp } from '@mui/icons-material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import React, { useContext, useState } from 'react';

import { UserContext } from 'context/UserContextProvider';
import { getUniqueArrayBy } from 'utils/helperFunctions';

import RoleSelection from './RoleSelection';

const AccountActionButton: React.FC = () => {
  const [show, setShow] = useState(false);
  const { roles, handleLogout } = useContext(UserContext);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const hasMultipleRoles = getUniqueArrayBy(roles, 'id').length > 1;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOnLogout = () => {
    handleLogout();
  };

  return (
    <>
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={show}
        onClose={(): void => setShow(false)}
        style={{ backdropFilter: 'blur(6px)' }}
      >
        <DialogContent>
          <RoleSelection />
        </DialogContent>
      </Dialog>
      <>
        <IconButton
          color="inherit"
          aria-controls="simple-menu"
          aria-haspopup="true"
          aria-label="Account"
          onClick={handleClick}
          data-cy="profile-page-btn"
        >
          <Badge color="secondary">
            <AccountCircle />
          </Badge>
        </IconButton>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {hasMultipleRoles && (
            <MenuItem
              onClick={() => {
                setShow(true);
                handleClose();
              }}
            >
              <Box paddingRight={1} paddingTop={1}>
                <SupervisedUserCircleIcon />
              </Box>
              Roles
            </MenuItem>
          )}
          <MenuItem data-cy="logout" onClick={handleOnLogout}>
            <Box paddingRight={1} paddingTop={1}>
              <ExitToApp />
            </Box>
            Logout
          </MenuItem>
        </Menu>
      </>
    </>
  );
};

export default AccountActionButton;

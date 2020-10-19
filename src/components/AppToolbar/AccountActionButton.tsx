import Badge from '@material-ui/core/Badge';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { ExitToApp } from '@material-ui/icons';
import AccountCircle from '@material-ui/icons/AccountCircle';
import PersonIcon from '@material-ui/icons/Person';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import { UserContext } from 'context/UserContextProvider';
import { getUniqueArrayBy } from 'utils/helperFunctions';

import RoleSelection from './RoleSelection';

const AccountActionButton: React.FC = () => {
  const [show, setShow] = useState(false);
  const { user, roles, handleLogout } = useContext(UserContext);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { id } = user;

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
          <RoleSelection close={() => setShow(false)} />
        </DialogContent>
      </Dialog>
      <>
        <IconButton
          color="inherit"
          aria-controls="simple-menu"
          aria-haspopup="true"
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
          <MenuItem
            component={Link}
            to={`/ProfilePage/${id}`}
            onClick={handleClose}
          >
            <Box paddingRight={1} paddingTop={1}>
              <PersonIcon />
            </Box>
            Profile
          </MenuItem>
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

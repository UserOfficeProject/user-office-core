import { ExitToApp, ManageAccounts } from '@mui/icons-material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import SwitchAccountOutlinedIcon from '@mui/icons-material/SwitchAccountOutlined';
import { Chip, Divider } from '@mui/material';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import ImpersonateButton from 'components/common/ImpersonateButton';
import StyledDialog from 'components/common/StyledDialog';
import UOLoader from 'components/common/UOLoader';
import { SettingsContext } from 'context/SettingsContextProvider';
import { UserContext } from 'context/UserContextProvider';
import { SettingsId } from 'generated/sdk';
import { getUniqueArrayBy } from 'utils/helperFunctions';

import ProfileInfo from './ProfileInfo';
import RoleSelection from './RoleSelection';

const AccountActionButton = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [show, setShow] = useState(false);
  const { user } = useContext(UserContext);
  const settingsContext = useContext(SettingsContext);
  const { roles, currentRole, handleLogout, impersonatingUserId } =
    useContext(UserContext);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const hasMultipleRoles = getUniqueArrayBy(roles, 'id').length > 1;
  const humanReadableActiveRole = useMemo(
    () =>
      roles.find(({ shortCode }) => shortCode.toUpperCase() === currentRole)
        ?.title ?? 'Unknown',
    [roles, currentRole]
  );

  useEffect(() => {
    if (searchParams.get('selectRoles')) {
      setShow(hasMultipleRoles);
      setSearchParams((searchParams) => {
        searchParams.delete('selectRoles');

        return searchParams;
      });
    }
  }, [hasMultipleRoles, searchParams, setSearchParams]);

  const isUserImpersonated = typeof impersonatingUserId === 'number';

  const externalProfileLink = settingsContext.settingsMap.get(
    SettingsId.PROFILE_PAGE_LINK
  )?.settingsValue;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleModalClose = () => setShow(false);

  const handleOnLogout = () => {
    setIsLoggingOut(true);
    handleLogout().finally(() => {
      setIsLoggingOut(false);
    });
  };

  const handleManageAccountClick = () => {
    handleClose();
    if (externalProfileLink) {
      window.open(externalProfileLink, '_blank', 'noopener,noreferrer');
    } else {
      navigate(`/ProfilePage/${user.id}`);
    }
  };

  return (
    <>
      <StyledDialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={show}
        onClose={handleModalClose}
        maxWidth="md"
        fullWidth
        title="Assigned Roles"
      >
        <DialogContent dividers>
          <RoleSelection onClose={handleModalClose} />
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={handleModalClose}>
            Close
          </Button>
        </DialogActions>
      </StyledDialog>
      <>
        <Badge
          badgeContent={
            <Tooltip title="User impersonated (if you want to un-impersonate click on account icon and use Un-impersonate button)">
              <InfoOutlinedIcon fontSize="small" />
            </Tooltip>
          }
          sx={(theme) => ({
            infoIcon: {
              '& .MuiBadge-badge': {
                top: theme.spacing(0.5),
                right: theme.spacing(0.5),
              },
            },
          })}
          invisible={!impersonatingUserId}
        >
          <IconButton
            color="inherit"
            aria-controls="simple-menu"
            aria-haspopup="true"
            aria-label="Account"
            onClick={handleClick}
            data-cy="profile-page-btn"
            sx={{
              fontSize: '1rem',
            }}
          >
            <AccountCircle />
          </IconButton>
        </Badge>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <ProfileInfo />
          <Divider style={{ marginBottom: '7px' }} />
          <MenuItem onClick={handleManageAccountClick} disabled={isLoggingOut}>
            <Box paddingRight={1} paddingTop={1}>
              <ManageAccounts />
            </Box>
            Manage account
          </MenuItem>
          {hasMultipleRoles && (
            <MenuItem
              onClick={() => {
                setShow(true);
                handleClose();
              }}
              data-cy="change-roles-button"
            >
              <Box paddingRight={1} paddingTop={1}>
                <SupervisedUserCircleIcon />
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flex: 1,
                }}
              >
                <Box>Roles</Box>
                <Chip
                  label={humanReadableActiveRole}
                  color="primary"
                  size="small"
                  sx={{
                    fontSize: '10px',
                    height: 'inherit',
                    lineHeight: 2,
                  }}
                />
              </Box>
            </MenuItem>
          )}
          {isUserImpersonated && (
            <MenuItem data-cy="un-impersonate">
              <ImpersonateButton
                userId={impersonatingUserId}
                data-cy="un-impersonate"
                variant="text"
                startIcon={<SwitchAccountOutlinedIcon />}
                sx={{
                  textTransform: 'none',
                  fontSize: '1rem',
                  color: 'inherit',
                  '&:hover': {
                    backgroundColor: 'transparent ',
                  },
                }}
              >
                Un-impersonate
              </ImpersonateButton>
            </MenuItem>
          )}
          <MenuItem
            data-cy="logout"
            onClick={handleOnLogout}
            disabled={isLoggingOut}
          >
            <Box paddingRight={1} paddingTop={1}>
              {isLoggingOut ? <UOLoader size={24} /> : <ExitToApp />}
            </Box>
            Logout
          </MenuItem>
        </Menu>
      </>
    </>
  );
};

export default AccountActionButton;

import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';

import { useDataApi } from 'hooks/common/useDataApi';
import { VisitRegistrationCore } from 'models/questionary/visit/VisitRegistrationCore';
import withConfirm, { WithConfirmProps } from 'utils/withConfirm';

const MenuContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

const MenuButton = styled('button')({
  background: 'transparent',
  border: 'none',
  padding: '6px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#AAA',
  '&:hover': {
    backgroundColor: 'transparent',
  },
});

const CancelMenuItem = styled(MenuItem)(({ theme }) => ({
  color: theme.palette.error.main,
}));

interface CancelRegistrationMenuProps {
  registration: VisitRegistrationCore;
  onCancelled?: (registration: VisitRegistrationCore) => void;
}
function CancelRegistrationMenu(
  props: CancelRegistrationMenuProps & WithConfirmProps
) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isMenuOpen = anchorEl !== null;

  const { onCancelled, registration, confirm } = props;
  const api = useDataApi();

  const handleCancelClick = async () => {
    await confirm(
      async () => {
        const { cancelVisitRegistration } = await api().cancelVisitRegistration(
          {
            visitRegistration: {
              visitId: registration.visitId,
              userId: registration.userId,
            },
          }
        );
        setAnchorEl(null);
        onCancelled?.(cancelVisitRegistration);
      },
      {
        title: 'Cancel Visit',
        description: 'Are you sure you want to cancel this visit?',
        confirmationText: 'Yes',
        cancellationText: 'No',
      }
    )();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <MenuContainer>
      <MenuButton onClick={handleMenuOpen} data-cy="registration-more-options">
        <MoreVertRoundedIcon fontSize="small" />
      </MenuButton>
      <Menu
        id="registration-menu"
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <CancelMenuItem
          onClick={handleCancelClick}
          data-cy="cancel-visit-button"
        >
          Cancel Visit
        </CancelMenuItem>
      </Menu>
    </MenuContainer>
  );
}

export default withConfirm(CancelRegistrationMenu);

import DialogContent from '@mui/material/DialogContent';
import React from 'react';

import StyledDialog from 'components/common/StyledDialog';
import { Role as RoleSDK } from 'generated/sdk';

import RoleTable from './RoleTable';

type Role = Omit<RoleSDK, 'tags'>;

type RoleModalProps = {
  show: boolean;
  close: () => void;
  add: (role: Role[]) => void;
  activeRoles?: Role[];
};

const RoleModal = ({ show, close, add, activeRoles }: RoleModalProps) => {
  return (
    <StyledDialog
      open={show}
      onClose={() => close()}
      disableScrollLock={true}
      data-cy="role-modal"
    >
      <DialogContent>
        <RoleTable add={add} activeRoles={activeRoles} />
      </DialogContent>
    </StyledDialog>
  );
};

export default RoleModal;

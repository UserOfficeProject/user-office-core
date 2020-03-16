import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import React from 'react';

import RoleTable from './RoleTable';

function RoleModal(props) {
  return (
    <Dialog
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={props.show}
      onClose={() => props.close()}
      disableScrollLock={true}
    >
      <DialogContent>
        <RoleTable add={props.add} />
      </DialogContent>
    </Dialog>
  );
}

export default RoleModal;

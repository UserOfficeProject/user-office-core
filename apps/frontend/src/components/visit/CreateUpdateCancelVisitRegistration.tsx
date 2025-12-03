import { DialogContent } from '@mui/material';
import React from 'react';

import StyledDialog from 'components/common/StyledDialog';
import CancelRegistrationMenu from 'components/experiment/CancelRegistrationMenu';
import { VisitRegistrationStatus } from 'generated/sdk';
import { VisitRegistrationCore } from 'models/questionary/visit/VisitRegistrationCore';

import CreateUpdateVisitRegistration from './CreateUpdateVisitRegistration';

type CreateUpdateCancelVisitRegistrationProps = {
  onClose?: () => void;
  onSubmitted?: (registration: VisitRegistrationCore) => void;
  onCancelled?: (registration: VisitRegistrationCore) => void;
  registration: VisitRegistrationCore | null;
};

const canCancelVisit = (registration: VisitRegistrationCore) => {
  return (
    registration.status === VisitRegistrationStatus.DRAFTED ||
    registration.status === VisitRegistrationStatus.SUBMITTED ||
    registration.status === VisitRegistrationStatus.CHANGE_REQUESTED
  );
};
export default function CreateUpdateCancelVisitRegistration(
  props: CreateUpdateCancelVisitRegistrationProps
) {
  const { onClose, onSubmitted, onCancelled, registration } = props;
  const isDialogOpen = !!registration;

  return (
    registration && (
      <StyledDialog
        open={isDialogOpen}
        fullWidth
        maxWidth="md"
        onClose={onClose}
        title="Visit registration"
        extra={
          canCancelVisit(registration) ? (
            <CancelRegistrationMenu
              registration={registration}
              onCancelled={onCancelled}
            />
          ) : undefined
        }
      >
        <DialogContent dividers>
          <CreateUpdateVisitRegistration
            registration={registration}
            onSubmitted={onSubmitted}
          />
        </DialogContent>
      </StyledDialog>
    )
  );
}

import { DialogContent } from '@mui/material';
import Button, { ButtonProps } from '@mui/material/Button';
import React from 'react';

import StyledDialog from 'components/common/StyledDialog';

interface ButtonWithDialogProps extends ButtonProps {
  children: JSX.Element & { onClose?: () => void };
  label: string;
  disabled?: boolean;
}

function ButtonWithDialog(props: ButtonWithDialogProps) {
  const { children, label, ...rest } = props;
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <>
      <Button variant="text" onClick={() => setIsDialogOpen(true)} {...rest}>
        {label}
      </Button>
      <StyledDialog
        open={isDialogOpen}
        fullWidth
        maxWidth="sm"
        onClose={() => setIsDialogOpen(false)}
      >
        <DialogContent dividers>
          {React.cloneElement(children, {
            onClose: () => setIsDialogOpen(false),
          })}
        </DialogContent>
      </StyledDialog>
    </>
  );
}

export default ButtonWithDialog;

import { DialogContent } from '@mui/material';
import Button, { ButtonProps } from '@mui/material/Button';
import React from 'react';

import StyledDialog from 'components/common/StyledDialog';

interface ButtonWithDialogProps extends ButtonProps {
  children: React.ReactElement<{ onClose?: () => void }>;
  button?: React.ReactElement<ButtonProps>;
  label?: string;
  disabled?: boolean;
  title: string;
}

function ButtonWithDialog(props: ButtonWithDialogProps) {
  const { children, label, button, ...rest } = props;
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleOpen = () => setIsDialogOpen(true);
  const handleClose = () => setIsDialogOpen(false);

  const renderedButton = button ? (
    React.cloneElement(button, {
      onClick: handleOpen,
      ...rest,
    })
  ) : (
    <Button variant="text" onClick={handleOpen} {...rest}>
      {label}
    </Button>
  );

  return (
    <>
      {renderedButton}
      <StyledDialog
        open={isDialogOpen}
        fullWidth
        maxWidth="md"
        onClose={handleClose}
        title={props.title}
      >
        <DialogContent dividers>
          {React.cloneElement(children, {
            onClose: handleClose,
          })}
        </DialogContent>
      </StyledDialog>
    </>
  );
}

export default ButtonWithDialog;

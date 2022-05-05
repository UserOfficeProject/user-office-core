import Button from '@mui/material/Button';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';

import { ActionButtonContainer } from 'components/common/ActionButtonContainer';
import InputDialog from 'components/common/InputDialog';

interface ButtonWithDialogProps {
  children: JSX.Element;
  label: string;
  disabled?: boolean;
}

const useStyles = makeStyles(() => ({
  container: {
    width: '500px',
  },
}));

function ButtonWithDialog({
  children,
  label,
  disabled = false,
}: ButtonWithDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const classes = useStyles();

  return (
    <>
      <Button
        variant="text"
        onClick={() => setIsDialogOpen(true)}
        disabled={disabled}
      >
        {label}
      </Button>
      <InputDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <div className={classes.container}>
          {children}
          <ActionButtonContainer>
            <Button
              type="button"
              variant="outlined"
              onClick={() => setIsDialogOpen(false)}
              data-cy="close-dialog"
            >
              Close
            </Button>
          </ActionButtonContainer>
        </div>
      </InputDialog>
    </>
  );
}

export default ButtonWithDialog;

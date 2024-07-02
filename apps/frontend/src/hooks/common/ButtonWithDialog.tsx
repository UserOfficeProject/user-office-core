import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Button, { ButtonProps } from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import React from 'react';

import InputDialog from 'components/common/InputDialog';

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
      <InputDialog open={isDialogOpen}>
        <IconButton
          data-cy="close-dialog"
          sx={(theme) => ({
            position: 'absolute',
            right: theme.spacing(1),
            top: theme.spacing(1),
          })}
          onClick={() => {
            setIsDialogOpen(false);
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box sx={{ width: '500px' }}>
          {React.cloneElement(children, {
            onClose: () => setIsDialogOpen(false),
          })}
        </Box>
      </InputDialog>
    </>
  );
}

export default ButtonWithDialog;

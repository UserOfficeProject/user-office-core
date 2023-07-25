import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import Button, { ButtonProps } from '@mui/material/Button';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';

import InputDialog from 'components/common/InputDialog';

interface ButtonWithDialogProps extends ButtonProps {
  children: JSX.Element & { onClose?: () => void };
  label: string;
  disabled?: boolean;
}

const useStyles = makeStyles((theme) => ({
  container: {
    width: '500px',
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
}));

function ButtonWithDialog(props: ButtonWithDialogProps) {
  const { children, label, ...rest } = props;
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const classes = useStyles();

  return (
    <>
      <Button variant="text" onClick={() => setIsDialogOpen(true)} {...rest}>
        {label}
      </Button>
      <InputDialog open={isDialogOpen}>
        <IconButton
          data-cy="close-dialog"
          className={classes.closeButton}
          onClick={() => {
            setIsDialogOpen(false);
          }}
        >
          <CloseIcon />
        </IconButton>
        <div className={classes.container}>
          {React.cloneElement(children, {
            onClose: () => setIsDialogOpen(false),
          })}
        </div>
      </InputDialog>
    </>
  );
}

export default ButtonWithDialog;

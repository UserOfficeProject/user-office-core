import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MuiDialogActions from '@mui/material/DialogActions';
import MuiDialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/system';
import parse from 'html-react-parser';
import React from 'react';

import { PageName } from 'generated/sdk';
import { useDataApi } from 'hooks/common/useDataApi';

const DialogContent = styled(MuiDialogContent)(({ theme }) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

const DialogActions = styled(MuiDialogActions)(({ theme }) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}));

type InformationDialogProps = {
  /** Content of the information modal. */
  pageName: PageName;
  text?: string;
  /** Text of the button link in the information modal. */
  linkText?: string;
  /** Styles object of the button link in the information modal. */
  linkStyle?: React.CSSProperties;
};

const InformationDialog = (props: InformationDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const [dialogText, setDialogText] = React.useState<string | null>(null);
  const api = useDataApi();

  const handleClickOpen = async () => {
    const pageContent = await api().getPageContent({ pageId: props.pageName });
    setDialogText(pageContent.pageContent);

    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        sx={(theme) => ({
          background: 'none',
          border: 'none',
          padding: 0,
          fontSize: '8px;',
          fontFamily: 'arial',
          color: theme.palette.primary.main,
          textDecoration: 'underline',
          cursor: 'pointer',
        })}
        onClick={handleClickOpen}
        style={props.linkStyle}
        variant="text"
      >
        {props.linkText}
      </Button>
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogContent dividers>
          <Typography gutterBottom>
            {parse(dialogText ? dialogText : '')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} variant="text">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InformationDialog;

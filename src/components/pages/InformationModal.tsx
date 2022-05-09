import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MuiDialogActions from '@mui/material/DialogActions';
import MuiDialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import withStyles from '@mui/styles/withStyles';
import parse from 'html-react-parser';
import PropTypes from 'prop-types';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  buttonLink: {
    background: 'none',
    border: 'none',
    padding: 0,
    fontSize: '8px;',
    fontFamily: 'arial',
    color: theme.palette.primary.main,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}));

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

type InformationDialogProps = {
  /** Content of the information modal. */
  text?: string;
  /** Text of the button link in the information modal. */
  linkText?: string;
  /** Styles object of the button link in the information modal. */
  linkStyle?: React.CSSProperties;
};

const InformationDialog: React.FC<InformationDialogProps> = (props) => {
  const [open, setOpen] = React.useState(false);
  const classes = useStyles();
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  if (!props.text) {
    return null;
  }

  return (
    <>
      <Button
        className={classes.buttonLink}
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
          <Typography gutterBottom>{parse(props.text)}</Typography>
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

InformationDialog.propTypes = {
  text: PropTypes.string,
  linkText: PropTypes.string,
  linkStyle: PropTypes.objectOf(PropTypes.string),
};

export default InformationDialog;

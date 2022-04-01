import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
const useStyles = makeStyles(() => ({
  container: {
    position: 'relative',
    display: 'inline-block',
    cursor: 'pointer',
  },
  hidden: {
    opacity: 0,
  },
  copyIcon: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '-28px',
    transition: 'all 0.15s ease-in-out',
  },
}));

interface CopyToClipboardProps {
  text: string;
  children: React.ReactNode;
  successMessage?: string;
}
const CopyToClipboard = (props: CopyToClipboardProps) => {
  const { successMessage, children, text } = props;
  const { enqueueSnackbar } = useSnackbar();
  const [showIcon, setShowIcon] = useState(false);
  const classes = useStyles();

  const handleClick = () => {
    enqueueSnackbar(successMessage ?? 'Copied to clipboard', {
      variant: 'success',
    });
    navigator.clipboard.writeText(text);
    setShowIcon(false);
  };
  const handleMouseOver = () => {
    setShowIcon(true);
  };
  const handleMouseOut = () => {
    setShowIcon(false);
  };

  return (
    <div
      className={classes.container}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onClick={handleClick}
    >
      {children}
      <ContentCopyIcon
        className={clsx({
          [classes.hidden]: !showIcon,
          [classes.copyIcon]: true,
        })}
      />
    </div>
  );
};

export default CopyToClipboard;

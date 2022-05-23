import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';

import { truncateString } from 'utils/truncateString';
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
    transition: 'all 0.15s ease-in-out',
  },
  positionRight: {
    right: '-28px',
  },
  positionLeft: {
    left: '-28px',
  },
}));

interface CopyToClipboardProps {
  text: string;
  children: React.ReactNode;
  successMessage?: string;
  position?: 'right' | 'left';
}
const CopyToClipboard = (props: CopyToClipboardProps) => {
  const { successMessage, children, text, position = 'left' } = props;
  const { enqueueSnackbar } = useSnackbar();
  const [showIcon, setShowIcon] = useState(false);
  const classes = useStyles();

  const handleClick = () => {
    enqueueSnackbar(
      successMessage ?? `Copied to clipboard "${truncateString(text, 20)}"`,
      {
        variant: 'success',
      }
    );
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
    <span
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
          [classes.positionRight]: position === 'right',
          [classes.positionLeft]: position === 'left',
        })}
      />
    </span>
  );
};

export default CopyToClipboard;

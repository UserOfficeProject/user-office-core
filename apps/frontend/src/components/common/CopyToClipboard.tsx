import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Box from '@mui/material/Box';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';

import { truncateString } from 'utils/truncateString';

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
    <Box
      component="span"
      sx={{
        position: 'relative',
        display: 'inline-block',
        cursor: 'pointer',
      }}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onClick={handleClick}
    >
      {children}
      <ContentCopyIcon
        sx={{
          ...{
            position: 'absolute',
            top: 0,
            bottom: 0,
            transition: 'all 0.15s ease-in-out',
          },
          ...(!showIcon && { opacity: 0 }),
          ...(position === 'right' && { right: '-28px' }),
          ...(position === 'left' && { left: '-28px' }),
        }}
      />
    </Box>
  );
};

export default CopyToClipboard;

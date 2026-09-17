import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';

import CardActionSheet, {
  CardActionSheetItem,
} from 'components/common/cards/CardActionSheet';
import { minTouchTarget } from 'hooks/common/useResponsive';

type MobileAppBarProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  sheetItems?: CardActionSheetItem[];
  variant?: 'page' | 'dialog';
  /** Trailing content, for dialogs that put their own control in the header. */
  extra?: React.ReactNode;
  error?: boolean;
};

export default function MobileAppBar({
  title,
  subtitle,
  onBack,
  sheetItems = [],
  variant = 'page',
  extra,
  error,
}: MobileAppBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const isDialog = variant === 'dialog';

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      data-cy="mobile-app-bar"
      sx={{
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar
        disableGutters
        sx={(theme) => ({
          minHeight: theme.spacing(7),
          height: theme.spacing(7),
          paddingX: 0.5,
          gap: 0.5,
        })}
      >
        <IconButton
          aria-label={isDialog ? 'Close' : 'Back'}
          onClick={onBack}
          data-cy="mobile-app-bar-back"
          sx={(theme) => ({
            width: minTouchTarget(theme),
            height: minTouchTarget(theme),
            flexShrink: 0,
            color: 'text.secondary',
          })}
        >
          {isDialog ? (
            <CloseIcon sx={{ fontSize: 22 }} />
          ) : (
            <ArrowBackIcon sx={{ fontSize: 22 }} />
          )}
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            component="h1"
            noWrap
            sx={{
              fontWeight: 500,
              fontSize: isDialog ? 16 : 15,
              lineHeight: isDialog ? 1.3 : 1.25,
              color: error ? 'error.main' : 'text.primary',
            }}
          >
            {title}
          </Typography>
          {!isDialog && subtitle && (
            <Typography
              component="p"
              noWrap
              sx={{
                fontSize: 12,
                lineHeight: 1.3,
                color: 'text.secondary',
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {extra}
        {sheetItems.length > 0 && (
          <IconButton
            aria-label="More actions"
            onClick={() => setSheetOpen(true)}
            data-cy="mobile-app-bar-menu"
            sx={(theme) => ({
              width: minTouchTarget(theme),
              height: minTouchTarget(theme),
              flexShrink: 0,
              color: 'action.active',
            })}
          >
            <MoreVertIcon sx={{ fontSize: 22 }} />
          </IconButton>
        )}
      </Toolbar>
      {sheetItems.length > 0 && (
        <CardActionSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title={title}
          items={sheetItems}
        />
      )}
    </AppBar>
  );
}

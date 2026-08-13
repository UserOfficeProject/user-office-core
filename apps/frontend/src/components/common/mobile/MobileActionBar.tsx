import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SendIcon from '@mui/icons-material/Send';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';

import { minTouchTarget } from 'hooks/common/useResponsive';

type MobileAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

type MobilePrimaryAction = MobileAction & {
  icon?: 'forward' | 'send';
};

type MobileActionBarProps = {
  back?: MobileAction;
  save?: MobileAction;
  primary?: MobilePrimaryAction;
  isLoading?: boolean;
};

/** Labels collapse to their icon where a phone cannot fit all three actions. */
const COLLAPSING_LABEL = { display: { xs: 'none', sm: 'inline' } };

type QuietActionProps = {
  action: MobileAction;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  dataCy: string;
};

function QuietAction({ action, startIcon, endIcon, dataCy }: QuietActionProps) {
  return (
    <Tooltip title={action.label}>
      <Box component="span" sx={{ flexShrink: 0 }}>
        <Button
          variant="quiet"
          onClick={action.onClick}
          disabled={action.disabled}
          startIcon={startIcon}
          endIcon={endIcon}
          aria-label={action.label}
          data-cy={dataCy}
          sx={(theme) => ({
            minHeight: minTouchTarget(theme),
            minWidth: minTouchTarget(theme),
            paddingX: { xs: 0, sm: 1.5 },
            borderRadius: 1,
            fontWeight: 500,
            fontSize: 14,
            lineHeight: 1,
            letterSpacing: '.03em',
            backgroundColor: 'rgba(0,0,0,.02)',
            '&.Mui-disabled': { backgroundColor: 'transparent' },
            '& .MuiButton-startIcon, & .MuiButton-endIcon': {
              marginX: { xs: 0, sm: 0.5 },
            },
          })}
        >
          <Box component="span" sx={COLLAPSING_LABEL}>
            {action.label}
          </Box>
        </Button>
      </Box>
    </Tooltip>
  );
}

export default function MobileActionBar({
  back,
  save,
  primary,
  isLoading = false,
}: MobileActionBarProps) {
  return (
    <Box
      data-cy="mobile-action-bar"
      sx={{
        position: 'sticky',
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        paddingTop: 1.25,
        paddingBottom: 2,
        backgroundColor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      {back && (
        <QuietAction
          action={back}
          startIcon={<ChevronLeftIcon />}
          dataCy="mobile-action-back"
        />
      )}
      {save && (
        <QuietAction
          action={save}
          startIcon={<SaveOutlinedIcon />}
          dataCy="mobile-action-save"
        />
      )}
      {primary && (
        <Button
          onClick={primary.onClick}
          disabled={primary.disabled}
          loading={isLoading}
          startIcon={primary.icon === 'send' ? <SendIcon /> : undefined}
          endIcon={
            primary.icon === 'forward' ? <ArrowForwardIcon /> : undefined
          }
          data-cy="mobile-action-primary"
          sx={(theme) => ({
            flex: 1,
            minWidth: 0,
            minHeight: minTouchTarget(theme),
            borderRadius: 1,
            fontWeight: 500,
            fontSize: 15,
            lineHeight: 1,
            letterSpacing: '.03em',
            boxShadow: '0 1px 3px rgba(0,0,0,.24)',
          })}
        >
          {primary.label}
        </Button>
      )}
    </Box>
  );
}

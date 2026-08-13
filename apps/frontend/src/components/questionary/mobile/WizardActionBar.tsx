import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SendIcon from '@mui/icons-material/Send';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';

import { minTouchTarget } from 'hooks/common/useResponsive';

type WizardAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

type WizardPrimaryAction = WizardAction & {
  icon?: 'forward' | 'send';
};

type WizardActionBarProps = {
  back?: WizardAction;
  save?: WizardAction;
  primary?: WizardPrimaryAction;
  readOnly?: boolean;
  isLoading?: boolean;
};

/** Labels collapse to their icon where a phone cannot fit all three actions. */
const COLLAPSING_LABEL = { display: { xs: 'none', sm: 'inline' } };

type QuietActionProps = {
  action: WizardAction;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  grow?: boolean;
  dataCy: string;
};

function QuietAction({
  action,
  startIcon,
  endIcon,
  grow = false,
  dataCy,
}: QuietActionProps) {
  return (
    <Tooltip title={action.label}>
      <Box
        component="span"
        sx={grow ? { flex: 1, minWidth: 0 } : { flexShrink: 0 }}
      >
        <Button
          variant="quiet"
          onClick={action.onClick}
          disabled={action.disabled}
          startIcon={startIcon}
          endIcon={endIcon}
          aria-label={action.label}
          data-cy={dataCy}
          fullWidth={grow}
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

export default function WizardActionBar({
  back,
  save,
  primary,
  readOnly = false,
  isLoading = false,
}: WizardActionBarProps) {
  return (
    <Box
      data-cy="wizard-action-bar"
      sx={{
        position: 'sticky',
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        paddingY: 1.25,
        backgroundColor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      {back && (
        <QuietAction
          action={back}
          startIcon={<ChevronLeftIcon />}
          grow={readOnly}
          dataCy="wizard-action-back"
        />
      )}
      {!readOnly && save && (
        <QuietAction
          action={save}
          startIcon={<SaveOutlinedIcon />}
          dataCy="wizard-action-save"
        />
      )}
      {primary &&
        (readOnly ? (
          <QuietAction
            action={primary}
            endIcon={<ChevronRightIcon />}
            grow
            dataCy="wizard-action-primary"
          />
        ) : (
          <Button
            onClick={primary.onClick}
            disabled={primary.disabled}
            loading={isLoading}
            startIcon={primary.icon === 'send' ? <SendIcon /> : undefined}
            endIcon={primary.icon === 'send' ? undefined : <ArrowForwardIcon />}
            data-cy="wizard-action-primary"
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
        ))}
    </Box>
  );
}

import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Stack } from '@mui/material';
import React, { useEffect, useRef } from 'react';

import MobileActionBar from 'components/common/mobile/MobileActionBar';
import UOLoader from 'components/common/UOLoader';
import { useIsMobile } from 'hooks/common/useResponsive';

import { useWizardHeader } from './mobile/WizardHeaderContext';

export type WizardAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  isBusy?: boolean;
};

export type WizardActions = {
  back?: WizardAction;
  reset?: WizardAction;
  save?: WizardAction;
  primary?: WizardAction & { icon?: 'forward' | 'send' };
};

const NavigationFragment = (props: {
  isLoading?: boolean;
  disabled?: boolean;
  actions?: WizardActions;
  children?: React.ReactNode;
}) => {
  const isMobile = useIsMobile();
  const header = useWizardHeader();
  const setMenuItems = header?.setMenuItems;

  const reset = props.actions?.reset;
  const resetRef = useRef(reset);

  useEffect(() => {
    resetRef.current = reset;
  });

  const resetLabel =
    isMobile && !props.disabled && !reset?.disabled ? reset?.label : undefined;

  useEffect(() => {
    if (!setMenuItems) {
      return;
    }

    setMenuItems(
      resetLabel
        ? [
            {
              key: 'reset',
              label: resetLabel,
              icon: <RestartAltIcon />,
              destructive: true,
              onClick: () => resetRef.current?.onClick(),
            },
          ]
        : []
    );

    return () => setMenuItems([]);
  }, [setMenuItems, resetLabel]);

  if (props.disabled) {
    return null;
  }

  if (isMobile && props.actions) {
    const { back, save, primary } = props.actions;

    return (
      <MobileActionBar
        back={back}
        save={save}
        primary={primary}
        isLoading={props.isLoading}
      />
    );
  }

  return (
    <Stack
      direction={isMobile ? 'column' : 'row'}
      spacing={1}
      useFlexGap
      data-cy="navigation-fragment"
      sx={{
        justifyContent: 'flex-end',
        marginTop: 3,
        alignItems: 'center',
      }}
    >
      {props.isLoading && <UOLoader size="2em" />}
      {props.children}
    </Stack>
  );
};

export default NavigationFragment;

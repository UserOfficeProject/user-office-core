import StepButton from '@mui/material/StepButton';
import React, { PropsWithChildren } from 'react';

export function QuestionaryStepButton(
  props: PropsWithChildren<{
    onClick: () => Promise<void>;
    active?: boolean;
    clickable?: boolean;
    readonly: boolean;
  }>
) {
  // NOTE: Exluding readonly because it fires console warning when passed to StepButton component.
  const { readonly, ...propsWithoutReadonly } = props;

  return (
    <StepButton
      {...propsWithoutReadonly}
      sx={(theme) => ({
        ...(propsWithoutReadonly.active
          ? {
              '& SVG': {
                color: theme.palette.secondary.main + '!important',
              },
              '& .MuiStepIcon-text': {
                fill: theme.palette.secondary.contrastText,
              },
            }
          : !readonly && {
              '& SVG': {
                color: theme.palette.primary.main + '!important',
              },
              '& .MuiStepIcon-text': {
                fill: theme.palette.primary.contrastText,
              },
            }),
      })}
    >
      {props.children}
    </StepButton>
  );
}

import StepButton from '@material-ui/core/StepButton';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { PropsWithChildren } from 'react';

export function QuestionaryStepButton(
  props: PropsWithChildren<{
    onClick: () => Promise<void>;
    active?: boolean;
    completed?: boolean;
    clickable?: boolean;
    readonly: boolean;
  }>
) {
  const classes = makeStyles((theme) => ({
    active: {
      '& SVG': {
        color: theme.palette.secondary.main + '!important',
      },
    },
    editable: {
      '& SVG': {
        color: theme.palette.primary.main + '!important',
      },
    },
  }))();

  // NOTE: Exluding readonly because it fires console warning when passed to StepButton component.
  const { readonly, ...propsWithoutReadonly } = props;

  const buttonClasses = [];

  if (propsWithoutReadonly.active) {
    buttonClasses.push(classes.active);
  } else if (!readonly) {
    buttonClasses.push(classes.editable);
  }

  return (
    <StepButton {...propsWithoutReadonly} className={buttonClasses.join(' ')}>
      {props.children}
    </StepButton>
  );
}

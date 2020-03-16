import { Box, Paper, styled, Container } from '@material-ui/core';
import React from 'react';

import { getTheme } from '../theme';

export const StyledPaper = styled(({ ...other }) => <Paper {...other} />)({
  margin: props => getSpacing(props.margin, [3, 0]),
  padding: props => getSpacing(props.margin, [2]),
  [getTheme().breakpoints.up(600 + getTheme().spacing(3) * 2)]: {
    margin: props => getSpacing(props.margin, [6, 0]),
    padding: props => getSpacing(props.padding, [3]),
  },
});

export const FormWrapper = styled(({ ...other }) => <Box {...other} />)({
  margin: props => getSpacing(props.margin, [8]),
  display: props => props.display || 'flex',
  flexDirection: props => props.flexDirection || 'column',
  alignItems: props => props.alignItems || 'center',
  overflow: props => props.overflow || 'auto',
});

export const ContentContainer = styled(({ ...other }) => (
  <Container maxWidth="lg" {...other} />
))({
  padding: props => getSpacing(props.padding, [4, 0]),
});

export const ButtonContainer = styled(({ ...other }) => <div {...other} />)({
  display: 'flex',
  justifyContent: 'flex-end',
});

const getSpacing = (userValue: any, defaultValue: any) => {
  return getTheme().spacing.apply(getTheme(), userValue || defaultValue);
};

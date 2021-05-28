import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import styled from '@material-ui/core/styles/styled';
import React from 'react';

import { getTheme } from '../theme';

type PaddingMarginType = [number, number, number, number];
type FlexDirectionType =
  | '-moz-initial'
  | 'inherit'
  | 'initial'
  | 'revert'
  | 'unset'
  | 'column'
  | 'column-reverse'
  | 'row'
  | 'row-reverse'
  | undefined;

const getSpacing = (
  userValue: PaddingMarginType,
  defaultValue: [number, number?, number?, number?]
): string => {
  // eslint-disable-next-line prefer-spread
  return getTheme().spacing.apply(getTheme(), userValue || defaultValue);
};

export const StyledPaper = styled(({ ...other }) => <Paper {...other} />)({
  margin: (props: Record<string, PaddingMarginType | unknown>) =>
    getSpacing(props.margin as PaddingMarginType, [3, 0]),
  padding: (props) => getSpacing(props.padding as PaddingMarginType, [2]),
  [getTheme().breakpoints.up(600 + getTheme().spacing(3) * 2)]: {
    margin: (props) => getSpacing(props.margin as PaddingMarginType, [6, 0]),
    padding: (props) => getSpacing(props.padding as PaddingMarginType, [3]),
  },
});

export const FormWrapper = styled(({ ...other }) => <Box {...other} />)({
  margin: (
    props: Record<
      string,
      PaddingMarginType | string | FlexDirectionType | unknown
    >
  ) => getSpacing(props.margin as PaddingMarginType, [8]),
  display: (props) => (props.display as string) || 'flex',
  flexDirection: (props) =>
    (props.flexDirection as FlexDirectionType) || 'column',
  alignItems: (props) => (props.alignItems as string) || 'center',
  overflow: (props) => (props.overflow as string) || 'auto',
});

export const ContentContainer = styled(({ maxWidth = false, ...other }) => (
  <Container maxWidth={maxWidth} {...other} />
))({
  padding: (props: Record<string, PaddingMarginType | unknown>) =>
    getSpacing(props.padding as PaddingMarginType, [2, 2]),
});

export const ButtonContainer = styled(({ ...other }) => <div {...other} />)({
  display: 'flex',
  justifyContent: 'flex-end',
});

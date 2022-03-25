import Box from '@mui/material/Box';
import Container, { ContainerProps } from '@mui/material/Container';
import Paper, { PaperProps } from '@mui/material/Paper';
import { Theme, styled } from '@mui/material/styles';
import { BoxProps } from '@mui/system';

const getValueFromArrayProperty = (
  prop: [number, number?, number?, number?],
  theme: Theme
) =>
  prop.map((item) => `${item !== undefined && theme.spacing(item)}`).join(' ');

type StyledComponentProps = {
  margin?: [number, number?, number?, number?];
  padding?: [number, number?, number?, number?];
};

export const StyledPaper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'margin' && prop !== 'padding',
})<PaperProps & StyledComponentProps>(({ margin, padding, theme }) => {
  const marginValue: string | number | undefined = Array.isArray(margin)
    ? getValueFromArrayProperty(margin, theme)
    : margin;
  const paddingValue: string | number | undefined = Array.isArray(padding)
    ? getValueFromArrayProperty(padding, theme)
    : padding;

  return {
    margin: marginValue || theme.spacing(2, 0),
    padding: paddingValue || theme.spacing(2),
    [theme.breakpoints.up(600)]: {
      margin: marginValue || theme.spacing(4, 0),
      padding: paddingValue || theme.spacing(3),
    },
  };
});

export const StyledFormWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'margin' && prop !== 'padding',
})<BoxProps & StyledComponentProps>(({ margin, theme }) => {
  const marginValue: string | number | undefined = Array.isArray(margin)
    ? getValueFromArrayProperty(margin, theme)
    : margin;

  return {
    margin: marginValue || theme.spacing(3, 0),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'auto',
  };
});

export const StyledContainer = styled(Container, {
  shouldForwardProp: (prop) => prop !== 'margin' && prop !== 'padding',
})<ContainerProps & StyledComponentProps>(({ padding, theme }) => {
  const paddingValue: string | number | undefined = Array.isArray(padding)
    ? getValueFromArrayProperty(padding, theme)
    : padding;

  return {
    padding: paddingValue || theme.spacing(2, 2),
  };
});

export const StyledButtonContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
});

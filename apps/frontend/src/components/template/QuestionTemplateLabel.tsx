import { InputLabel } from '@mui/material';
import React from 'react';

export default function TemplateEditLabel(props: { pageType: string }) {
  if (props.pageType === 'Template') {
    return (
      <InputLabel
        sx={(theme) => ({
          color: theme.palette.primary.main,
          fontSize: 'medium',
          marginRight: 20,
        })}
      >
        You are editing the question as it appears on the current template
      </InputLabel>
    );
  }

  return (
    <InputLabel
      sx={(theme) => ({
        color: theme.palette.primary.main,
        fontSize: 'medium',
        marginRight: 53,
      })}
    >
      You are editing the question
    </InputLabel>
  );
}

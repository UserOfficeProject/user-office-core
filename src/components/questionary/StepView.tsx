import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import * as React from 'react';

export interface StepViewProps {
  title: string;
  content: JSX.Element;
}

export function StepView(props: StepViewProps) {
  const { title, content } = props;

  return (
    <Accordion
      defaultExpanded
      disableGutters
      elevation={0}
      square
      sx={(theme) => ({
        ':before': { display: 'none' },
        border: `1px solid ${theme.palette.grey[200]}`,
      })}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={(theme) => ({
          background: theme.palette.grey[100],
        })}
      >
        <Typography variant="h6">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ marginBottom: '10px' }}>
        {content}
      </AccordionDetails>
    </Accordion>
  );
}

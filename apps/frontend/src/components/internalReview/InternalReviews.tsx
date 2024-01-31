import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';

import InternalReviewsTable from './InternalReviewsTable';

type InternalReviewsProps = {
  technicalReviewId: number;
  technicalReviewSubmitted: boolean;
  proposalPk: number;
};

const useStyles = makeStyles((theme) => ({
  container: {
    marginBottom: theme.spacing(2),
  },
}));

const InternalReviews = ({
  technicalReviewId,
  technicalReviewSubmitted,
  proposalPk,
}: InternalReviewsProps) => {
  const classes = useStyles();

  return (
    <Accordion
      className={classes.container}
      data-cy="internal-reviews-accordion"
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography sx={{ width: '33%', flexShrink: 0 }}>
          Internal reviews
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Expand to see the internal reviews and reviewers
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <InternalReviewsTable
          technicalReviewId={technicalReviewId}
          technicalReviewSubmitted={technicalReviewSubmitted}
          proposalPk={proposalPk}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default InternalReviews;

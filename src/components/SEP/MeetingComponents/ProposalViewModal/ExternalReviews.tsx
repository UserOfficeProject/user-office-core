import {
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  makeStyles,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';

import { Review } from 'generated/sdk';
import { StyledPaper } from 'styles/StyledComponents';

type ExternalReviewsProps = {
  reviews: Review[];
};

const ExternalReviews: React.FC<ExternalReviewsProps> = ({ reviews }) => {
  const classes = makeStyles(theme => ({
    heading: {
      marginTop: theme.spacing(2),
    },
    textBold: {
      fontWeight: 'bold',
    },
  }))();

  return (
    <div data-cy="SEP-meeting-components-external-reviews">
      <StyledPaper margin={[0]}>
        <Typography variant="h6" className={classes.heading} gutterBottom>
          External reviews
        </Typography>
        <Table>
          <TableBody>
            <TableRow key="externalReviewsHeading">
              <TableCell className={classes.textBold}>Name</TableCell>
              <TableCell className={classes.textBold}>Rank</TableCell>
              <TableCell className={classes.textBold}>Comment</TableCell>
            </TableRow>
            {reviews.map(review => (
              <TableRow key={`externalReviews_${review.id}_${review.userID}`}>
                <TableCell>{`${review.reviewer?.firstname} ${review.reviewer?.lastname}`}</TableCell>
                <TableCell>{review.grade || '-'}</TableCell>
                <TableCell>{review.comment || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledPaper>
    </div>
  );
};

ExternalReviews.propTypes = {
  reviews: PropTypes.array.isRequired,
};

export default ExternalReviews;

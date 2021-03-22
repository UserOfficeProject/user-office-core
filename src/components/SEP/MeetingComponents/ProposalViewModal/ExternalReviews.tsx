import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import React from 'react';

import { Review } from 'generated/sdk';
import { StyledPaper } from 'styles/StyledComponents';

const useStyles = makeStyles((theme) => ({
  heading: {
    marginTop: theme.spacing(2),
  },
  textBold: {
    fontWeight: 'bold',
  },
}));

type ExternalReviewsProps = {
  reviews: Review[] | null;
};

const ExternalReviews: React.FC<ExternalReviewsProps> = ({ reviews }) => {
  const classes = useStyles();

  return (
    <div data-cy="SEP-meeting-components-external-reviews">
      <StyledPaper margin={[0]}>
        <Typography variant="h6" className={classes.heading} gutterBottom>
          External reviews
        </Typography>
        <Table>
          <TableBody>
            <TableRow key="externalReviewsHeading">
              <TableCell width="50%" className={classes.textBold}>
                Name
              </TableCell>
              <TableCell width="25%" className={classes.textBold}>
                Score
              </TableCell>
              <TableCell className={classes.textBold}>Comment</TableCell>
            </TableRow>
            {reviews?.map((review) => (
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
  reviews: PropTypes.array,
};

export default ExternalReviews;

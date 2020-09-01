import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import React from 'react';

import { TechnicalReview } from 'generated/sdk';
import { StyledPaper } from 'styles/StyledComponents';

type TechnicalReviewInfoProps = {
  technicalReview: TechnicalReview | null;
};

const TechnicalReviewInfo: React.FC<TechnicalReviewInfoProps> = ({
  technicalReview,
}) => {
  const classes = makeStyles(theme => ({
    heading: {
      marginTop: theme.spacing(2),
    },
    textBold: {
      fontWeight: 'bold',
    },
  }))();

  return (
    <div data-cy="SEP-meeting-components-technical-review">
      <StyledPaper margin={[2, 0]}>
        <Typography variant="h6" className={classes.heading} gutterBottom>
          Technical review info
        </Typography>
        <Table>
          <TableBody>
            <TableRow key="statusAndTime">
              <TableCell className={classes.textBold}>Status</TableCell>
              <TableCell>{technicalReview?.status || '-'}</TableCell>
              <TableCell className={classes.textBold}>
                Time allocation
              </TableCell>
              <TableCell>{technicalReview?.timeAllocation || '-'}</TableCell>
            </TableRow>
            <TableRow key="comments">
              <TableCell className={classes.textBold}>
                Internal comment
              </TableCell>
              <TableCell>{technicalReview?.comment || '-'}</TableCell>
              <TableCell className={classes.textBold}>Public comment</TableCell>
              <TableCell>{technicalReview?.publicComment || '-'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </StyledPaper>
    </div>
  );
};

TechnicalReviewInfo.propTypes = {
  technicalReview: PropTypes.any,
};

export default TechnicalReviewInfo;

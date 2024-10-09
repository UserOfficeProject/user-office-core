import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import React from 'react';

import ReviewQuestionaryReview from 'components/review/ReviewQuestionaryReview';
import { Fap, Review } from 'generated/sdk';
import ButtonWithDialog from 'hooks/common/ButtonWithDialog';
import { StyledPaper } from 'styles/StyledComponents';
import { BOLD_TEXT_STYLE } from 'utils/helperFunctions';
import { getFullUserName } from 'utils/user';

type ExternalReviewsProps = {
  reviews: Review[] | null;
  faps?: Pick<Fap, 'id' | 'code'>[] | null;
};

const ExternalReviews = ({ reviews, faps }: ExternalReviewsProps) => (
  <div data-cy="Fap-meeting-components-external-reviews">
    <StyledPaper margin={[0]}>
      <Typography
        variant="h6"
        component="h2"
        sx={(theme) => ({
          marginTop: theme.spacing(2),
        })}
        gutterBottom
      >
        External reviews
      </Typography>
      <TableContainer>
        <Table sx={{ minWidth: 500 }}>
          <TableBody>
            <TableRow key="externalReviewsHeading">
              <TableCell width="50%" sx={BOLD_TEXT_STYLE}>
                Name
              </TableCell>
              <TableCell width="25%" sx={BOLD_TEXT_STYLE}>
                Score
              </TableCell>
              <TableCell width="25%" sx={BOLD_TEXT_STYLE}>
                Review Summary
              </TableCell>
              <TableCell sx={BOLD_TEXT_STYLE}>Comment</TableCell>
            </TableRow>
            {reviews?.map((review) => (
              <TableRow key={`externalReviews_${review.id}_${review.userID}`}>
                <TableCell>{getFullUserName(review.reviewer)}</TableCell>
                <TableCell>{review.grade || '-'}</TableCell>
                <TableCell>
                  <ButtonWithDialog label="Show" title="Show">
                    <ReviewQuestionaryReview data={review} />
                  </ButtonWithDialog>
                </TableCell>
                <TableCell
                  dangerouslySetInnerHTML={{
                    __html: review?.comment || '-',
                  }}
                />
                <TableCell>
                  {faps?.find((f) => f.id === review.fapID)?.code || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </StyledPaper>
  </div>
);

export default ExternalReviews;

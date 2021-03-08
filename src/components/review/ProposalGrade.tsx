import { proposalGradeValidationSchema } from '@esss-swap/duo-validation/lib/Review';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Field, Form, Formik, useFormikContext } from 'formik';
import { TextField, Select } from 'formik-material-ui';
import React, { useState, useEffect, useContext } from 'react';
import { Prompt } from 'react-router';

import UOLoader from 'components/common/UOLoader';
import { ReviewAndAssignmentContext } from 'context/ReviewAndAssignmentContextProvider';
import {
  ReviewStatus,
  CoreReviewFragment,
  ReviewWithNextProposalStatus,
} from 'generated/sdk';
import { useReviewData } from 'hooks/review/useReviewData';
import { ButtonContainer } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

const useStyles = makeStyles(() => ({
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginLeft: '10px',
  },
}));

type ProposalGradeProps = {
  reviewID: number;
  onChange: FunctionType;
  sepId?: number | null;
  confirm: WithConfirmType;
};

type GradeFormType = {
  grade: string | number;
  comment: string;
  saveOnly: boolean;
};

const ProposalGrade: React.FC<ProposalGradeProps> = ({
  reviewID,
  onChange,
  sepId,
  confirm,
}) => {
  const classes = useStyles();
  const { reviewData } = useReviewData(reviewID, sepId);
  const { api } = useDataApiWithFeedback();
  const [review, setReview] = useState<CoreReviewFragment | null | undefined>(
    null
  );
  const { setAssignmentReview } = useContext(ReviewAndAssignmentContext);
  const [shouldSubmit, setShouldSubmit] = useState(false);

  useEffect(() => {
    setReview(reviewData);
  }, [reviewData]);

  if (!review) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  const PromptIfDirty = () => {
    const formik = useFormikContext();

    return (
      <Prompt
        when={formik.dirty && formik.submitCount === 0}
        message="Changes you recently made in this tab will be lost! Are you sure?"
      />
    );
  };

  const isDisabled = (isSubmitting: boolean) =>
    isSubmitting || review.status === ReviewStatus.SUBMITTED;

  const handleSubmit = async (values: GradeFormType) => {
    const data = await api(shouldSubmit ? 'Submitted' : 'Updated').addReview({
      reviewID: reviewID,
      //This should be taken care of in validationSchema
      grade: +values.grade,
      comment: values.comment ? values.comment : '',
      status: shouldSubmit ? ReviewStatus.SUBMITTED : ReviewStatus.DRAFT,
      sepID: review.sepID,
    });

    if (!data.addReview.error) {
      setReview(data.addReview.review as CoreReviewFragment);
      setAssignmentReview(
        data.addReview.review as ReviewWithNextProposalStatus
      );
    }
    onChange();
  };

  return (
    <Formik
      initialValues={{
        grade: review.grade || '',
        comment: review.comment || '',
        saveOnly: true,
      }}
      onSubmit={async (values): Promise<void> => {
        if (shouldSubmit) {
          confirm(
            async () => {
              await handleSubmit(values);
            },
            {
              title: 'Please confirm',
              description:
                'I am aware that no further changes to the grade are possible after submission.',
            }
          )();
        } else {
          await handleSubmit(values);
        }
      }}
      validationSchema={proposalGradeValidationSchema}
    >
      {({ isSubmitting }) => (
        <Form>
          <PromptIfDirty />
          <CssBaseline />
          <Field
            name="comment"
            label="Comment"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            multiline
            rowsMax="16"
            rows="4"
            disabled={isDisabled(isSubmitting)}
          />
          <InputLabel htmlFor="grade-proposal">Grade</InputLabel>
          <Field
            name="grade"
            inputProps={{
              id: 'grade-proposal',
            }}
            component={Select}
            disabled={isDisabled(isSubmitting)}
            required
          >
            {[...Array(10)].map((e, i) => (
              <MenuItem key={i} value={i + 1}>
                {i + 1}
              </MenuItem>
            ))}
          </Field>
          <ButtonContainer>
            {isSubmitting && (
              <Box display="flex" alignItems="center" mx={1}>
                <UOLoader buttonSized />
              </Box>
            )}
            <Button
              disabled={isDisabled(isSubmitting)}
              variant="contained"
              color="secondary"
              type="submit"
              onClick={() => setShouldSubmit(false)}
            >
              Save
            </Button>
            <Button
              className={classes.button}
              disabled={isDisabled(isSubmitting)}
              variant="contained"
              color="primary"
              type="submit"
              onClick={() => setShouldSubmit(true)}
            >
              {review.status === ReviewStatus.SUBMITTED
                ? 'Submitted'
                : 'Submit'}
            </Button>
          </ButtonContainer>
        </Form>
      )}
    </Formik>
  );
};

export default withConfirm(ProposalGrade);

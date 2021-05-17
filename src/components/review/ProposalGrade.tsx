import { proposalGradeValidationSchema } from '@esss-swap/duo-validation/lib/Review';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import InputLabel from '@material-ui/core/InputLabel';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Editor } from '@tinymce/tinymce-react';
import { Field, Form, Formik, useFormikContext } from 'formik';
import React, { useState, useContext } from 'react';
import { Prompt } from 'react-router';

import FormikUICustomSelect from 'components/common/FormikUICustomSelect';
import UOLoader from 'components/common/UOLoader';
import { ReviewAndAssignmentContext } from 'context/ReviewAndAssignmentContextProvider';
import {
  ReviewStatus,
  ReviewWithNextProposalStatus,
  Review,
} from 'generated/sdk';
import { ButtonContainer } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { FunctionType } from 'utils/utilTypes';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

const useStyles = makeStyles((theme) => ({
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginLeft: theme.spacing(1),
  },
  gradeInput: {
    marginTop: theme.spacing(1),
  },
}));

type ProposalGradeProps = {
  review: Review | null;
  setReview: React.Dispatch<React.SetStateAction<Review | null>>;
  onChange: FunctionType;
  confirm: WithConfirmType;
};

type GradeFormType = {
  grade: string | number;
  comment: string;
  saveOnly: boolean;
};

const ProposalGrade: React.FC<ProposalGradeProps> = ({
  review,
  setReview,
  onChange,
  confirm,
}) => {
  const classes = useStyles();
  const { api } = useDataApiWithFeedback();
  const { setAssignmentReview } = useContext(ReviewAndAssignmentContext);
  const [shouldSubmit, setShouldSubmit] = useState(false);

  if (!review) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  const initialValues = {
    grade: review.grade?.toString() || '',
    comment: review.comment || '',
    saveOnly: true,
  };

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
      reviewID: review.id,
      //This should be taken care of in validationSchema
      grade: +values.grade,
      comment: values.comment ? values.comment : '',
      status: shouldSubmit ? ReviewStatus.SUBMITTED : ReviewStatus.DRAFT,
      sepID: review.sepID,
    });

    if (!data.addReview.rejection && data.addReview.review) {
      setReview({
        ...review,
        comment: data.addReview.review.comment,
        grade: data.addReview.review.grade,
        status: data.addReview.review.status,
      });
      setAssignmentReview(
        data.addReview.review as ReviewWithNextProposalStatus
      );
    }
    onChange();
  };

  return (
    <Formik
      initialValues={initialValues}
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
      {({ isSubmitting, setFieldValue }) => (
        <Form>
          <PromptIfDirty />
          <CssBaseline />
          <InputLabel htmlFor="comment" shrink margin="dense">
            Comment
          </InputLabel>
          <Editor
            id="comment"
            initialValue={initialValues.comment}
            init={{
              skin: false,
              content_css: false,
              plugins: ['link', 'preview', 'code', 'charmap', 'wordcount'],
              toolbar: 'bold italic',
              branding: false,
            }}
            onEditorChange={(content: string) =>
              setFieldValue('comment', content)
            }
            disabled={isDisabled(isSubmitting)}
          />
          <Box marginTop={1} width={150}>
            <Field
              name="grade"
              label="Grade"
              fullWidth
              component={FormikUICustomSelect}
              inputProps={{
                id: 'grade-proposal',
              }}
              availableOptions={[...Array(10)].map((e, i) =>
                (i + 1).toString()
              )}
              disabled={isDisabled(isSubmitting)}
              required
              data-cy="grade-proposal"
            />
          </Box>
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

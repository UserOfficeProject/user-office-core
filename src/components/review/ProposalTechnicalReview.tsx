import { proposalTechnicalReviewValidationSchema } from '@esss-swap/duo-validation/lib/Review';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { Editor } from '@tinymce/tinymce-react';
import { Formik, Form, Field, useFormikContext } from 'formik';
import { TextField } from 'formik-material-ui';
import React, { useContext, useState } from 'react';
import { Prompt } from 'react-router';

import { useCheckAccess } from 'components/common/Can';
import FormikDropdown from 'components/common/FormikDropdown';
import FormikUICustomCheckbox from 'components/common/FormikUICustomCheckbox';
import { UserContext } from 'context/UserContextProvider';
import {
  TechnicalReviewStatus,
  CoreTechnicalReviewFragment,
  UserRole,
  Proposal,
} from 'generated/sdk';
import { ButtonContainer } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

const useStyles = makeStyles((theme) => ({
  submitButton: {
    marginLeft: theme.spacing(1),
  },
}));

type TechnicalReviewFormType = {
  status: string;
  timeAllocation: string | number;
  comment: string;
  publicComment: string;
  submitted: boolean;
};

type ProposalTechnicalReviewProps = {
  data: CoreTechnicalReviewFragment | null | undefined;
  setReview: (data: CoreTechnicalReviewFragment) => void;
  proposal: Proposal;
  confirm: WithConfirmType;
};

const ProposalTechnicalReview = ({
  proposal,
  data,
  setReview,
  confirm,
}: ProposalTechnicalReviewProps) => {
  const { api } = useDataApiWithFeedback();
  const [shouldSubmit, setShouldSubmit] = useState(false);
  const classes = useStyles();
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const { user } = useContext(UserContext);

  const initialValues: TechnicalReviewFormType = {
    status: data?.status || '',
    timeAllocation: data?.timeAllocation || '',
    comment: data?.comment || '',
    publicComment: data?.publicComment || '',
    submitted: data?.submitted || false,
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

  const handleUpdateOrSubmit = async (
    values: TechnicalReviewFormType,
    method: 'submitTechnicalReview' | 'addTechnicalReview'
  ) => {
    const shouldSubmit =
      method === 'submitTechnicalReview' || (isUserOfficer && values.submitted);
    const successMessage = isUserOfficer
      ? `Technical review updated successfully!`
      : `Technical review ${
          shouldSubmit ? 'submitted' : 'updated'
        } successfully!`;

    const result = await api(successMessage)[method]({
      proposalID: proposal.id,
      timeAllocation: +values.timeAllocation,
      comment: values.comment,
      publicComment: values.publicComment,
      status: TechnicalReviewStatus[values.status as TechnicalReviewStatus],
      submitted: shouldSubmit,
      reviewerId: user.id,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(result as any)[method].error) {
      setReview({
        proposalID: data?.proposalID,
        timeAllocation: +values.timeAllocation,
        comment: values.comment,
        publicComment: values.publicComment,
        status: TechnicalReviewStatus[values.status as TechnicalReviewStatus],
        submitted: shouldSubmit,
      } as CoreTechnicalReviewFragment);
    }
  };

  const shouldDisableForm = (isSubmitting: boolean) =>
    (isSubmitting || data?.submitted) && !isUserOfficer;

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Technical Review
      </Typography>
      <Formik
        initialValues={initialValues}
        validationSchema={proposalTechnicalReviewValidationSchema}
        onSubmit={async (values): Promise<void> => {
          if (shouldSubmit) {
            if (!isUserOfficer) {
              confirm(
                async () => {
                  await handleUpdateOrSubmit(values, 'submitTechnicalReview');
                },
                {
                  title: 'Please confirm',
                  description:
                    'I am aware that no further changes to the technical review are possible after submission.',
                }
              )();
            } else {
              await handleUpdateOrSubmit(values, 'submitTechnicalReview');
            }
          } else {
            await handleUpdateOrSubmit(values, 'addTechnicalReview');
          }
        }}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form>
            <PromptIfDirty />
            <Grid container spacing={2}>
              <Grid item sm={6} xs={12}>
                <FormikDropdown
                  name="status"
                  label="Status"
                  items={[
                    { text: 'Feasible', value: TechnicalReviewStatus.FEASIBLE },
                    {
                      text: 'Partially feasible',
                      value: TechnicalReviewStatus.PARTIALLY_FEASIBLE,
                    },
                    {
                      text: 'Unfeasible',
                      value: TechnicalReviewStatus.UNFEASIBLE,
                    },
                  ]}
                  disabled={shouldDisableForm(isSubmitting)}
                  InputProps={{
                    'data-cy': 'technical-review-status',
                  }}
                  required
                />
              </Grid>
              <Grid item sm={6} xs={12}>
                <Field
                  name="timeAllocation"
                  label={`Time allocation(${proposal.call?.allocationTimeUnit})`}
                  type="number"
                  component={TextField}
                  margin="normal"
                  fullWidth
                  autoComplete="off"
                  data-cy="timeAllocation"
                  disabled={shouldDisableForm(isSubmitting)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <InputLabel htmlFor="comment" shrink margin="dense">
                  Internal comment
                </InputLabel>
                {/* NOTE: We are using Editor directly instead of FormikUICustomEditor with Formik Field component.
                    This is because FormikUICustomEditor is not updated properly when we set form field onEditorChange.
                    It works when we use onBlur on Editor but it is problematic to test that with Cypress,
                    because for some reason it is not firing the onBlur event and form is not updated.
                */}
                <Editor
                  id="comment"
                  initialValue={initialValues.comment}
                  init={{
                    skin: false,
                    content_css: false,
                    plugins: [
                      'link',
                      'preview',
                      'code',
                      'charmap',
                      'wordcount',
                    ],
                    toolbar: 'bold italic',
                    branding: false,
                  }}
                  onEditorChange={(content: string) =>
                    setFieldValue('comment', content)
                  }
                  disabled={shouldDisableForm(isSubmitting)}
                />
              </Grid>
              <Grid item xs={12}>
                <InputLabel htmlFor="publicComment" shrink margin="dense">
                  Comments for the review panel
                </InputLabel>
                <Editor
                  id="publicComment"
                  initialValue={initialValues.publicComment}
                  init={{
                    skin: false,
                    content_css: false,
                    plugins: [
                      'link',
                      'preview',
                      'code',
                      'charmap',
                      'wordcount',
                    ],
                    toolbar: 'bold italic',
                    branding: false,
                  }}
                  onEditorChange={(content: string) =>
                    setFieldValue('publicComment', content)
                  }
                  disabled={shouldDisableForm(isSubmitting)}
                />
              </Grid>

              <Grid item xs={12}>
                <ButtonContainer>
                  {isUserOfficer && (
                    <Field
                      id="submitted"
                      name="submitted"
                      component={FormikUICustomCheckbox}
                      label="Submitted"
                      color="primary"
                      disabled={isSubmitting}
                      data-cy="is-review-submitted"
                    />
                  )}
                  <Button
                    disabled={
                      shouldDisableForm(isSubmitting) ||
                      (isUserOfficer && isSubmitting)
                    }
                    type="submit"
                    onClick={() => setShouldSubmit(false)}
                    variant="contained"
                    color={isUserOfficer ? 'primary' : 'secondary'}
                    data-cy="save-technical-review"
                  >
                    Save
                  </Button>
                  {!isUserOfficer && (
                    <Button
                      disabled={isSubmitting || data?.submitted}
                      type="submit"
                      className={classes.submitButton}
                      onClick={() => setShouldSubmit(true)}
                      variant="contained"
                      color="primary"
                      data-cy="submit-technical-review"
                    >
                      {data?.submitted ? 'Submitted' : 'Submit'}
                    </Button>
                  )}
                </ButtonContainer>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default withConfirm(ProposalTechnicalReview);
